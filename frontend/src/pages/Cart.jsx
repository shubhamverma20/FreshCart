import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiCreditCard, FiTag } from 'react-icons/fi';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(() => {
    return Number(localStorage.getItem('discount_percent')) || 0;
  });
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    return localStorage.getItem('applied_coupon') || '';
  });

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();

    if (appliedCoupon) {
      showToast("A coupon is already applied!", 'warning');
      return;
    }

    if (code === 'FRESH50') {
      setDiscountPercent(15); // 15% discount
      setAppliedCoupon('FRESH50');
      localStorage.setItem('discount_percent', '15');
      localStorage.setItem('applied_coupon', 'FRESH50');
      showToast("Coupon FRESH50 applied! 15% discount added.", 'success');
      setCouponCode('');
    } else if (code === 'WELCOME20') {
      setDiscountPercent(20); // 20% discount
      setAppliedCoupon('WELCOME20');
      localStorage.setItem('discount_percent', '20');
      localStorage.setItem('applied_coupon', 'WELCOME20');
      showToast("Coupon WELCOME20 applied! 20% discount added.", 'success');
      setCouponCode('');
    } else {
      showToast("Invalid coupon code. Try FRESH50 or WELCOME20.", 'error');
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountPercent(0);
    setAppliedCoupon('');
    localStorage.removeItem('discount_percent');
    localStorage.removeItem('applied_coupon');
    showToast("Coupon removed.", 'info');
  };

  // Calculations
  const FREE_SHIPPING_THRESHOLD = 299;
  const shippingCharge = cartTotal >= FREE_SHIPPING_THRESHOLD || cartTotal === 0 ? 0 : 40;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal;
  const discountAmount = Math.round(cartTotal * (discountPercent / 100));
  const finalTotal = cartTotal - discountAmount + shippingCharge;

  return (
    <main className="main-content container px-4 sm:px-6 lg:px-8 text-left">
      <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-white mb-6">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
          <span className="text-6xl" role="img" aria-label="Empty Basket">🧺</span>
          <h2 className="font-display font-extrabold text-2xl text-slate-800 dark:text-white mt-6">Your Cart is Empty</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            You haven't added any items to your cart yet. Browse our store to find fresh picks!
          </p>
          <button onClick={() => navigate('/products')} className="mt-8 bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3.5 rounded-full transition-all">
            Browse Groceries
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Items list */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Free shipping banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm text-sm">
              {cartTotal >= FREE_SHIPPING_THRESHOLD ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 font-semibold">
                  🎉 Congratulations! Your order qualifies for <strong>Free Delivery</strong>.
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <span>Add <strong>₹{amountToFreeShipping}</strong> more for free shipping!</span>
                    <span className="text-xs text-slate-400">Goal: ₹{FREE_SHIPPING_THRESHOLD}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-300" 
                      style={{ width: `${(cartTotal / FREE_SHIPPING_THRESHOLD) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
                <span className="font-bold text-slate-700 dark:text-slate-200">Products ({cart.length})</span>
                <button 
                  onClick={() => { clearCart(); showToast('Cart cleared', 'info'); }}
                  className="text-xs font-bold text-red-500 hover:text-red-650 cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {cart.map((item, index) => {
                  const itemId = item.id || item._id;
                  return (
                    <div key={itemId || index} className="flex flex-col sm:flex-row items-center gap-4 py-4 first:pt-0 last:pb-0 text-left">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-2xl object-contain bg-white border border-slate-100 p-1 flex-shrink-0" 
                      />
                      
                      <div className="flex-1 min-w-0 w-full">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100 block truncate">
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mt-0.5">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800/80">
                          <button 
                            onClick={() => updateQuantity(itemId, -1)}
                            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-sm w-8 text-center text-slate-800 dark:text-slate-100">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(itemId, 1)}
                            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer"
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center gap-4">
                          <span className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 min-w-[60px] text-right">
                            ₹{item.price * item.quantity}
                          </span>
                          <button 
                            onClick={() => { removeFromCart(itemId); showToast(`${item.name} removed`, 'info'); }}
                            className="text-red-400 hover:text-red-600 dark:text-red-500 p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                          >
                            <FiTrash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* Right: Payment/Summary card */}
          <div className="space-y-6">
            
            {/* Promo code entry */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <h3 className="font-display font-bold text-sm text-slate-850 dark:text-slate-200 mb-3.5 flex items-center gap-1.5">
                <FiTag className="text-primary w-4.5 h-4.5" /> Have a Coupon?
              </h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-3 rounded-2xl">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-450">
                    Active Code: {appliedCoupon} ({discountPercent}% Off)
                  </div>
                  <button 
                    onClick={handleRemoveCoupon}
                    className="text-xs font-extrabold text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form className="flex gap-2" onSubmit={handleApplyCoupon}>
                  <input 
                    type="text" 
                    placeholder="WELCOME20 or FRESH50" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-750 dark:text-slate-200"
                  />
                  <button 
                    type="submit" 
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 rounded-xl shadow-sm cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              <div className="text-[10px] text-slate-400 mt-2 text-left">
                Use code <strong>WELCOME20</strong> (20% off) or <strong>FRESH50</strong> (15% off).
              </div>
            </div>

            {/* Price detail card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-sm">
              <h3 className="font-display font-extrabold text-lg text-slate-850 dark:text-white pb-4 border-b border-slate-100 dark:border-slate-850 mb-4">
                Summary
              </h3>
              
              <div className="space-y-3.5">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal Price</span>
                  <span>₹{cartTotal}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-450 font-semibold">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Delivery Charge</span>
                  <span>{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
                </div>
                <div className="flex justify-between font-display font-extrabold text-lg text-slate-800 dark:text-slate-100 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <span>Total Amount</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-display font-extrabold text-base mt-6 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer"
              >
                Proceed to Checkout <FiCreditCard className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>

        </div>
      )}

    </main>
  );
}
