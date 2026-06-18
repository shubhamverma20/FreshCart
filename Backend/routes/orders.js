const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Route to place a new order (checkout)
router.post('/place', orderController.placeOrder);

// Route to get all orders (admin panel)
router.get('/', orderController.getOrders);

module.exports = router;
