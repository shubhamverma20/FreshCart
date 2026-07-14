import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import AuthLayout from '../components/AuthLayout';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { signup, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Validation & Loading
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Password Strength
  const [strengthScore, setStrengthScore] = useState(0); // 0 to 4

  useEffect(() => {
    // Calculate password strength
    let score = 0;
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    setStrengthScore(score);
  }, [password]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    
    if (!email) {
      newErrors.email = 'Email or phone number is required';
    } else if (email.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms & Conditions';
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
      showToast('Account created successfully!', 'success');
      navigate('/');
    }, 1500);
  };

  const handleSocialLogin = async (provider) => {
    if (provider === 'Google') {
      const res = await loginWithGoogle();
      if (res.success) {
        showToast('Registered with Google successfully!', 'success');
        navigate('/');
      } else {
        showToast(res.error || 'Google login failed', 'error');
      }
    } else {
      showToast(`${provider} login is not connected in this demo`, 'info');
    }
  };

  const strengthColors = ['bg-slate-200 dark:bg-slate-700', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-600'];
  const strengthLabels = ['Too Short', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join FreshCart today for quick and reliable grocery delivery."
    >
      <form onSubmit={handleSubmit} className="space-y-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] border border-white/60 dark:border-slate-800/80 shadow-lg relative">
        
        {/* Name Field */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Full Name</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="John Doe" 
              value={name} 
              onChange={(e) => { setName(e.target.value); if(errors.name) setErrors({...errors, name: null}) }} 
              className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.name ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} pl-12 pr-4 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200 transition-colors`}
            />
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          </div>
          {errors.name && <span className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.name}</span>}
        </div>

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
          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Password</label>
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
          
          {/* Strength Indicator */}
          {password.length > 0 && (
            <div className="mt-2 ml-1">
              <div className="flex gap-1 h-1.5 mb-1 w-full">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className={`flex-1 rounded-full ${strengthScore >= level ? strengthColors[strengthScore] : 'bg-slate-200 dark:bg-slate-700'} transition-colors duration-300`} />
                ))}
              </div>
              <div className="text-[10px] font-bold text-slate-500 text-right uppercase tracking-wider">{strengthLabels[strengthScore]}</div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Confirm Password</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={(e) => { setConfirmPassword(e.target.value); if(errors.confirmPassword) setErrors({...errors, confirmPassword: null}) }} 
              className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} pl-12 pr-12 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200 transition-colors`}
            />
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          </div>
          {errors.confirmPassword && <span className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.confirmPassword}</span>}
        </div>

        {/* Terms Checkbox */}
        <div>
          <div className="flex items-center gap-2 ml-1">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreeTerms}
              onChange={(e) => { setAgreeTerms(e.target.checked); if(errors.agreeTerms) setErrors({...errors, agreeTerms: null}) }}
              className={`w-4 h-4 rounded text-primary accent-primary cursor-pointer border-slate-300 dark:border-slate-600 focus:ring-primary ${errors.agreeTerms ? 'outline outline-1 outline-red-400' : ''}`}
            />
            <label htmlFor="terms" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none leading-tight">
              I agree to the <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
            </label>
          </div>
          {errors.agreeTerms && <span className="block text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.agreeTerms}</span>}
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
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>

        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
          <span className="relative px-4 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Or register with</span>
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

        <div className="mt-6 text-center pt-2 text-sm font-semibold text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline transition-all">
            Sign in here
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
