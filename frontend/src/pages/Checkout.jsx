import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { initializeRazorpayPayment } from '../services/paymentService';
import useRazorpayLoader from '../hooks/useRazorpayLoader';
import { FiMapPin, FiCreditCard, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import Breadcrumb from '../components/Breadcrumb';
import StripePayment from '../components/StripePayment';
import Button from '../components/Button';

export default function Checkout() {
  const { cart, cartTotal, clearCart, discountPercent, appliedCoupon } = useCart();
  const { user, apiBase } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isRazorpayLoaded = useRazorpayLoader();

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null); // Placed order details
  const [clientSecret, setClientSecret] = useState(null);
  const [showStripe, setShowStripe] = useState(false);

  const [prevUser, setPrevUser] = useState(null);
  
  if (user && user !== prevUser) {
    setPrevUser(user);
    if (user.email) setEmail(user.email);
    if (user.name) {
      const nameParts = user.name.trim().split(' ');
      setFirstName(nameParts[0] || '');
      if (nameParts.length > 1) {
        setLastName(nameParts.slice(1).join(' '));
      }
    }
  }

  // Calculations
  const subtotal = cartTotal;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const tax = Math.round((subtotal - discountAmount) * 0.05); // 5% mock tax
  const delivery = subtotal >= 299 || subtotal === 0 ? 0 : 40;
  const total = subtotal - discountAmount + tax + delivery;

  const handlePlaceOrder = async () => {
    // Validations
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      showToast("Please fill out all delivery details.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    if (cart.length === 0) {
      showToast("Your cart is empty.", "error");
      return;
    }

    const items = cart.map(item => ({
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    const shippingAddress = `${firstName} ${lastName}, ${address}, Pin: ${pincode}, Phone: ${phone}`;

    const payload = {
      userId: user ? user.id || user._id : null,
      email,
      items,
      totalPrice: total,
      shippingAddress,
      paymentMethod
    };

    setLoading(true);

    try {
      // Cash on Delivery
      if (paymentMethod === 'cod') {
        const res = await fetch(`${apiBase}/api/orders/place`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          setSuccessOrder(data.order);
          clearCart();
          showToast("Order placed successfully!", 'success');
        } else {
          showToast(data.message || "Failed to place order.", "error");
        }
        setLoading(false);
        return;
      }

      // Card / UPI Razorpay Gateway
      if (!isRazorpayLoaded) {
        showToast("Payment gateway loading... Please wait a second.", "warning");
        setLoading(false);
        return;
      }

      initializeRazorpayPayment({
        apiBase,
        items,
        orderDetails: payload,
        customer: { firstName, lastName, email, phone },
        onSuccess: (order) => {
          setSuccessOrder(order);
          clearCart();
          showToast("Order placed and payment received!", 'success');
          setLoading(false);
        },
        onFailure: (message) => {
          showToast(message || "Payment cancelled.", "error");
          setLoading(false);
        }
      });

      // Stripe Gateway
      if (paymentMethod === 'stripe') {
        const res = await fetch(`${apiBase}/api/stripe/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, items })
        });
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setShowStripe(true);
        } else {
          showToast("Failed to initialize secure payment.", "error");
        }
        setLoading(false);
        return;
      }

    } catch (err) {
      console.error("[Checkout] Order placement failed:", err);
      showToast(`Checkout Error: ${err.message}`, "error");
      setLoading(false);
    }
  };

  const handleStripeSuccess = async (paymentIntentId) => {
    // Save order in backend
    const shippingAddress = `${firstName} ${lastName}, ${address}, Pin: ${pincode}, Phone: ${phone}`;
    const items = cart.map(item => ({ name: item.name, price: Number(item.price), quantity: Number(item.quantity) }));
    
    const payload = {
      userId: user ? user.id || user._id : null,
      email,
      items,
      totalPrice: total,
      shippingAddress,
      paymentMethod: 'stripe',
      transactionId: paymentIntentId
    };

    try {
      const res = await fetch(`${apiBase}/api/orders/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessOrder(data.order);
        clearCart();
        setShowStripe(false);
      } else {
        showToast("Payment succeeded but order creation failed.", "warning");
      }
    } catch (error) {
      showToast("Payment succeeded but order creation failed.", "error");
    }
  };

  return (
    <main className="main-content container px-4 sm:px-6 lg:px-8 text-left pb-20">
      {/* Breadcrumbs */}
      <Breadcrumb 
        paths={[
          { label: 'Home', to: '/' },
          { label: 'Cart', to: '/cart' },
          { label: 'Checkout', to: '/checkout' }
        ]} 
      />

      {cart.length === 0 && !successOrder ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-[32px] p-8 shadow-sm">
          <span className="text-6xl" role="img" aria-label="Cart">🛒</span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-6">Your checkout cart is empty!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            Add some fresh items to your cart before proceeding to checkout.
          </p>
          <Button className="mt-8 text-xs font-bold" variant="primary" size="lg" onClick={() => navigate('/')}>
            Go to Storefront
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
          
          {/* Left Column: Form Details & Payments */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery address card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-6 sm:p-8 rounded-[28px] shadow-sm">
              <h2 className="font-display font-extrabold text-base text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <FiMapPin className="text-primary w-5 h-5" /> Delivery Address
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mb-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mb-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">Flat/House No. & Area Address</label>
                <input
                  type="text"
                  placeholder="Apartment 4B, Green Towers, Sector 15"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-primary text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="w-1/2">
                <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">Pin Code</label>
                <input
                  type="text"
                  placeholder="400001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-primary text-slate-800 dark:text-slate-200"
                />
              </div>

            </div>

            {/* Payment Method Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-6 sm:p-8 rounded-[28px] shadow-sm">
              <h2 className="font-display font-extrabold text-base text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <FiCreditCard className="text-primary w-5 h-5" /> Payment Method
              </h2>
              
              <div className="space-y-3">
                {[
                  { id: 'upi', title: 'UPI (Google Pay, PhonePe, Paytm)', desc: 'Pay securely using any mobile UPI App' },
                  { id: 'stripe', title: 'Credit / Debit Card (Stripe)', desc: 'Accepting Visa, MasterCard, Amex via Stripe' },
                  { id: 'cod', title: 'Cash on Delivery (COD)', desc: 'Pay by cash or card when package arrives' }
                ].map((pm) => {
                  const isActive = paymentMethod === pm.id;
                  return (
                    <label 
                      key={pm.id} 
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${isActive ? 'border-primary bg-emerald-500/5 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                      <input 
                        type="radio" 
                        name="payment" 
                        value={pm.id}
                        checked={isActive}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="accent-primary mt-1 cursor-pointer" 
                      />
                      <div className="flex flex-col gap-0.5 select-none">
                        <span className="text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-200">{pm.title}</span>
                        <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-550 leading-relaxed">{pm.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary sticky */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-205/65 dark:border-slate-800/80 p-6 rounded-[28px] shadow-sm sticky top-[108px]">
              <h2 className="font-display font-extrabold text-base text-slate-850 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850 mb-4">
                Order Summary
              </h2>

              {/* Items Summary list */}
              <div className="max-h-60 overflow-y-auto mb-6 pr-1 space-y-3.5 hide-scrollbar">
                {cart.map((item, index) => (
                  <div key={item.id || item._id || index} className="flex gap-3 items-center text-xs font-semibold">
                    <img src={item.image} alt="" className="w-10 h-10 object-contain rounded-lg border border-slate-100 bg-white p-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-850 dark:text-slate-200 truncate">{item.name}</div>
                      <div className="text-slate-400 text-[10px] font-bold">Qty: {item.quantity}</div>
                    </div>
                    <span className="text-slate-900 dark:text-slate-200 font-bold flex-shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* pricing */}
              <div className="space-y-3 text-xs sm:text-sm font-semibold">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Items Price</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">₹{subtotal}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-450 font-bold">
                    <span>Coupon ({appliedCoupon})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Delivery Fee</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Estimated GST (5%)</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">₹{tax}</span>
                </div>
                <div className="flex justify-between font-display font-extrabold text-base sm:text-lg text-slate-850 dark:text-slate-100 pt-4 border-t border-slate-100 dark:border-slate-850 mt-4">
                  <span>Order Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {showStripe && clientSecret ? (
                <div className="mt-6 border-t border-slate-100 dark:border-slate-850 pt-6">
                  <StripePayment 
                    clientSecret={clientSecret} 
                    amount={total} 
                    onPaymentSuccess={handleStripeSuccess} 
                  />
                  <button onClick={() => setShowStripe(false)} className="w-full mt-4 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
                    Cancel and change payment method
                  </button>
                </div>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  loading={loading}
                  variant="primary"
                  size="lg"
                  className="w-full text-xs font-bold mt-6 shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
                >
                  Pay & Place Order ₹{total}
                </Button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Success Confirmation Modal Overlay */}
      {successOrder && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex flex-col justify-center items-center p-6 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-8 rounded-[32px] shadow-2xl"
          >
            
            {/* Animated Success Ring icon */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-primary flex items-center justify-center mb-6 shadow-inner">
              <FiCheckCircle className="w-10 h-10" />
            </div>

            <h1 className="font-display font-extrabold text-2xl text-slate-800 dark:text-white leading-tight">
              Order Placed!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed">
              Thank you for shopping with FreshCart. Your grocery delivery request is processed and will arrive in 10-15 minutes.
            </p>
            
            {/* Order Detail Badge */}
            <div className="bg-slate-50 dark:bg-slate-850/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 w-full mt-6 text-left space-y-2.5 font-semibold text-xs">
              <div className="flex justify-between text-slate-450 dark:text-slate-400">
                <span>Order Reference:</span>
                <strong className="text-slate-750 dark:text-slate-200 font-extrabold">#{successOrder.orderId || 'ORD-9824X'}</strong>
              </div>
              <div className="flex justify-between text-slate-450 dark:text-slate-400">
                <span>Payment Method:</span>
                <span className="uppercase text-slate-750 dark:text-slate-200">{successOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-450 dark:text-slate-400">
                <span>Delivery Charge:</span>
                <span className="text-slate-750 dark:text-slate-200">₹{delivery}</span>
              </div>
              <div className="flex justify-between text-slate-450 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/80 pt-3 mt-3">
                <span className="text-slate-800 dark:text-slate-200 font-bold">Total Paid:</span>
                <strong className="text-primary font-black text-sm sm:text-base">₹{successOrder.totalPrice}</strong>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 w-full">
              <Button
                onClick={() => {
                  const orderId = successOrder.orderId || 'ORD-9824X';
                  setSuccessOrder(null);
                  navigate(`/delivery?orderId=${orderId}`);
                }}
                variant="primary"
                size="lg"
                className="w-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                Track Your Delivery <FiArrowRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => { setSuccessOrder(null); navigate('/'); }}
                variant="secondary"
                size="lg"
                className="w-full text-xs font-bold"
              >
                Back to Storefront
              </Button>
            </div>

          </motion.div>
        </div>
      )}

    </main>
  );
}
