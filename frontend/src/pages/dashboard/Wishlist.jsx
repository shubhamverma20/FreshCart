import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import ProductCard from '../../components/ProductCard';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

import { useEffect } from 'react';

export default function Wishlist() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const loadWishlist = () => {
      const wish = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(wish);
    };
    loadWishlist();
    window.addEventListener('wishlist-update', loadWishlist);
    return () => window.removeEventListener('wishlist-update', loadWishlist);
  }, []);

  const handleRemove = (id) => {
    let wish = JSON.parse(localStorage.getItem('wishlist') || '[]');
    wish = wish.filter(item => (item.id || item._id) !== id);
    localStorage.setItem('wishlist', JSON.stringify(wish));
    setWishlist(wish);
    showToast("Item removed from wishlist.", "info");
    window.dispatchEvent(new Event('wishlist-update'));
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display font-extrabold text-xl text-slate-850 dark:text-white">My Wishlist</h2>
      
      <AnimatePresence mode="wait">
        {wishlist.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-8 h-8 fill-current" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-150">Wishlist is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">
              Like some items to save them here for later purchase.
            </p>
            <button onClick={() => navigate('/products')} className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-8 py-3.5 rounded-full transition-transform hover:scale-105 shadow-lg shadow-emerald-500/20">
              Explore Products
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            <AnimatePresence>
              {wishlist.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="relative group"
                >
                  <ProductCard product={item} />
                  
                  {/* Remove Overlay Button */}
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 text-red-500 hover:text-white hover:bg-red-500 rounded-full flex items-center justify-center shadow-sm transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    aria-label="Remove from wishlist"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
