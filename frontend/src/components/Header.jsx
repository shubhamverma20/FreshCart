import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header({ searchVal, onSearchChange }) {
  const { cartCount, toggleCart } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <ion-icon name="basket-outline"></ion-icon>
          </div>
          FreshCart
        </Link>

        {isHome && (
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search for fresh vegetables, fruits, dairy..."
              value={searchVal}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <ion-icon
              name="search-outline"
              style={{
                position: 'absolute',
                right: '20px',
                top: '12px',
                fontSize: '20px',
                color: 'var(--text-secondary)'
              }}
            ></ion-icon>
          </div>
        )}

        <div className="nav-actions">
          {/* Always show track order link */}
          <Link to="/delivery" className="nav-link">
            <ion-icon name="location-outline"></ion-icon> Track Order
          </Link>

          {/* Admin link if user is verified/admin or for convenience */}
          <Link to="/admin" className="nav-link">
            <ion-icon name="grid-outline"></ion-icon> Admin
          </Link>

          {user ? (
            <>
              <span className="nav-link" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Hi, {user.name ? user.name.split(' ')[0] : 'User'}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Log In
              </Link>
              <Link to="/login?mode=signup" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}

          <button className="cart-btn" onClick={toggleCart}>
            <ion-icon name="cart-outline"></ion-icon>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}
