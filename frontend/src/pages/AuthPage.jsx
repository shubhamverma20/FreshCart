import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiMail, 
  FiLock, 
  FiUser, 
  FiEye, 
  FiEyeOff, 
  FiSmartphone, 
  FiArrowLeft, 
  FiSun, 
  FiMoon, 
  FiShoppingBag,
  FiPhoneCall 
} from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const {
    login, signup, requestOTP, verifyOTP,
    loginWithGoogle, requestPasswordReset, resetPassword,
    setupRecaptcha, loginWithPhone, verifyPhoneOtp,
    loading, user
  } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // 'login' | 'signup' | 'verify-email' | 'forgot-password' | 'reset-password' | 'phone-login' | 'verify-phone'
  const [view, setView] = useState(() => searchParams.get('mode') === 'signup' ? 'signup' : 'login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    const res = await loginWithGoogle();
    setSocialLoading(null);
    if (res.success) {
      showToast('Logged in with Google!', 'success');
      navigate('/dashboard');
    } else {
      showToast(res.error || 'Google sign-in failed.', 'error');
    }
  };

  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.length === 10 && /^\d+$/.test(formattedPhone)) {
      formattedPhone = '+91' + formattedPhone;
    }

    if (!formattedPhone || formattedPhone.length < 10 || !formattedPhone.startsWith('+')) {
      showToast('Please enter a valid phone number with country code (e.g. +91 9876543210)', 'error');
      return;
    }

    setFormLoading(true);
    try {
      const appVerifier = setupRecaptcha('recaptcha-container');
      const res = await loginWithPhone(formattedPhone, appVerifier);
      if (res.success) {
        setConfirmationResult(res.confirmationResult);
        setView('verify-phone');
        setOtp('');
        showToast(`Verification code sent to ${formattedPhone}!`, 'success');
      } else {
        showToast(res.error || 'Failed to send SMS OTP.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error setting up verification.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // 1. Verify Email OTP
      if (view === 'verify-email') {
        const signupEmail = localStorage.getItem('signup_email') || email;
        const res = await verifyOTP(signupEmail, otp);
        if (res.success) {
          showToast('Email verified successfully!', 'success');
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          showToast(res.error || 'Invalid or expired OTP code.', 'error');
        }
      }
      // 2. Verify Phone OTP
      else if (view === 'verify-phone') {
        if (!confirmationResult) return;
        const res = await verifyPhoneOtp(confirmationResult, otp);
        if (res.success) {
          showToast('Phone verified successfully!', 'success');
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          showToast(res.error || 'Invalid phone OTP.', 'error');
        }
      }
      // 3. Request Password Reset OTP
      else if (view === 'forgot-password') {
        if (!isValidEmail(email)) { showToast('Please enter a valid email.', 'error'); setFormLoading(false); return; }
        const res = await requestPasswordReset(email);
        if (res.success) {
          setView('reset-password');
          setOtp('');
          setPassword('');
          showToast('Password reset code sent to your email.', 'success');
        } else {
          showToast(res.error || 'Failed to request reset.', 'error');
        }
      }
      // 4. Reset Password
      else if (view === 'reset-password') {
        if (password.length < 6) { showToast('New password must be at least 6 characters.', 'error'); setFormLoading(false); return; }
        const res = await resetPassword(email, otp, password);
        if (res.success) {
          showToast('Password reset successfully! You can now log in.', 'success');
          setView('login');
          setPassword('');
        } else {
          showToast(res.error || 'Failed to reset password.', 'error');
        }
      }
      // 5. Sign Up
      else if (view === 'signup') {
        if (!name.trim()) { showToast('Name is required', 'error'); setFormLoading(false); return; }
        if (!isValidEmail(email)) { showToast('Please enter a valid email.', 'error'); setFormLoading(false); return; }
        if (password.length < 6) { showToast('Password must be at least 6 characters', 'error'); setFormLoading(false); return; }

        const res = await signup(name, email, password);
        if (res.success) {
          showToast('Registration successful! Sending verification code...', 'success');
          const otpRes = await requestOTP(email);
          if (otpRes.success) {
            setView('verify-email');
            setOtp('');
          } else {
            showToast('Registered, but failed to send verification email automatically.', 'warning');
          }
        } else {
          showToast(res.error || 'Registration failed.', 'error');
        }
      }
      // 6. Login
      else if (view === 'login') {
        if (!isValidEmail(email)) { showToast('Please enter a valid email.', 'error'); setFormLoading(false); return; }
        const res = await login(email, password);
        if (res.success) {
          showToast('Login successful!', 'success');
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          showToast(res.error || 'Login failed. Check your credentials.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const isBusy = formLoading || loading || socialLoading !== null;

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans transition-colors duration-300">
      
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200 dark:bg-emerald-950/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 dark:opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-teal-200 dark:bg-teal-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 dark:opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-amber-100 dark:bg-amber-950/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 dark:opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md mx-auto relative z-10">
        
        {/* Floating Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="absolute right-0 top-0 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-350 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all"
        >
          {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>

        <div className="flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <FiShoppingBag className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-3xl font-display font-black text-slate-800 dark:text-white tracking-tight">
            {view === 'verify-email' && 'Verify Your Email'}
            {view === 'verify-phone' && 'Verify Phone Number'}
            {view === 'signup' && 'Create Your Account'}
            {view === 'forgot-password' && 'Reset Password'}
            {view === 'reset-password' && 'Create New Password'}
            {view === 'phone-login' && 'Welcome Back'}
            {view === 'login' && 'Welcome to FreshCart'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            {view === 'verify-email' && `We sent a 6-digit code to ${localStorage.getItem('signup_email') || email}`}
            {view === 'verify-phone' && `Enter the SMS code sent to ${phoneNumber}`}
            {view === 'signup' && 'Get fresh groceries delivered to your door in 10 minutes'}
            {view === 'forgot-password' && 'Enter your email to receive a secure reset code'}
            {view === 'reset-password' && 'Enter the OTP and pick a strong new password'}
            {view === 'phone-login' && 'Sign in securely using your mobile number'}
            {view === 'login' && 'Sign in to track orders, manage your cart, and checkout faster'}
          </p>
        </div>

        {/* Card Box */}
        <div className="mt-8 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl py-10 px-6 sm:px-10 border border-white/40 dark:border-slate-800/80 shadow-xl rounded-3xl relative">
          
          {/* Social Logins */}
          {(view === 'login' || view === 'signup' || view === 'phone-login') && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isBusy}
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-sm cursor-pointer transition-all disabled:opacity-50"
                >
                  <FaGoogle className="text-red-500" /> Google
                </button>
                <button
                  type="button"
                  onClick={() => setView(view === 'phone-login' ? 'login' : 'phone-login')}
                  disabled={isBusy}
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-sm cursor-pointer transition-all disabled:opacity-50"
                >
                  <FiSmartphone className="text-primary" /> {view === 'phone-login' ? 'Email' : 'Phone'}
                </button>
              </div>

              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-850" /></div>
                <span className="relative px-3 bg-white dark:bg-slate-900 text-xs font-bold text-slate-400 uppercase tracking-wider">Or continue with</span>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={view === 'phone-login' ? handleSendPhoneOtp : handleSubmit}>
            
            {/* Full Name */}
            {view === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-left">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                </div>
              </div>
            )}

            {/* Email Address */}
            {['login', 'signup', 'forgot-password'].includes(view) && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-left">Email address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                </div>
              </div>
            )}

            {/* Phone Number Input */}
            {view === 'phone-login' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-left">Phone Number</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    placeholder="+91 9876543210" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                  <FiSmartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                </div>
              </div>
            )}

            {/* Password input */}
            {['login', 'signup', 'reset-password'].includes(view) && (
              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1 pr-1">
                  <label className="block text-xs font-bold text-slate-500">
                    {view === 'reset-password' ? 'New Password' : 'Password'}
                  </label>
                  {view === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => setView('forgot-password')} 
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-11 pr-12 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
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
              </div>
            )}

            {/* OTP Code */}
            {['verify-email', 'verify-phone', 'reset-password'].includes(view) && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-center">6-Digit Code</label>
                <input 
                  type="text" 
                  maxLength={6} 
                  placeholder="------" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                  required
                  className="block w-full px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:border-primary text-primary transition-colors bg-slate-50 dark:bg-slate-800" 
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-4 px-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-500/10 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...
                </>
              ) : (
                <>
                  {view === 'verify-email' && 'Verify Email'}
                  {view === 'verify-phone' && 'Verify Phone'}
                  {view === 'signup' && 'Create Account'}
                  {view === 'forgot-password' && 'Send Reset Code'}
                  {view === 'reset-password' && 'Update Password'}
                  {view === 'phone-login' && 'Send SMS Code'}
                  {view === 'login' && 'Sign in to FreshCart'}
                </>
              )}
            </button>

          </form>

          {/* Footer Back Options */}
          <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-850 pt-5 text-sm font-semibold">
            {view === 'verify-email' ? (
              <p className="text-slate-500">Didn't get the code? <button onClick={() => { requestOTP(email); showToast('Resending OTP code...', 'info'); }} className="text-primary hover:underline cursor-pointer">Resend Code</button></p>
            ) : ['forgot-password', 'reset-password', 'phone-login'].includes(view) ? (
              <button onClick={() => setView('login')} className="text-slate-500 hover:text-primary flex items-center gap-1.5 mx-auto cursor-pointer">
                <FiArrowLeft className="w-4 h-4" /> Sign in instead
              </button>
            ) : view === 'signup' ? (
              <p className="text-slate-500">Already have an account? <button onClick={() => setView('login')} className="text-primary hover:underline cursor-pointer">Sign in</button></p>
            ) : (
              <p className="text-slate-500">New to FreshCart? <button onClick={() => setView('signup')} className="text-primary hover:underline cursor-pointer">Create an account</button></p>
            )}
          </div>

        </div>

      </div>
      
      {/* reCAPTCHA hidden badge for Firebase */}
      <div id="recaptcha-container" className="fixed bottom-0 right-0 z-50"></div>
    </div>
  );
}
