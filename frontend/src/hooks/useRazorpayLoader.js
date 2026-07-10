import { useState, useEffect } from 'react';

export default function useRazorpayLoader() {
  const [isLoaded, setIsLoaded] = useState(() => typeof window !== 'undefined' && !!window.Razorpay);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error('Razorpay SDK failed to load. Are you offline?');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return isLoaded;
}
