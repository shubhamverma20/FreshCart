import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

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
import AuthPage from './pages/AuthPage';
import DeliveryTracking from './pages/DeliveryTracking';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';

// Layout wrapper to conditionally render Header/Sidebar and floating items
function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const { cartCount, toggleCart } = useCart();

  // Hide Header/CartSidebar on /admin, /login
  const hideShell =
    location.pathname === '/admin' ||
    location.pathname === '/login';

  // Handle scroll detection for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
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
        <Route path="/login" element={<AuthPage />} />
        <Route path="/delivery" element={<DeliveryTracking />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Protected: must be logged in */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideShell && <Footer />}

      {/* Floating Cart Button (Visible on Home & Products Listing when cart has items) */}
      {!hideShell && cartCount > 0 && (location.pathname === '/' || location.pathname === '/products') && (
        <button
          onClick={toggleCart}
          className="fixed bottom-6 left-6 z-40 bg-primary hover:bg-primary-hover text-white p-4 rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <FiShoppingBag className="w-5 h-5" />
          <span className="text-xs bg-amber-500 text-white rounded-full px-2 py-0.5 min-w-5 h-5 flex items-center justify-center font-extrabold">
            {cartCount}
          </span>
        </button>
      )}

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
