import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartSidebar() {
  const { 
    cart, 
    cartOpen, 
    setCartOpen, 
    removeFromCart, 
    updateQuantity, 
    cartTotal, 
    cartCount 
  } = useCart();
  
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    setCartOpen(false);
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[1000] cursor-pointer"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white dark:bg-slate-900 shadow-2xl z-[1001] flex flex-col border-l border-slate-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <FiShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-display font-extrabold text-xl text-slate-800 dark:text-slate-100">
                  Your Cart ({cartCount})
                </h2>
              </div>
              <button 
                onClick={() => setCartOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <FiX className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center gap-4 py-12">
                  <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-primary">
                    <FiShoppingBag className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">
                      Your cart is empty
                    </h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 max-w-[240px] mt-1.5 mx-auto">
                      Explore our products and add some fresh items to your cart!
                    </p>
                  </div>
                  <button 
                    onClick={() => setCartOpen(false)}
                    className="mt-2 bg-primary hover:bg-primary-hover text-white font-bold text-sm px-6 py-3 rounded-full transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, index) => {
                  const itemId = item.id || item._id;
                  return (
                    <motion.div 
                      key={itemId || index} 
                      layout
                      className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-800 transition-colors"
                    >
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-xl object-contain bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/30 p-1 flex-shrink-0" 
                      />
                      
                      <div className="flex-1 flex flex-col min-w-0">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          Category: {item.category}
                        </span>
                        
                        <div className="flex justify-between items-center mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-white dark:bg-slate-800">
                            <button 
                              onClick={() => updateQuantity(itemId, -1)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                            >
                              <FiMinus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold w-6 text-center text-slate-800 dark:text-slate-100">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(itemId, 1)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                            >
                              <FiPlus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-display font-extrabold text-sm text-primary">
                              ₹{item.price * item.quantity}
                            </span>
                            <button 
                              onClick={() => removeFromCart(itemId)}
                              className="text-red-400 hover:text-red-600 dark:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 gap-4 flex flex-col">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Subtotal Price
                  </span>
                  <span className="font-display font-extrabold text-2xl text-slate-800 dark:text-slate-100">
                    ₹{cartTotal}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 text-left -mt-2">
                  Taxes and delivery fee calculated at checkout step.
                </div>
                
                <button
                  onClick={handleCheckoutClick}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-display font-extrabold text-base transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  Proceed to Checkout <FiShoppingBag className="w-4.5 h-4.5" />
                </button>
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
