const crypto = require('crypto');
const logger = require('../services/logger');

const verifyRazorpaySignature = (req, res, next) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
            logger.error('RAZORPAY_WEBHOOK_SECRET is not configured.');
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        const signature = req.headers['x-razorpay-signature'];
        if (!signature) {
            logger.warn('Webhook request missing x-razorpay-signature header');
            return res.status(401).json({ message: 'Missing signature' });
        }

        // Compute HMAC SHA256 using the raw body
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(req.body) // req.body is a Buffer thanks to express.raw
            .digest('hex');

        if (expectedSignature !== signature) {
            logger.warn({ expected: expectedSignature, received: signature }, 'Invalid Razorpay signature');
            return res.status(401).json({ message: 'Invalid signature' });
        }

        // Parse the raw buffer into JSON and attach it back to req.body for the controller
        req.rawBody = req.body; 
        req.body = JSON.parse(req.body.toString('utf8'));
        
        next();
    } catch (error) {
        logger.error({ err: error }, 'Error in verifyRazorpaySignature middleware');
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = verifyRazorpaySignature;
