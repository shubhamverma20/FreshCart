const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Reservation = require('../models/Reservation');
const mongoose = require('mongoose');
const { sendOrderConfirmationEmail } = require('../services/emailService');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('../services/logger');
const { z } = require('zod');

// Zod schema for order validation
const orderSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    productId: z.string().optional(),
    price: z.number(),
    quantity: z.number().positive(),
  })).min(1, "Cart cannot be empty"),
  email: z.string().email("Invalid email format").optional(),
});

// Helper to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
}

// Helper to generate a unique order ID
function generateOrderId() {
  return 'ORD-' + Math.floor(100000 + Math.random() * 900000) + 'X';
}

// Helper to calculate total amount securely
async function calculateOrderAmount(items) {
  let subtotal = 0;
  if (mongoose.connection.readyState === 1) {
    for (const item of items) {
      const product = await Product.findOne({ name: item.name });
      if (product) {
        subtotal += product.price * item.quantity;
      } else {
        subtotal += item.price * item.quantity;
      }
    }
  } else {
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }
  }
  const tax = Math.round(subtotal * 0.05);
  const delivery = subtotal > 0 ? 40 : 0;
  return subtotal + tax + delivery;
}

let mockOrders = [
  {
    orderId: 'ORD-9824X',
    email: 'rahul@example.com',
    items: [{ name: 'Fresh Organic Bananas', price: 80, quantity: 2 }],
    totalPrice: 680,
    shippingAddress: 'Rahul Sharma, 123 Shopping St, Pin: 400001, Phone: 9876543210',
    paymentMethod: 'upi',
    createdAt: new Date(),
    status: 'Processing'
  },
  {
    orderId: 'ORD-9823X',
    email: 'priya@example.com',
    items: [{ name: 'Whole Wheat Bread', price: 55, quantity: 1 }],
    totalPrice: 1240,
    shippingAddress: 'Priya Patel, Area Name, Pin: 400002, Phone: 9876543211',
    paymentMethod: 'card',
    createdAt: new Date(Date.now() - 3600000),
    status: 'Out for Delivery'
  },
  {
    orderId: 'ORD-9822X',
    email: 'amit@example.com',
    items: [{ name: 'Free Range Eggs', price: 60, quantity: 3 }],
    totalPrice: 450,
    shippingAddress: 'Amit Kumar, Road St, Pin: 400003, Phone: 9876543212',
    paymentMethod: 'cod',
    createdAt: new Date(Date.now() - 7200000),
    status: 'Delivered'
  }
];

/**
 * Create Cashfree Order Session
 */
