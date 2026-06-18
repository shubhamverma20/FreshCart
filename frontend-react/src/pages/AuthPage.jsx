import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// SVG Icons
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

export default function AuthPage() {
  const { 
    login, signup, requestOTP, verifyOTP, 
    loginWithGoogle, requestPasswordReset, resetPassword,
    setupRecaptcha, loginWithPhone, verifyPhoneOtp,
    loading, user 
  } = useAuth();
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 'login' | 'signup' | 'verify-email' | 'forgot-password' | 'reset-password' | 'phone-login' | 'verify-phone'
  const [view, setView] = useState('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') setView('signup');
  }, [searchParams]);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const showAlert = (message, type) => setAlert({ message, type });
  const hideAlert = () => setAlert(null);

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    hideAlert();
    const res = await loginWithGoogle();
    setSocialLoading(null);
    if (!res.success) showAlert(res.error || 'Google sign-in failed.', 'error');
  };

  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    hideAlert();
    
    // Auto-format Indian numbers if country code is missing
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.length === 10 && /^\d+$/.test(formattedPhone)) {
      formattedPhone = '+91' + formattedPhone;
    }

    if (!formattedPhone || formattedPhone.length < 10 || !formattedPhone.startsWith('+')) {
      showAlert('Please enter a valid phone number with country code (e.g. +91 9876543210)', 'error');
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
        showAlert(`OTP sent to ${formattedPhone} via SMS.`, 'success');
      } else {
        showAlert(res.error || 'Failed to send SMS OTP.', 'error');
      }
    } catch (err) {
      showAlert('Error setting up reCAPTCHA.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    hideAlert();
    setFormLoading(true);

    try {
      // 1. Verify Email OTP
      if (view === 'verify-email') {
        const signupEmail = localStorage.getItem('signup_email') || email;
        const res = await verifyOTP(signupEmail, otp);
        if (res.success) {
          showAlert('Email verified! Redirecting...', 'success');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          showAlert(res.error || 'Invalid or expired OTP code.', 'error');
        }
      } 
      // 2. Verify Phone OTP
      else if (view === 'verify-phone') {
        if (!confirmationResult) return;
        const res = await verifyPhoneOtp(confirmationResult, otp);
        if (res.success) {
          showAlert('Phone verified! Redirecting...', 'success');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          showAlert(res.error || 'Invalid phone OTP.', 'error');
        }
      }
      // 3. Request Password Reset OTP
      else if (view === 'forgot-password') {
        if (!isValidEmail(email)) { showAlert('Please enter a valid email.', 'error'); setFormLoading(false); return; }
        const res = await requestPasswordReset(email);
        if (res.success) {
          setView('reset-password');
          setOtp('');
          setPassword('');
          showAlert('Password reset OTP sent to your email.', 'success');
        } else {
          showAlert(res.error || 'Failed to request reset.', 'error');
        }
      }
      // 4. Reset Password
      else if (view === 'reset-password') {
        if (password.length < 6) { showAlert('New password must be at least 6 characters.', 'error'); setFormLoading(false); return; }
        const res = await resetPassword(email, otp, password);
        if (res.success) {
          showAlert('Password reset successfully! You can now sign in.', 'success');
          setView('login');
          setPassword('');
        } else {
          showAlert(res.error || 'Failed to reset password.', 'error');
        }
      }
      // 5. Sign Up
      else if (view === 'signup') {
        if (!name.trim()) { showAlert('Name is required', 'error'); setFormLoading(false); return; }
        if (!isValidEmail(email)) { showAlert('Please enter a valid email.', 'error'); setFormLoading(false); return; }
        if (password.length < 6) { showAlert('Password must be at least 6 characters', 'error'); setFormLoading(false); return; }
        
        const res = await signup(name, email, password);
        if (res.success) {
          showAlert('Registration successful! Sending verification code...', 'success');
          const otpRes = await requestOTP(email);
          if (otpRes.success) {
            setView('verify-email');
            setOtp('');
          } else {
            showAlert('Registered, but failed to send OTP automatically.', 'error');
          }
        } else {
          showAlert(res.error || 'Registration failed.', 'error');
        }
      } 
      // 6. Login
      else if (view === 'login') {
        if (!isValidEmail(email)) { showAlert('Please enter a valid email.', 'error'); setFormLoading(false); return; }
        const res = await login(email, password);
        if (res.success) {
          showAlert('Login successful! Redirecting...', 'success');
          setTimeout(() => navigate('/dashboard'), 1200);
        } else {
          showAlert(res.error || 'Login failed.', 'error');
        }
      }
    } catch {
      showAlert('An unexpected error occurred.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const isBusy = formLoading || loading || socialLoading !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6M17 19a1 1 0 100 2 1 1 0 000-2zM9 19a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">FreshCart</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

          <div className="p-8 sm:p-10">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-white text-2xl font-bold mb-2">
                {view === 'verify-email' ? '📩 Verify Your Email' :
                 view === 'verify-phone' ? '📱 Verify Phone Number' :
                 view === 'signup' ? '🚀 Create Account' :
                 view === 'forgot-password' ? '🔑 Reset Password' :
                 view === 'reset-password' ? '🔐 Create New Password' :
                 view === 'phone-login' ? '📱 Phone Login' :
                 '👋 Welcome Back'}
              </h1>
              <p className="text-gray-400 text-sm">
                {view === 'verify-email' ? `Check your inbox for OTP sent to ${localStorage.getItem('signup_email') || email}` :
                 view === 'verify-phone' ? `Enter the SMS code sent to ${phoneNumber}` :
                 view === 'signup' ? 'Join FreshCart for fresh grocery deliveries' :
                 view === 'forgot-password' ? 'Enter your email to receive a reset code' :
                 view === 'reset-password' ? 'Enter the OTP and your new password' :
                 view === 'phone-login' ? 'Sign in securely using your mobile number' :
                 'Sign in to track orders and shop faster'}
              </p>
            </div>

            {/* Social & Alternative Logins */}
            {(view === 'login' || view === 'signup' || view === 'phone-login') && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isBusy}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {socialLoading === 'google' ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <GoogleIcon />}
                    <span>Google</span>
                  </button>
                  {/* Toggle Phone/Email */}
                  <button
                    type="button"
                    onClick={() => setView(view === 'phone-login' ? 'login' : 'phone-login')}
                    disabled={isBusy}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    <PhoneIcon />
                    <span>{view === 'phone-login' ? 'Use Email' : 'Use Phone'}</span>
                  </button>
                </div>

                <div className="relative flex items-center mb-6">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="px-4 text-gray-500 text-xs font-medium uppercase tracking-widest">
                    or
                  </span>
                  <div className="flex-1 border-t border-white/10" />
                </div>
              </>
            )}

            {/* Alert */}
            {alert && (
              <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium border flex items-start gap-2.5 ${alert.type === 'success' ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300' : 'bg-red-500/10 border-red-400/30 text-red-300'}`}>
                <span className="mt-0.5">{alert.type === 'success' ? '✓' : '⚠'}</span>
                <span>{alert.message}</span>
              </div>
            )}


            {/* Form */}
            <form onSubmit={view === 'phone-login' ? handleSendPhoneOtp : handleSubmit} className="space-y-4">
              
              {/* Name Field */}
              {view === 'signup' && (
                <div>
                  <label className="block text-gray-300 text-xs font-semibold uppercase mb-2 ml-1">Full Name</label>
                  <input type="text" placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} required
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400 focus:bg-slate-800 focus:ring-4 focus:ring-emerald-400/20 transition-all" />
                </div>
              )}

              {/* Email Field */}
              {['login', 'signup', 'forgot-password'].includes(view) && (
                <div>
                  <label className="block text-gray-300 text-xs font-semibold uppercase mb-2 ml-1">Email Address</label>
                  <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400 focus:bg-slate-800 focus:ring-4 focus:ring-emerald-400/20 transition-all" />
                </div>
              )}

              {/* Phone Number Field */}
              {view === 'phone-login' && (
                <div>
                  <label className="block text-gray-300 text-xs font-semibold uppercase mb-2 ml-1">Phone Number</label>
                  <input type="tel" placeholder="+91 9876543210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400 focus:bg-slate-800 focus:ring-4 focus:ring-emerald-400/20 transition-all" />
                </div>
              )}

              {/* Password Field */}
              {['login', 'signup', 'reset-password'].includes(view) && (
                <div>
                  <div className="flex justify-between items-center mb-2 ml-1 pr-1">
                    <label className="block text-gray-300 text-xs font-semibold uppercase">
                      {view === 'reset-password' ? 'New Password' : 'Password'}
                    </label>
                    {view === 'login' && (
                      <button type="button" onClick={() => { setView('forgot-password'); hideAlert(); }} className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-colors">
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                      className="w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400 focus:bg-slate-800 focus:ring-4 focus:ring-emerald-400/20 transition-all" />
                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-all">
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Field */}
              {['verify-email', 'verify-phone', 'reset-password'].includes(view) && (
                <div>
                  <label className="block text-gray-300 text-xs font-semibold uppercase mb-2 ml-1">6-Digit OTP Code</label>
                  <input type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required
                    className="w-full px-4 py-4 rounded-xl bg-slate-800/80 border border-slate-700/50 text-emerald-400 placeholder-slate-600 text-center tracking-[1em] text-2xl font-bold focus:outline-none focus:border-emerald-400 focus:bg-slate-800 focus:ring-4 focus:ring-emerald-400/20 transition-all" />
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" disabled={isBusy}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm uppercase tracking-wide shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 mt-6 disabled:opacity-60 disabled:cursor-not-allowed">
                {formLoading ? (
                  <><div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" /> Processing...</>
                ) : view === 'verify-email' ? 'Verify Email'
                  : view === 'verify-phone' ? 'Verify Phone'
                  : view === 'signup' ? 'Create Account'
                  : view === 'forgot-password' ? 'Send Reset Code'
                  : view === 'reset-password' ? 'Update Password'
                  : view === 'phone-login' ? 'Send SMS Code'
                  : 'Sign In'}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm text-gray-500">
              {view === 'verify-email' ? (
                <span>Didn't get the code? <button onClick={() => requestOTP(email)} className="text-emerald-400 hover:text-emerald-300 font-semibold">Resend Email OTP</button></span>
              ) : ['forgot-password', 'reset-password'].includes(view) ? (
                <span>Remember your password? <button onClick={() => setView('login')} className="text-emerald-400 hover:text-emerald-300 font-semibold">Sign in</button></span>
              ) : view === 'signup' ? (
                <span>Already have an account? <button onClick={() => setView('login')} className="text-emerald-400 hover:text-emerald-300 font-semibold">Sign in</button></span>
              ) : (
                <span>New to FreshCart? <button onClick={() => setView('signup')} className="text-emerald-400 hover:text-emerald-300 font-semibold">Create account</button></span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden reCAPTCHA container moved outside to prevent layout shift */}
      <div id="recaptcha-container" className="fixed bottom-0 right-0 z-50"></div>
    </div>
  );
}
