const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendOrderConfirmationEmail } = require('../services/emailService');

// Helper to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
}

// Helper to generate a unique order ID
function generateOrderId() {
  return 'ORD-' + Math.floor(100000 + Math.random() * 900000) + 'X';
}

/**
 * Place a New Order
 */
exports.placeOrder = async (req, res) => {
  console.log("[Order Controller] Place Order Request received. Body:", JSON.stringify(req.body));

  try {
    const { userId, email, items, totalPrice, shippingAddress, paymentMethod } = req.body;

    // Payload Validations
    if (!email || !isValidEmail(email)) {
      console.warn(`[Order Controller] Place Order failed: Invalid email format (${email})`);
      return res.status(400).json({ message: 'A valid email address is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn("[Order Controller] Place Order failed: Items list is empty or not an array");
      return res.status(400).json({ message: 'Cart items cannot be empty' });
    }
    if (!totalPrice || typeof totalPrice !== 'number' || totalPrice <= 0) {
      console.warn(`[Order Controller] Place Order failed: Invalid total price (${totalPrice})`);
      return res.status(400).json({ message: 'Total price must be a positive number' });
    }
    if (!shippingAddress || !shippingAddress.trim()) {
      console.warn("[Order Controller] Place Order failed: Shipping address is missing");
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Validate cart items internal structure
    for (const item of items) {
      if (!item.name || !item.price || !item.quantity || item.quantity <= 0) {
        console.warn("[Order Controller] Place Order failed: Invalid item format inside items array:", JSON.stringify(item));
        return res.status(400).json({ message: 'Each item must contain a valid name, price, and positive quantity' });
      }
    }

    // Mock database check when offline
    if (mongoose.connection.readyState !== 1) {
      console.warn("[Order Controller] Database is offline. Running in Mock Mode for placeOrder.");
      const orderId = generateOrderId();
      console.log(`[Order Controller] Mock generated Order ID: ${orderId}`);
      
      const orderDetails = {
        orderId,
        items,
        totalPrice,
        shippingAddress,
        paymentMethod: paymentMethod || 'upi'
      };

      console.log(`[Order Controller] Triggering Order Confirmation Email to ${email} for order ${orderId}`);
      sendOrderConfirmationEmail(email, orderDetails).catch(err =>
        console.error("[Order Controller] Order Confirmation Email background error:", err.message)
      );

      return res.status(201).json({
        message: 'Order placed successfully (Mock Mode)! Confirmation email has been sent.',
        order: {
          userId: userId || 'mock-user-id',
          orderId,
          items,
          totalPrice,
          shippingAddress,
          paymentMethod: paymentMethod || 'upi',
          createdAt: new Date()
        }
      });
    }

    const orderId = generateOrderId();
    console.log(`[Order Controller] Generated unique Order ID: ${orderId}`);

    const newOrder = new Order({
      userId: userId || null,
      orderId,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod: paymentMethod || 'upi'
    });

    await newOrder.save();
    console.log(`[Order Controller] Order successfully saved to database: ${orderId}`);

    // Trigger Order Confirmation Email
    const orderDetails = {
      orderId,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod: paymentMethod || 'upi'
    };

    console.log(`[Order Controller] Triggering Order Confirmation Email to ${email} for order ${orderId}`);
    sendOrderConfirmationEmail(email, orderDetails).catch(err =>
      console.error("[Order Controller] Order Confirmation Email background error:", err.message)
    );

    res.status(201).json({
      message: 'Order placed successfully! Confirmation email has been sent.',
      order: newOrder
    });
  } catch (err) {
    console.error("[Order Controller] Place Order error:", err);
    res.status(500).json({ message: 'Something went wrong while placing order' });
  }
};
