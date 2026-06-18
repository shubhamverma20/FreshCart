import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebase/config';

const AuthContext = createContext();

// Smart Environment Detection
const IS_PRODUCTION =
  window.location.hostname.includes('localhost') ||
  window.location.hostname.includes('127.0.0.1')
    ? false
    : true;
const PRODUCTION_API_URL = 'https://freshcart-dewk.onrender.com';
export const API_BASE = import.meta.env.VITE_API_BASE ||
  (IS_PRODUCTION ? PRODUCTION_API_URL : 'http://localhost:5000');

/** Sync Firebase user to MongoDB via backend */
async function syncFirebaseUser(firebaseUser, providerName) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/firebase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        profilePicture: firebaseUser.photoURL || '',
        provider: providerName,
        firebaseUid: firebaseUser.uid
      })
    });
    const data = await res.json();
    if (res.ok) return data;
    console.error('[AuthContext] Backend sync failed:', data.message);
    return null;
  } catch (err) {
    console.error('[AuthContext] Backend sync error:', err);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // Firebase init loading
  const [error, setError] = useState(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setAuthLoading(false);
      if (!firebaseUser && !localStorage.getItem('token')) {
        // If Firebase says logged out and no local token, clear state
        setUser(null);
        setToken(null);
      }
    });
    return () => unsubscribe();
  }, []);

  /** Google Sign-In */
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const backendData = await syncFirebaseUser(firebaseUser, 'google');

      const userData = backendData?.user || {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        profilePicture: firebaseUser.photoURL,
        provider: 'google',
        isVerified: true
      };
      const jwtToken = backendData?.token || null;

      localStorage.setItem('user', JSON.stringify(userData));
      if (jwtToken) localStorage.setItem('token', jwtToken);
      setUser(userData);
      setToken(jwtToken);
      return { success: true };
    } catch (err) {
      const msg = err.code === 'auth/popup-closed-by-user'
        ? 'Sign-in popup was closed.'
        : err.message || 'Google sign-in failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /** Facebook Sign-In */
  const loginWithFacebook = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const firebaseUser = result.user;
      const backendData = await syncFirebaseUser(firebaseUser, 'facebook');

      const userData = backendData?.user || {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        profilePicture: firebaseUser.photoURL,
        provider: 'facebook',
        isVerified: true
      };
      const jwtToken = backendData?.token || null;

      localStorage.setItem('user', JSON.stringify(userData));
      if (jwtToken) localStorage.setItem('token', jwtToken);
      setUser(userData);
      setToken(jwtToken);
      return { success: true };
    } catch (err) {
      const msg = err.code === 'auth/popup-closed-by-user'
        ? 'Sign-in popup was closed.'
        : err.message || 'Facebook sign-in failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /** Email/Password Login */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /** Email/Password Signup */
  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('signup_email', email);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send verification code');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const verifyOTP = async (email, otp) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      const updatedUser = { ...user, isVerified: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.removeItem('signup_email');
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore firebase sign-out error
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('signup_email');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authLoading,
        error,
        isAuthenticated: !!user,
        login,
        signup,
        loginWithGoogle,
        loginWithFacebook,
        requestOTP,
        verifyOTP,
        logout,
        apiBase: API_BASE
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
