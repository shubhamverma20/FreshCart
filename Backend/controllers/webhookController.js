const WebhookEvent = require('../models/WebhookEvent');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Reservation = require('../models/Reservation');
const mongoose = require('mongoose');
const logger = require('../services/logger');
const { sendOrderConfirmationEmail } = require('../services/emailService');

exports.handleRazorpayWebhook = async (req, res) => {
    // req.body is already parsed to JSON by the verifyRazorpaySignature middleware
    const payload = req.body;
    const event = payload.event;
    
    // Idempotency Key: Use Razorpay's unique event ID
    const eventId = req.headers['x-razorpay-event-id'];

    if (!eventId) {
        logger.warn('Webhook request missing x-razorpay-event-id header');
        return res.status(400).json({ message: 'Missing event ID' });
    }

    try {
        // 1. Acquire Lock / Check Idempotency using findOneAndUpdate with upsert
        const webhookEvent = await WebhookEvent.findOneAndUpdate(
            { eventId },
            { 
                $setOnInsert: { 
                    eventId, 
                    event, 
                    payload, 
                    status: 'pending' 
                } 
            },
            { upsert: true, new: false } // new: false returns the document BEFORE the update if it existed
        );

        // If webhookEvent exists and status is already processed, return 200 immediately
        if (webhookEvent && webhookEvent.status === 'processed') {
            logger.info({ eventId }, 'Webhook already processed. Ignoring duplicate.');
            return res.status(200).json({ status: 'ok' });
        }
        
        // If it's pending (e.g. concurrent request), we could reject or just wait. 
        // For simplicity, we process it but rely on the MongoDB transaction to fail safely if data changed.

        // 2. Start Transaction for the actual logic
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const paymentEntity = payload.payload.payment.entity;
            const razorpayOrderId = paymentEntity.order_id;
            
            // Note: In some webhook events (like order.paid), the payload structure might differ slightly.
            // We use payment.captured as our primary trigger for fulfillment.

            if (event === 'payment.captured' || event === 'order.paid') {
                // Find order
                const order = await Order.findOne({ razorpayOrderId }).session(session);
                
                if (!order) {
                    // It's possible the webhook arrived BEFORE our frontend called /verify.
                    // This is why webhooks are critical. If the order doesn't exist yet, 
                    // we can't fulfill it. We log a warning. The ideal architecture would 
                    // create an order in "pending" state BEFORE initiating Razorpay. 
                    // Since our architecture creates the order ON success, a captured webhook 
                    // without an order implies the user dropped off before verify could be called.
                    // In this case, we MUST fulfill it via webhook!
                    
                    // Since we didn't create the Order pre-payment, we try to reconstruct it from Reservation
                    const reservation = await Reservation.findOne({ razorpayOrderId }).session(session);
                    
                    if (reservation) {
                        logger.info({ razorpayOrderId }, "Order not found but reservation exists. Fulfilling via webhook.");
                        // Deduct stock permanently
                        for (const item of reservation.items) {
                            await Product.findByIdAndUpdate(item.productId, {
                                $inc: { stock: -item.quantity, reservedStock: -item.quantity }
                            }, { session });
                        }
                        
                        // Delete reservation
                        await Reservation.deleteOne({ _id: reservation._id }).session(session);
                        
                        // We cannot create a full Order document here because we lack the user's shipping details 
                        // in the webhook payload (Razorpay doesn't store our custom shippingAddress unless passed in notes).
                        // In a production system, we store a "PendingOrder" before payment.
                        // For this implementation, we ensure stock is handled correctly.
                    }
                } else if (order.paymentStatus !== 'Paid') {
                    // Update existing order status if frontend hasn't done it yet
                    order.paymentStatus = 'Paid';
                    await order.save({ session });
                }
            } 
            else if (event === 'payment.failed') {
                const order = await Order.findOne({ razorpayOrderId }).session(session);
                if (order) {
                    order.paymentStatus = 'Failed';
                    await order.save({ session });
                }

                // Release inventory back
                const reservation = await Reservation.findOne({ razorpayOrderId }).session(session);
                if (reservation) {
                    for (const item of reservation.items) {
                        await Product.findByIdAndUpdate(item.productId, {
                            $inc: { reservedStock: -item.quantity }
                        }, { session });
                    }
                    await Reservation.deleteOne({ _id: reservation._id }).session(session);
                    logger.info({ razorpayOrderId }, "Inventory released via payment.failed webhook");
                }
            }

            await session.commitTransaction();
            session.endSession();

            // Mark webhook as processed
            await WebhookEvent.updateOne({ eventId }, { status: 'processed' });
            logger.info({ eventId, event }, 'Webhook processed successfully');
            
            res.status(200).json({ status: 'ok' });

        } catch (txnError) {
            await session.abortTransaction();
            session.endSession();
            throw txnError;
        }

    } catch (error) {
        logger.error({ err: error, eventId }, 'Error processing webhook');
        // Update event status to failed for debugging
        await WebhookEvent.updateOne({ eventId }, { status: 'failed', error: error.message });
        
        // Return 500 so Razorpay retries the webhook later
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
