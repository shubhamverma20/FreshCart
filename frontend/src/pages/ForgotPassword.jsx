import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cooldown timer state
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    } else if (email.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/auth/password/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsSubmitted(true);
        setCooldown(60);
      } else {
        setError(data.message || 'Failed to send reset link');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      await fetch(`${apiBase}/api/auth/password/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setCooldown(60);
    } catch (err) {
      // Silently fail resend or show toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit} 
            className="space-y-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-slate-800/80 shadow-sm relative"
          >
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={(e) => { setEmail(e.target.value); if(error) setError(null); }} 
                  className={`w-full bg-slate-50 dark:bg-slate-800 border ${error ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} pl-11 pr-4 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200 transition-colors`}
                />
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              </div>
              {error && <span className="text-[10px] font-bold text-red-500 mt-1 ml-1">{error}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-500/10 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                  Sending Link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="mt-8 text-center pt-2">
              <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-1.5">
                <FiArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-slate-800/80 shadow-sm"
          >
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-primary mb-6 shadow-inner">
              <FiCheckCircle className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-display font-black text-slate-850 dark:text-white mb-2">Check your email</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
              We've sent a password reset link to <strong className="text-slate-700 dark:text-slate-200">{email}</strong>.
            </p>

            <button
              onClick={handleResend}
              disabled={cooldown > 0 || isLoading}
              className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-6 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-300 rounded-full animate-spin" /> 
                  Resending...
                </div>
              ) : cooldown > 0 ? (
                `Resend link in ${cooldown}s`
              ) : (
                'Resend Reset Link'
              )}
            </button>

            <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5">
              <FiArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
