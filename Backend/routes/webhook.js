const express = require('express');
const router = express.Router();
const verifyRazorpaySignature = require('../middleware/verifyRazorpaySignature');
const webhookController = require('../controllers/webhookController');

// The route is mounted at /api/webhook, so this matches /api/webhook/razorpay
// The express.raw middleware is already applied globally to this path in server.js
router.post('/razorpay', verifyRazorpaySignature, webhookController.handleRazorpayWebhook);

module.exports = router;
