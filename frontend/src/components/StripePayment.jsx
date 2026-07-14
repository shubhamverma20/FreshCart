import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from '../context/ToastContext';

// Use a mock publishable key for test mode if not in env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ onPaymentSuccess, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is required, but we can also just redirect or handle it on this page
        // For SPA without redirect, we can set redirect: 'if_required'
      },
      redirect: 'if_required',
    });

    if (error) {
      setIsProcessing(false);
      showToast(error.message, 'error');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setIsProcessing(false);
      showToast('Payment successful!', 'success');
      onPaymentSuccess(paymentIntent.id);
    } else {
      setIsProcessing(false);
      showToast('Payment processing...', 'info');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <PaymentElement 
          options={{ 
            layout: 'tabs',
            // Can pass appearance configuration here to match site theme
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#16A34A',
              }
            }
          }} 
        />
      </div>
      <button 
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
      >
        {isProcessing ? 'Processing Payment...' : `Pay ₹${amount}`}
      </button>
    </form>
  );
};

export default function StripePayment({ clientSecret, onPaymentSuccess, amount }) {
  if (!clientSecret) {
    return <div className="text-center text-sm font-bold text-slate-500 p-4">Initializing Secure Payment...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onPaymentSuccess={onPaymentSuccess} amount={amount} />
    </Elements>
  );
}
