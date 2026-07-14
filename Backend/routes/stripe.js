const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

// Initialize stripe with env variable or a generic test key if missing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51Osomethingfake_but_it_might_fail_if_not_real_key');

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, items } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amounts in cents/paise
      currency: 'inr',
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
