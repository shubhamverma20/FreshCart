import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Header from './components/Header';
import CartSidebar from './components/CartSidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import CartCheckout from './pages/CartCheckout';
import DeliveryTracking from './pages/DeliveryTracking';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';

// Layout wrapper to conditionally render Header/Sidebar
function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Hide Header/CartSidebar on auth, admin, and dashboard routes
  const hideShell =
    location.pathname === '/admin' ||
    location.pathname === '/login' ||
    location.pathname === '/dashboard';

  return (
    <>
      {/* Conditionally render header and sidebar */}
      {!hideShell && (
        <Header searchVal={searchQuery} onSearchChange={setSearchQuery} />
      )}
      {!hideShell && <CartSidebar />}

      <Routes>
        <Route path="/" element={<Home searchQuery={searchQuery} />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/cart" element={<CartCheckout />} />
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
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
