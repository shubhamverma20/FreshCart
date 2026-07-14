import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import { motion, AnimatePresence } from 'framer-motion';

// Components
import Header from './components/Header';
import CartSidebar from './components/CartSidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { FiArrowUp, FiShoppingBag } from 'react-icons/fi';

// Pages
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DeliveryTracking from './pages/DeliveryTracking';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/Overview';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminInventory from './pages/admin/Inventory';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Profile from './pages/dashboard/Profile';
import Orders from './pages/dashboard/Orders';
import Wishlist from './pages/dashboard/Wishlist';
import Addresses from './pages/dashboard/Addresses';
import Settings from './pages/dashboard/Settings';

// Layout wrapper to conditionally render Header/Sidebar and floating items
function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const { cartCount, cartTotal, toggleCart } = useCart();

  // Hide Header/CartSidebar on /admin, /login, /register, /forgot-password
  const hideShell =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password';

  // Handle scroll detection for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 480) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Conditionally render header and sidebar */}
      {!hideShell && (
        <Header searchVal={searchQuery} onSearchChange={setSearchQuery} />
      )}
      {!hideShell && <CartSidebar />}

      <Routes>
        <Route path="/" element={<Home searchQuery={searchQuery} />} />
        <Route path="/products" element={<ProductListing searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/delivery" element={<DeliveryTracking />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="inventory" element={<AdminInventory />} />
        </Route>

        {/* Protected: must be logged in */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<Orders />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="addresses" element={<Addresses />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      {!hideShell && <Footer />}

      {/* Floating Cart Button (Mobile-only, bottom-fixed, shows item count + total) */}
      <AnimatePresence>
        {!hideShell && cartCount > 0 && (
          <motion.button
            onClick={toggleCart}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="fixed bottom-4 left-4 right-4 z-40 lg:hidden bg-primary hover:bg-primary-hover text-white py-3.5 px-5 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-between font-bold cursor-pointer transition-colors border border-emerald-400/25 focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <FiShoppingBag className="w-5 h-5" />
              <span className="text-sm">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
              <span className="text-emerald-200/50">•</span>
              <span className="text-sm font-extrabold text-white">₹{cartTotal}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-extrabold text-emerald-100">
              View Cart
              <FiArrowUp className="w-4 h-4 rotate-90" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 p-4 rounded-full shadow-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/85 active:scale-95 transition-all hover:-translate-y-0.5"
          aria-label="Back to top"
        >
          <FiArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <AppContent />
            </Router>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
