import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { initializeRazorpayPayment } from '../services/paymentService';
import useRazorpayLoader from '../hooks/useRazorpayLoader';
import { FiMapPin, FiCreditCard, FiCheckCircle, FiChevronRight, FiGrid, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
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

  // Coupon settings loaded from Cart screen
  const discountPercent = Number(localStorage.getItem('discount_percent')) || 0;
  const appliedCoupon = localStorage.getItem('applied_coupon') || '';

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
          localStorage.removeItem('discount_percent');
          localStorage.removeItem('applied_coupon');
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
          localStorage.removeItem('discount_percent');
          localStorage.removeItem('applied_coupon');
          showToast("Order placed and payment received!", 'success');
          setLoading(false);
        },
        onFailure: (message) => {
          showToast(message || "Payment cancelled.", "error");
          setLoading(false);
        }
      });

    } catch (err) {
      console.error("[Checkout] Order placement failed:", err);
      showToast(`Checkout Error: ${err.message}`, "error");
      setLoading(false);
    }
  };

  return (
    <main className="main-content container px-4 sm:px-6 lg:px-8 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-450 dark:text-slate-500 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <FiChevronRight className="w-3 h-3" />
        <Link to="/cart" className="hover:text-primary transition-colors">Cart</Link>
        <FiChevronRight className="w-3 h-3" />
        <span className="text-slate-600 dark:text-slate-350">Checkout</span>
      </div>

      {cart.length === 0 && !successOrder ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
          <span className="text-6xl" role="img" aria-label="Cart">🛒</span>
          <h2 className="font-display font-extrabold text-2xl text-slate-800 dark:text-white mt-6">Your checkout cart is empty!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            Add some fresh items to your cart before proceeding to checkout.
          </p>
          <button className="mt-8 bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3.5 rounded-full" onClick={() => navigate('/')}>
            Go to Storefront
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Details & Payments */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery address card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm text-left">
              <h2 className="font-display font-extrabold text-lg text-slate-850 dark:text-white mb-6 flex items-center gap-2">
                <FiMapPin className="text-primary w-5 h-5" /> Delivery Address
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Flat/House No. & Area Address</label>
                <input
                  type="text"
                  placeholder="Apartment 4B, Green Towers, Sector 15"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="w-1/2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Pin Code</label>
                <input
                  type="text"
                  placeholder="400001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                />
              </div>

            </div>

            {/* Payment Method Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm text-left">
              <h2 className="font-display font-extrabold text-lg text-slate-850 dark:text-white mb-6 flex items-center gap-2">
                <FiCreditCard className="text-primary w-5 h-5" /> Payment Method
              </h2>
              
              <div className="space-y-3">
                {[
                  { id: 'upi', title: 'UPI (Google Pay, PhonePe, Paytm)', desc: 'Pay securely using any mobile UPI App' },
                  { id: 'card', title: 'Credit / Debit Card', desc: 'Accepting Visa, MasterCard, RuPay, Maestro' },
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
                        className="accent-primary mt-1" 
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-250">{pm.title}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{pm.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary sticky */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm sticky top-[108px] text-left">
              <h2 className="font-display font-extrabold text-lg text-slate-850 dark:text-white pb-4 border-b border-slate-100 dark:border-slate-850 mb-4">
                Order Summary
              </h2>

              {/* Items Summary list */}
              <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-3.5">
                {cart.map((item, index) => (
                  <div key={item.id || item._id || index} className="flex gap-3 items-center text-xs font-semibold">
                    <img src={item.image} alt="" className="w-10 h-10 object-contain rounded-lg border border-slate-100 bg-white p-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-800 dark:text-slate-200 truncate">{item.name}</div>
                      <div className="text-slate-400 text-[10px]">Qty: {item.quantity}</div>
                    </div>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* pricing */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Items Price</span>
                  <span>₹{subtotal}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-450 font-bold">
                    <span>Coupon ({appliedCoupon})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Delivery Fee</span>
                  <span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Estimated GST (5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="flex justify-between font-display font-extrabold text-lg text-slate-800 dark:text-slate-100 pt-4 border-t border-slate-100 dark:border-slate-850 mt-4">
                  <span>Order Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-display font-extrabold text-base mt-6 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Placing Order..." : `Pay & Place Order ₹${total}`}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Success Confirmation Modal Overlay */}
      {successOrder && (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-900 flex flex-col justify-center items-center p-6 text-center animate-fade-in">
          <div className="max-w-md w-full flex flex-col items-center">
            
            {/* Animated Success Ring icon */}
            <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-primary flex items-center justify-center mb-6">
              <FiCheckCircle className="w-12 h-12" />
            </div>

            <h1 className="font-display font-black text-3xl text-slate-800 dark:text-white leading-tight">
              Order Placed Successfully!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed">
              Thank you for shopping with FreshCart. Your grocery delivery request is processed and will arrive in 10-15 minutes.
            </p>
            
            {/* Order Detail Badge */}
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 rounded-2xl p-4 w-full mt-8 text-left space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-450">
                <span>Order Reference:</span>
                <strong className="text-slate-750 dark:text-slate-200 font-extrabold">#{successOrder.orderId || 'ORD-9824X'}</strong>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-450">
                <span>Payment Method:</span>
                <span className="uppercase text-slate-750 dark:text-slate-200">{successOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-450">
                <span>Delivery Charge:</span>
                <span className="text-slate-750 dark:text-slate-200">₹{delivery}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-450 border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                <span className="text-slate-800 dark:text-slate-200 font-bold">Total Paid:</span>
                <strong className="text-primary font-black text-sm">₹{successOrder.totalPrice}</strong>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  const orderId = successOrder.orderId || 'ORD-9824X';
                  setSuccessOrder(null);
                  navigate(`/delivery?orderId=${orderId}`);
                }}
                className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"
              >
                Track Your Delivery <FiArrowRight className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => { setSuccessOrder(null); navigate('/'); }}
                className="w-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 py-3.5 rounded-2xl font-bold transition-all cursor-pointer"
              >
                Back to Storefront
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
