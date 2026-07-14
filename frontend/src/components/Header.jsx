import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiShoppingBag, 
  FiSearch, 
  FiUser, 
  FiLogOut, 
  FiMapPin, 
  FiGrid, 
  FiMenu, 
  FiX,
  FiHeart
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import Button from './Button';

export default function Header({ searchVal, onSearchChange }) {
  const { cartCount, toggleCart } = useCart();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const isHome = location.pathname === '/' || location.pathname === '/products';

  // Sync wishlist item count
  useEffect(() => {
    const loadWishlistCount = () => {
      const wish = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wish.length);
    };
    loadWishlistCount();
    window.addEventListener('wishlist-update', loadWishlistCount);
    return () => window.removeEventListener('wishlist-update', loadWishlistCount);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            
            {/* Left: Logo & Delivery Pill */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 group">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-emerald-500/10 transition-transform duration-300"
                >
                  <FiShoppingBag className="w-5.5 h-5.5" />
                </motion.div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white select-none">
                  FreshCart
                </span>
              </Link>

              {/* Delivery Pill - Hidden on Mobile */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 text-[10px] font-bold text-primary shadow-sm select-none">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>Delivery in 12 mins</span>
              </div>
            </div>

            {/* Middle: Search Bar - Hidden on non-listing pages and on mobile */}
            {isHome && (
              <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-6 relative group">
                <input
                  type="text"
                  placeholder="Search fresh vegetables, fruits, snacks..."
                  value={searchVal || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-11 pr-5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-primary focus:bg-white dark:focus:bg-slate-900/80 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
              </div>
            )}

            {/* Right: Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4.5">
              <Link to="/delivery" className="flex items-center gap-1.5 text-xs font-bold text-slate-550 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                <FiMapPin className="w-4 h-4 text-slate-400" /> Track Order
              </Link>

              <Link to="/admin" className="flex items-center gap-1.5 text-xs font-bold text-slate-550 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                <FiGrid className="w-4 h-4 text-slate-400" /> Admin
              </Link>

              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

              {/* Theme Switcher */}
              <ThemeToggle />

              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

              {/* Wishlist Icon */}
              <Link 
                to="/dashboard/wishlist" 
                className="relative p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 transition-colors cursor-pointer"
              >
                <FiHeart className="w-4.5 h-4.5" />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span 
                      key={wishlistCount}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      className="absolute -top-1 -right-1 bg-red-550 text-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-905 shadow-sm"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-primary transition-colors">
                    <FiUser className="w-4 h-4 text-slate-400" /> Hi, {user.name ? user.name.split(' ')[0] : 'User'}
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-500 border-red-100 hover:bg-red-50 dark:hover:bg-red-950/20 dark:border-red-950/30 text-xs py-1.5"
                  >
                    <FiLogOut className="w-3.5 h-3.5 mr-1" /> Log Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/login')}
                    className="text-xs"
                  >
                    Log In
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => navigate('/login?mode=signup')}
                    className="text-xs"
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Cart Trigger */}
              <motion.button 
                onClick={toggleCart} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer focus:outline-none"
              >
                <FiShoppingBag className="w-4.5 h-4.5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span 
                      key={cartCount}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      className="absolute -top-1 -right-1 bg-accent text-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-950 shadow-sm"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Mobile Actions (Cart + Menu Trigger) */}
            <div className="flex lg:hidden items-center gap-3">
              {/* Cart always visible */}
              <motion.button 
                onClick={toggleCart} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer focus:outline-none"
              >
                <FiShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span 
                      key={cartCount}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      className="absolute -top-1 -right-1 bg-accent text-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile menu trigger */}
              <motion.button
                onClick={() => setMobileMenuOpen(true)}
                whileTap={{ scale: 0.92 }}
                className="p-2 text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer"
                aria-label="Open menu"
              >
                <FiMenu className="w-6 h-6" />
              </motion.button>
            </div>

          </div>
        </div>
      </header>

      {/* Slide-in Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Side Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-soft-lg border-l border-slate-100 dark:border-slate-800 p-6 flex flex-col z-50 text-left"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <span className="font-display font-extrabold text-xl text-emerald-600 dark:text-emerald-500">
                  FreshCart Menu
                </span>
                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
                  aria-label="Close menu"
                >
                  <FiX className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto py-6 space-y-6 flex flex-col justify-between">
                
                {/* Navigation Links */}
                <div className="space-y-4">
                  {/* Mobile Search */}
                  {isHome && (
                    <div className="relative group w-full mb-6">
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={searchVal || ''}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-250 pl-11 pr-5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-primary text-xs font-semibold"
                      />
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                    </div>
                  )}

                  {/* Delivery Info Pill inside Mobile Menu */}
                  <div className="flex md:hidden items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 text-xs font-bold text-primary shadow-sm mb-4">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span>Guaranteed delivery in 12 mins!</span>
                  </div>

                  <Link 
                    to="/delivery" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary transition-colors"
                  >
                    <FiMapPin className="w-5 h-5 text-slate-450" /> Track Order
                  </Link>

                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary transition-colors"
                  >
                    <FiGrid className="w-5 h-5 text-slate-455" /> Admin Panel
                  </Link>

                  <Link 
                    to="/dashboard/wishlist" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary transition-colors animate-none"
                  >
                    <FiHeart className="w-5 h-5 text-slate-455" /> My Wishlist ({wishlistCount})
                  </Link>
                </div>

                {/* Profile Actions & Appearance */}
                <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between px-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-450">Appearance</span>
                    <ThemeToggle />
                  </div>

                  {user ? (
                    <div className="space-y-3 px-3">
                      <Link 
                        to="/dashboard" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-primary transition-colors"
                      >
                        <FiUser className="w-5 h-5 text-slate-400" /> My Account ({user.name})
                      </Link>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={handleLogout}
                        className="w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 dark:border-red-950/50"
                      >
                        <FiLogOut className="w-5 h-5 mr-2" /> Log Out
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        size="md"
                        onClick={() => {
                          navigate('/login');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Log In
                      </Button>
                      <Button 
                        variant="primary" 
                        size="md"
                        onClick={() => {
                          navigate('/login?mode=signup');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
