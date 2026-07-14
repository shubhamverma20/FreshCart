import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { FiTrash2, FiShoppingBag, FiCreditCard, FiTag } from 'react-icons/fi';
import QuantitySelector from '../components/QuantitySelector';
import Breadcrumb from '../components/Breadcrumb';
import Button from '../components/Button';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, applyCoupon, removeCoupon, discountPercent, appliedCoupon } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  // Micro-interaction state for deleting items
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();

    if (appliedCoupon) {
      showToast("A coupon is already applied!", 'warning');
      return;
    }

    if (code === 'FRESH50') {
      applyCoupon('FRESH50', 15); // 15% discount
      showToast("Coupon FRESH50 applied! 15% discount added.", 'success');
      setCouponCode('');
    } else if (code === 'WELCOME20') {
      applyCoupon('WELCOME20', 20); // 20% discount
      showToast("Coupon WELCOME20 applied! 20% discount added.", 'success');
      setCouponCode('');
    } else {
      showToast("Invalid coupon code. Try FRESH50 or WELCOME20.", 'error');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    showToast("Coupon removed.", 'info');
  };

  const handleDeleteItem = (item) => {
    const itemId = item.id || item._id;
    if (confirmDeleteId === itemId) {
      removeFromCart(itemId);
      showToast(`${item.name} removed`, 'info');
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(itemId);
      // Auto reset the confirm state after 3 seconds
      setTimeout(() => {
        setConfirmDeleteId(null);
      }, 3000);
    }
  };

  // Calculations
  const FREE_SHIPPING_THRESHOLD = 299;
  const shippingCharge = cartTotal >= FREE_SHIPPING_THRESHOLD || cartTotal === 0 ? 0 : 40;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal;
  const discountAmount = Math.round(cartTotal * (discountPercent / 100));
  const finalTotal = cartTotal - discountAmount + shippingCharge;

  return (
    <main className="main-content container px-4 sm:px-6 lg:px-8 text-left pb-20">
      {/* Breadcrumbs */}
      <Breadcrumb 
        paths={[
          { label: 'Home', to: '/' },
          { label: 'Shopping Cart', to: '/cart' }
        ]} 
      />

      <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white mb-6">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-[32px] p-8 shadow-sm">
          <span className="text-6xl" role="img" aria-label="Empty Basket">🧺</span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-6">Your Cart is Empty</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            You haven't added any items to your cart yet. Browse our store to find fresh picks!
          </p>
          <Button onClick={() => navigate('/products')} variant="primary" size="lg" className="mt-8 text-xs font-bold gap-2 flex items-center justify-center mx-auto">
            <FiShoppingBag className="w-4 h-4" /> Browse Groceries
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Items list */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Free shipping banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-5 rounded-2xl shadow-sm text-xs sm:text-sm">
              {cartTotal >= FREE_SHIPPING_THRESHOLD ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 font-bold">
                  🎉 Congratulations! Your order qualifies for <strong>Free Delivery</strong>.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                    <span>Add <strong>₹{amountToFreeShipping}</strong> more for free shipping!</span>
                    <span className="text-[10px] text-slate-400">Goal: ₹{FREE_SHIPPING_THRESHOLD}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-300" 
                      style={{ width: `${(cartTotal / FREE_SHIPPING_THRESHOLD) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-205/65 dark:border-slate-800/80 p-6 rounded-[28px] shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
                <span className="font-bold text-sm text-slate-700 dark:text-slate-250">Products ({cart.length})</span>
                <button 
                  onClick={() => { clearCart(); showToast('Cart cleared', 'info'); }}
                  className="text-xs font-bold text-red-505 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {cart.map((item) => {
                  const itemId = item.id || item._id;
                  const isConfirming = confirmDeleteId === itemId;
                  return (
                    <div key={itemId} className="flex flex-col sm:flex-row items-center gap-4 py-4.5 first:pt-0 last:pb-0 text-left">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-2xl object-contain bg-white border border-slate-100 p-1 flex-shrink-0" 
                      />
                      
                      <div className="flex-1 min-w-0 w-full">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-extrabold text-primary bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full w-fit uppercase tracking-wider block mt-1">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-3 sm:mt-0">
                        {/* Quantity Counter */}
                        <QuantitySelector 
                          quantity={item.quantity}
                          onIncrement={() => updateQuantity(itemId, 1)}
                          onDecrement={() => updateQuantity(itemId, -1)}
                        />

                        {/* Price & Delete */}
                        <div className="flex items-center gap-4">
                          <span className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 min-w-[60px] text-right">
                            ₹{item.price * item.quantity}
                          </span>
                          <button 
                            onClick={() => handleDeleteItem(item)}
                            className={`text-xs p-2 rounded-xl transition-all cursor-pointer font-bold ${
                              isConfirming 
                                ? 'bg-red-500 text-white shadow-sm' 
                                : 'text-red-400 hover:text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                            }`}
                          >
                            {isConfirming ? 'Confirm?' : <FiTrash2 className="w-4 h-4" />}
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm">
              <h3 className="font-display font-extrabold text-xs text-slate-850 dark:text-slate-200 mb-3.5 flex items-center gap-1.5 uppercase tracking-wider">
                <FiTag className="text-primary w-4 h-4" /> Have a Coupon?
              </h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/40 p-3 rounded-xl">
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
                    className="flex-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                  <Button 
                    type="submit" 
                    variant="primary"
                    size="sm"
                    className="px-4 text-xs font-bold"
                  >
                    Apply
                  </Button>
                </form>
              )}
              <div className="text-[10px] font-bold text-slate-400 mt-2 text-left">
                Use code <strong>WELCOME20</strong> (20% off) or <strong>FRESH50</strong> (15% off).
              </div>
            </div>

            {/* Price detail card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-205/65 dark:border-slate-800/85 p-6 rounded-2xl shadow-sm text-xs sm:text-sm sticky top-[108px]">
              <h3 className="font-display font-extrabold text-base text-slate-850 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850 mb-4">
                Summary
              </h3>
              
              <div className="space-y-3 font-semibold">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal Price</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">₹{cartTotal}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-450 font-bold">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Delivery Charge</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
                </div>
                <div className="flex justify-between font-display font-extrabold text-base sm:text-lg text-slate-850 dark:text-slate-100 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <span>Total Amount</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/checkout')}
                variant="primary"
                size="lg"
                className="w-full text-xs font-bold mt-6 shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
              >
                Proceed to Checkout <FiCreditCard className="w-4 h-4" />
              </Button>
            </div>

          </div>

        </div>
      )}

    </main>
  );
}