exports.createCashfreeOrder = async (req, res) => {
  try {
    const { orderAmount, customerEmail, customerPhone, customerName } = req.body;
    
    // Ensure credentials exist
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      console.warn("[Cashfree] Missing API Keys. Using Mock payment_session_id.");
      // We return a mock session ID. The frontend must handle this gracefully if testing without keys.
      return res.status(200).json({ 
        payment_session_id: 'mock_session_' + Date.now(),
        order_id: generateOrderId(),
        isMock: true 
      });
    }

    const orderId = generateOrderId();
    const url = process.env.CASHFREE_ENV === 'PROD' 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders';

    const payload = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'CUST_' + Date.now(),
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_name: customerName || 'Guest'
      },
      order_meta: {
        return_url: 'http://localhost:5173/checkout?order_id={order_id}'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[Cashfree] API Error:', data);
      return res.status(400).json({ message: 'Failed to create payment session', error: data });
    }

    res.status(200).json({ 
      payment_session_id: data.payment_session_id, 
      order_id: orderId 
    });
  } catch (error) {
    console.error('[Cashfree] Create Order Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Create Razorpay Order
 */
exports.createRazorpayOrder = async (req, res) => {
  let session = null;
  try {
    const { items, email } = req.body;
    
    // 1. Zod Validation
    const validation = orderSchema.safeParse({ items, email });
    if (!validation.success) {
      logger.warn({ err: validation.error }, 'Invalid order data received');
      return res.status(400).json({ message: 'Invalid cart data', errors: validation.error.errors });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      logger.error("[Razorpay] Missing API Keys.");
      return res.status(500).json({ message: "Razorpay keys not configured." });
    }

    let calculatedTotal = 0;
    let reservationData = [];

    // 2. Start Transaction if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      session = await mongoose.startSession();
      session.startTransaction();

      for (const item of items) {
        // Find product by ID if provided, else by name
        let productQuery = item.productId ? { _id: item.productId } : { name: item.name };
        const product = await Product.findOne(productQuery).session(session);

        if (!product) {
          logger.warn(`Product not found in DB (fallback to cart data): ${item.name}`);
          calculatedTotal += item.price * item.quantity;
          // Skip stock reservation for mock products
          continue;
        }

        const availableStock = product.stock - (product.reservedStock || 0);
        if (availableStock < item.quantity) {
          logger.warn(`Insufficient stock for ${item.name}. Available: ${availableStock}, Requested: ${item.quantity}`);
          throw new Error(`Insufficient stock for ${item.name}`);
        }

        calculatedTotal += product.price * item.quantity;

        // Increment reserved stock
        product.reservedStock = (product.reservedStock || 0) + item.quantity;
        await product.save({ session });
        
        reservationData.push({
          productId: product._id,
          quantity: item.quantity
        });
      }
    } else {
      // Mock mode fallback for total calculation
      calculatedTotal = await calculateOrderAmount(items);
    }

    const tax = Math.round(calculatedTotal * 0.05);
    const delivery = calculatedTotal > 0 ? 40 : 0;
    calculatedTotal = calculatedTotal + tax + delivery;

    // 3. Create Razorpay Order
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: calculatedTotal * 100, // Razorpay works in paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await instance.orders.create(options);
    
    // 4. Save Reservation Document (TTL 15 mins)
    if (session) {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      await Reservation.create([{
        razorpayOrderId: order.id,
        items: reservationData,
        expiresAt
      }], { session });

      await session.commitTransaction();
      session.endSession();
      logger.info({ razorpayOrderId: order.id }, 'Order created and inventory reserved');
    }

    res.status(200).json({ 
      success: true, 
      order, 
      key_id: process.env.RAZORPAY_KEY_ID,
      calculatedTotal
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    logger.error({ err: error }, 'Create Order Error');
    const errorMsg = error.message || (error.error && error.error.description) || 'Internal Server Error';
    res.status((errorMsg.includes('stock')) ? 400 : 500).json({ 
      message: errorMsg 
    });
  }
};

/**
 * Verify Razorpay Payment
 */
exports.verifyRazorpayPayment = async (req, res) => {
  let session = null;
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Signature verified, save order to DB
      if (mongoose.connection.readyState !== 1) {
        logger.warn("[Order Controller] Database is offline. Running in Mock Mode for verifyRazorpayPayment.");
        const orderId = generateOrderId();
        const mockOrder = {
          orderId,
          ...orderDetails,
          paymentStatus: 'Paid',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          createdAt: new Date(),
          status: 'Processing'
        };
        mockOrders.push(mockOrder);
        sendOrderConfirmationEmail(orderDetails.email, mockOrder).catch(err => logger.error({ err }, 'Order Confirmation Email background error'));
        
        return res.status(200).json({ success: true, message: "Payment verified (Mock Mode)", order: mockOrder });
      }

      session = await mongoose.startSession();
      session.startTransaction();

      // Find the reservation
      const reservation = await Reservation.findOne({ razorpayOrderId: razorpay_order_id }).session(session);

      const orderId = generateOrderId();
      const newOrder = new Order({
        userId: orderDetails.userId || null,
        orderId,
        items: orderDetails.items,
        totalPrice: orderDetails.totalPrice, 
        shippingAddress: orderDetails.shippingAddress,
        paymentMethod: orderDetails.paymentMethod || 'card',
        paymentStatus: 'Paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      });

      await newOrder.save({ session });

      if (reservation) {
        // Decrement stock and reservedStock
        for (const item of reservation.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity, reservedStock: -item.quantity }
          }, { session });
        }
        await Reservation.deleteOne({ _id: reservation._id }).session(session);
      } else {
        logger.warn(`No reservation found for razorpayOrderId: ${razorpay_order_id}. This could mean TTL expired just before payment completion.`);
        // Note: In a real system, you might want to handle this scenario explicitly 
        // by verifying stock again here if the reservation dropped.
      }

      await session.commitTransaction();
      session.endSession();

      sendOrderConfirmationEmail(orderDetails.email, newOrder).catch(err => logger.error({ err }, 'Order Confirmation Email background error'));
      logger.info({ orderId }, 'Payment verified and order finalized successfully');
      
      return res.status(200).json({ success: true, message: "Payment verified successfully", order: newOrder });
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    logger.error({ err: error }, "Verify Payment Error");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Release Inventory (Called on Razorpay Dismissal)
 */
exports.releaseInventory = async (req, res) => {
  let session = null;
  try {
    const { razorpay_order_id } = req.body;
    if (!razorpay_order_id) return res.status(400).json({ message: "Missing order ID" });

    if (mongoose.connection.readyState === 1) {
      session = await mongoose.startSession();
      session.startTransaction();

      const reservation = await Reservation.findOne({ razorpayOrderId: razorpay_order_id }).session(session);
      if (reservation) {
        for (const item of reservation.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { reservedStock: -item.quantity }
          }, { session });
        }
        await Reservation.deleteOne({ _id: reservation._id }).session(session);
        logger.info({ razorpayOrderId: razorpay_order_id }, 'Inventory released successfully');
      }

      await session.commitTransaction();
      session.endSession();
    }

    res.status(200).json({ success: true, message: "Inventory released" });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    logger.error({ err: error }, "Release Inventory Error");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Initialize background cron job to cleanup orphaned reservations
 * (e.g. MongoDB TTL deleted the document silently, so we must decrement reservedStock)
 */
exports.initCleanupJob = () => {
  setInterval(async () => {
    if (mongoose.connection.readyState !== 1) return;
    try {
      const now = new Date();
      // Find all reservations that have expired but haven't been deleted by Mongo's TTL yet
      // OR handle situations where we manually fetch them to release.
      // Actually, since Mongo TTL is silent, if we want to guarantee reservedStock is fixed,
      // we should delete them here BEFORE Mongo gets to it.
      
      const expiredReservations = await Reservation.find({ expiresAt: { $lt: now } });
      for (const res of expiredReservations) {
        for (const item of res.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { reservedStock: -item.quantity }
          });
        }
        await Reservation.deleteOne({ _id: res._id });
        logger.info(`Cleaned up expired reservation for order: ${res.razorpayOrderId}`);
      }
    } catch (err) {
      logger.error({ err }, "Cleanup Job Error");
    }
  }, 60000); // Run every minute
};

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
        email,
        items,
        totalPrice,
        shippingAddress,
        paymentMethod: paymentMethod || 'upi',
        status: 'Processing',
        createdAt: new Date()
      };
      
      mockOrders.push({ ...orderDetails, userId: userId || 'mock-user-id' });

      console.log(`[Order Controller] Triggering Order Confirmation Email to ${email} for order ${orderId}`);
      sendOrderConfirmationEmail(email, orderDetails).catch(err =>
        console.error("[Order Controller] Order Confirmation Email background error:", err.message)
      );

      return res.status(201).json({
        message: 'Order placed successfully (Mock Mode)! Confirmation email has been sent.',
        order: {
          userId: userId || 'mock-user-id',
          ...orderDetails
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

/**
 * Get All Orders
 */
exports.getOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn("[Order Controller] Database is offline. Serving static mock orders.");
      return res.status(200).json(mockOrders);
    }
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("[Order Controller] Get Orders error:", err);
    res.status(500).json({ message: 'Something went wrong while fetching orders' });
  }
};

