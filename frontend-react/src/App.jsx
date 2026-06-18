import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Header from './components/Header';
import CartSidebar from './components/CartSidebar';

// Pages
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import CartCheckout from './pages/CartCheckout';
import DeliveryTracking from './pages/DeliveryTracking';
import AdminDashboard from './pages/AdminDashboard';

// Layout wrapper to conditionally render Header/Sidebar
function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // We check the path to hide Header/CartSidebar on the Admin route
  const isAdminPath = location.pathname === '/admin';

  return (
    <>
      {/* Conditionally render header and sidebar */}
      {!isAdminPath && (
        <Header searchVal={searchQuery} onSearchChange={setSearchQuery} />
      )}
      {!isAdminPath && <CartSidebar />}

      <Routes>
        <Route path="/" element={<Home searchQuery={searchQuery} />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/cart" element={<CartCheckout />} />
        <Route path="/delivery" element={<DeliveryTracking />} />
        <Route path="/admin" element={<AdminDashboard />} />
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
