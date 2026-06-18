import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Redirects unauthenticated users to /login.
 * Shows a loading spinner while Firebase auth initializes.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-gray-900 to-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-emerald-300 text-sm font-medium tracking-wide">Checking session...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
