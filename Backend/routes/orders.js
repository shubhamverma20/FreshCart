const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Route to place a new order (checkout)
router.post('/place', orderController.placeOrder);

module.exports = router;
