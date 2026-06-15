const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmationEmail } = require('../services/emailService');

// Helper to generate a unique order ID
function generateOrderId() {
  return 'ORD-' + Math.floor(100000 + Math.random() * 900000) + 'X';
}

/**
 * Place a New Order
 */
exports.placeOrder = async (req, res) => {
  try {
    const { userId, email, items, totalPrice, shippingAddress, paymentMethod } = req.body;

    if (!email || !items || !totalPrice || !shippingAddress) {
      return res.status(400).json({ message: 'Missing required checkout information' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items cannot be empty' });
    }

    const orderId = generateOrderId();

    const newOrder = new Order({
      userId: userId || null,
      orderId,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod: paymentMethod || 'upi'
    });

    await newOrder.save();

    // Trigger Order Confirmation Email
    const orderDetails = {
      orderId,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod: paymentMethod || 'upi'
    };

    sendOrderConfirmationEmail(email, orderDetails).catch(err =>
      console.error("[Order Controller] Order Confirmation Email background error:", err.message)
    );

    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder
    });
  } catch (err) {
    console.error("[Order Controller] Place Order error:", err);
    res.status(500).json({ message: 'Something went wrong while placing order' });
  }
};
