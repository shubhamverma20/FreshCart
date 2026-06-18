const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Route to place a new order (checkout)
router.post('/place', orderController.placeOrder);

// Route to create a Cashfree payment session
router.post('/create-cashfree-order', orderController.createCashfreeOrder);

// Route to get all orders (admin panel)
router.get('/', orderController.getOrders);

// Route to get a specific order by ID (Delivery Tracking)
router.get('/:orderId', orderController.getOrderById);

// Route to update order status (Admin Panel)
router.put('/:orderId/status', orderController.updateOrderStatus);

module.exports = router;
