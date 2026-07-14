import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiStar, FiHeart, FiMinus, FiPlus, FiShoppingBag, FiCreditCard } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

export default function ProductCard({ product, layout = 'grid', className = '' }) {
  const { addToCart, updateQuantity, cart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isWishlisted, setIsWishlisted] = useState(false);

  // Check if item is in cart
  const cartItem = cart.find(item => (item.id || item._id) === product._id || (item.id || item._id) === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const prodId = product.id || product._id;

  // Persist Wishlist state
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const inWish = wishlist.some(item => (item.id || item._id) === prodId);
    setIsWishlisted(inWish);
  }, [prodId]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const inWish = wishlist.some(item => (item.id || item._id) === prodId);
    
    if (inWish) {
      wishlist = wishlist.filter(item => (item.id || item._id) !== prodId);
      setIsWishlisted(false);
      showToast(`Removed ${product.name} from wishlist.`, 'info');
    } else {
      wishlist.push(product);
      setIsWishlisted(true);
      showToast(`Added ${product.name} to wishlist! ❤️`, 'success');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlist-update'));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(prodId, 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(prodId, -1);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity === 0) {
      addToCart(product);
    }
    navigate('/checkout');
  };

  // Calculate discount percentage
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (layout === 'list') {
    return (
      <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 text-left relative group ${className}`}>
        
        {/* Badges container */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          {product.badge && (
            <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={toggleWishlist}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/80 flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 active:scale-95 transition-all text-slate-450"
          aria-label="Add to wishlist"
        >
          <FiHeart className={`w-4.5 h-4.5 transition-colors duration-250 ${isWishlisted ? 'text-red-500 fill-red-500 animate-pulse' : 'text-slate-400 dark:text-slate-500 hover:text-red-500'}`} />
        </button>

        {/* Product Image */}
        <Link to={`/products/${prodId}`} className="block w-36 h-36 flex-shrink-0 relative overflow-hidden rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 p-2 flex items-center justify-center">
          <img 
            src={product.image} 
            alt={product.name} 
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/png?text=No+Image"; }} 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out" 
          />
        </Link>

        {/* Info Details */}
        <div className="flex-1 flex flex-col justify-center min-w-0 w-full">
          <span className="text-[10px] font-extrabold text-primary dark:text-primary-400 bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-full w-fit uppercase tracking-wider">
            {product.category}
          </span>
          <Link to={`/products/${prodId}`} className="font-extrabold text-lg text-slate-900 dark:text-slate-100 hover:text-primary mt-2.5 line-clamp-1 transition-colors">
            {product.name}
          </Link>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <FiStar className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-slate-800 dark:text-slate-200">{product.rating || '4.5'}</span>
            <span className="text-slate-400">({product.reviews || '50'} reviews)</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 line-clamp-2">
            Experience the finest grade {product.name} sourced directly from farms and delivered in optimal cold storage to preserve taste and nutrition.
          </p>
        </div>

        {/* Actions side-panel */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3.5 w-full sm:w-44 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6 flex-shrink-0">
          <div className="text-right w-full sm:w-auto">
            <div className="font-display font-extrabold text-xl text-slate-900 dark:text-slate-100">
              ₹{product.price}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs font-semibold text-red-500 line-through">
                ₹{product.originalPrice}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            {quantity === 0 ? (
              <Button 
                onClick={handleAddToCart}
                variant="primary"
                size="sm"
                className="w-full flex items-center justify-center gap-1"
              >
                <FiShoppingBag className="w-3.5 h-3.5" /> Add
              </Button>
            ) : (
              <div className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800/80 w-full">
                <button 
                  onClick={handleDecrement}
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  <FiMinus className="w-3.5 h-3.5" />
                </button>
                <span className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  {quantity}
                </span>
                <button 
                  onClick={handleIncrement}
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <Button 
              onClick={handleBuyNow}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-1.5 text-xs py-2 bg-transparent"
            >
              <FiCreditCard className="w-3.5 h-3.5" /> Buy Now
            </Button>
          </div>
        </div>

      </div>
    );
  }

  // Default Grid Layout
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[24px] p-4.5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 flex flex-col relative text-left h-full group ${className}`}>
      
      {/* Badges container */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
        {product.badge && (
          <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            {product.badge}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Wishlist Heart Button */}
      <button 
        onClick={toggleWishlist}
        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-100 dark:border-slate-700/80 flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 active:scale-95 transition-all text-slate-450"
        aria-label="Add to wishlist"
      >
        <FiHeart className={`w-4 h-4 transition-colors duration-250 ${isWishlisted ? 'text-red-500 fill-red-500 animate-pulse' : 'text-slate-400 dark:text-slate-500 hover:text-red-500'}`} />
      </button>

      {/* Image Gallery wrapper */}
      <Link to={`/products/${prodId}`} className="block relative h-40 mb-3 group overflow-hidden rounded-2xl bg-slate-50/50 dark:bg-slate-950/10 p-2 flex items-center justify-center">
        <img 
          src={product.image} 
          alt={product.name} 
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/png?text=No+Image"; }} 
          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out" 
        />
      </Link>

      <div className="flex flex-col flex-1">
        {/* Category Pill */}
        <span className="text-[9px] font-extrabold text-primary bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full w-fit uppercase tracking-wider">
          {product.category}
        </span>
        
        {/* Product Title */}
        <Link to={`/products/${prodId}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-primary transition-colors line-clamp-1 mt-2">
          {product.name}
        </Link>
        
        {/* Stars Rating */}
        <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-slate-550 dark:text-slate-400">
          <FiStar className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-slate-800 dark:text-slate-200">{product.rating || '4.5'}</span>
          <span className="text-slate-400 font-semibold">({product.reviews || '50'})</span>
        </div>

        {/* Pricing tag */}
        <div className="flex items-baseline gap-1.5 mt-3">
          <span className="font-display font-extrabold text-base text-slate-905 dark:text-white">
            ₹{product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs font-semibold text-red-500 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Actions panel */}
        <div className="flex gap-2 mt-4 pt-1">
          {quantity === 0 ? (
            <Button 
              onClick={handleAddToCart}
              variant="primary"
              size="sm"
              className="flex-1 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
            >
              <FiShoppingBag className="w-3.5 h-3.5" /> Add
            </Button>
          ) : (
            <div className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800/80 flex-1">
              <button 
                onClick={handleDecrement}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              >
                <FiMinus className="w-3.5 h-3.5" />
              </button>
              <span className="font-display font-extrabold text-xs text-slate-800 dark:text-slate-100">
                {quantity}
              </span>
              <button 
                onClick={handleIncrement}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              >
                <FiPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <Button 
            onClick={handleBuyNow}
            variant="outline"
            size="sm"
            className="flex-1 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 bg-transparent border-slate-250/80 hover:bg-slate-50"
          >
            <FiCreditCard className="w-3.5 h-3.5" /> Buy
          </Button>
        </div>

      </div>
    </div>
  );
}