/**
 * Get Specific Order By ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Mock Mode Support
    if (mongoose.connection.readyState !== 1) {
      console.warn('[Order Controller] Database is offline. Serving mock order.');
      const mockOrder = mockOrders.find(o => o.orderId === orderId);
      if (mockOrder) {
        return res.status(200).json(mockOrder);
      } else {
        return res.status(404).json({ message: 'Order not found (Mock)' });
      }
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (err) {
    console.error('[Order Controller] Get Order By ID error:', err);
    res.status(500).json({ message: 'Something went wrong fetching the order' });
  }
};

/**
 * Update Order Status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // Processing, Out for Delivery, Delivered
    
    if (!['Processing', 'Out for Delivery', 'Delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (mongoose.connection.readyState !== 1) {
       console.warn('[Order Controller] Database offline. Returning success mock.');
       const mockOrder = mockOrders.find(o => o.orderId === orderId);
       if (mockOrder) {
         mockOrder.status = status;
         return res.status(200).json({ message: 'Status updated successfully (Mock)', order: mockOrder });
       }
       return res.status(404).json({ message: 'Order not found (Mock)' });
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (err) {
    console.error('[Order Controller] Update Order Status error:', err);
    res.status(500).json({ message: 'Something went wrong updating the order status' });
  }
};

