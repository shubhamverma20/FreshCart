import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import AuthLayout from '../components/AuthLayout';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { loginWithGoogle, loginWithFacebook } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation & Loading
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email or phone number is required';
    } else if (email.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // Mock API Call
    setTimeout(() => {
      setIsLoading(false);
      showToast('Logged in successfully!', 'success');
      navigate('/');
    }, 1500);
  };

  const handleSocialLogin = async (provider) => {
    if (provider === 'Google') {
      const res = await loginWithGoogle();
      if (res.success) {
        showToast('Logged in with Google successfully!', 'success');
        navigate('/');
      } else {
        showToast(res.error || 'Google login failed', 'error');
      }
    } else {
      showToast(`${provider} login is not connected in this demo`, 'info');
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your account to track orders and checkout faster."
    >
      <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] border border-white/60 dark:border-slate-800/80 shadow-lg relative">
        
        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Email or Phone Number</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="name@example.com" 
              value={email} 
              onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: null}) }} 
              className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.email ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} pl-12 pr-4 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200 transition-colors`}
            />
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          </div>
          {errors.email && <span className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.email}</span>}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5 ml-1 pr-1">
            <label className="block text-xs font-bold text-slate-500">Password</label>
            <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline transition-all">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors({...errors, password: null}) }} 
              className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.password ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} pl-12 pr-12 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200 transition-colors`}
            />
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-450 hover:text-slate-650 cursor-pointer"
            >
              {showPassword ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
            </button>
          </div>
          {errors.password && <span className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.password}</span>}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2 ml-1">
          <input 
            type="checkbox" 
            id="remember" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-primary accent-primary cursor-pointer border-slate-300 dark:border-slate-600 focus:ring-primary"
          />
          <label htmlFor="remember" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
              Signing in...
            </div>
          ) : (
            'Sign In'
          )}
        </button>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
          <span className="relative px-4 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Or continue with</span>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm cursor-pointer transition-all"
          >
            <FaGoogle className="text-red-500" /> Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('Facebook')}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm cursor-pointer transition-all"
          >
            <FaFacebook className="text-blue-600" /> Facebook
          </button>
        </div>

        <div className="mt-8 text-center pt-2 text-sm font-semibold text-slate-500">
          New to FreshCart?{' '}
          <Link to="/register" className="text-primary hover:underline transition-all">
            Create an account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
