import React, { useState, useEffect } from 'react';
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

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
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
  const { login, signup, requestOTP, verifyOTP, loginWithGoogle, loginWithFacebook, loading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isOTPVerification, setIsOTPVerification] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [alert, setAlert] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'facebook' | null

  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsSignUp(mode === 'signup');
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const showAlert = (message, type) => setAlert({ message, type });
  const hideAlert = () => setAlert(null);

  const handleToggleMode = (e) => {
    if (e) e.preventDefault();
    hideAlert();
    setIsSignUp((prev) => !prev);
    setIsOTPVerification(false);
    setOtp('');
  };

  const handleResendOTP = async () => {
    showAlert('Resending OTP code...', 'info');
    const res = await requestOTP(email);
    if (res.success) {
      showAlert('A new OTP code has been sent to your email.', 'success');
    } else {
      showAlert(res.error || 'Failed to resend OTP.', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    hideAlert();
    const res = await loginWithGoogle();
    setSocialLoading(null);
    if (!res.success) showAlert(res.error || 'Google sign-in failed.', 'error');
  };

  const handleFacebookLogin = async () => {
    setSocialLoading('facebook');
    hideAlert();
    const res = await loginWithFacebook();
    setSocialLoading(null);
    if (!res.success) showAlert(res.error || 'Facebook sign-in failed.', 'error');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    hideAlert();
    setFormLoading(true);
    try {
      if (isOTPVerification) {
        const signupEmail = localStorage.getItem('signup_email') || email;
        const res = await verifyOTP(signupEmail, otp);
        if (res.success) {
          showAlert('Email verified! Redirecting to dashboard...', 'success');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          showAlert(res.error || 'Invalid or expired OTP code.', 'error');
        }
      } else if (isSignUp) {
        if (!name.trim()) { showAlert('Name is required', 'error'); return; }
        if (password.length < 6) { showAlert('Password must be at least 6 characters', 'error'); return; }
        const res = await signup(name, email, password);
        if (res.success) {
          showAlert('Registration successful! Sending verification code...', 'success');
          const otpRes = await requestOTP(email);
          if (otpRes.success) {
            setIsOTPVerification(true);
            setOtp('');
          } else {
            showAlert('Registered, but failed to send OTP automatically.', 'error');
          }
        } else {
          showAlert(res.error || 'Registration failed.', 'error');
        }
      } else {
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400/5 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-md">
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
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

          <div className="p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-white text-2xl font-bold mb-2">
                {isOTPVerification
                  ? '📩 Verify Your Email'
                  : isSignUp
                    ? '🚀 Create Account'
                    : '👋 Welcome Back'}
              </h1>
              <p className="text-gray-400 text-sm">
                {isOTPVerification
                  ? `Check your inbox — we sent a code to ${localStorage.getItem('signup_email') || email}`
                  : isSignUp
                    ? 'Join FreshCart for fresh grocery deliveries'
                    : 'Sign in to track orders and shop faster'}
              </p>
            </div>

            {/* Social Login Buttons (only when not in OTP mode) */}
            {!isOTPVerification && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Google */}
                  <button
                    id="btn-google-signin"
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isBusy}
                    className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {socialLoading === 'google' ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span className="group-hover:text-white/90">Google</span>
                  </button>

                  {/* Facebook */}
                  <button
                    id="btn-facebook-signin"
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={isBusy}
                    className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-blue-500/10 hover:border-blue-400/30 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {socialLoading === 'facebook' ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-blue-400 rounded-full animate-spin" />
                    ) : (
                      <FacebookIcon />
                    )}
                    <span className="group-hover:text-blue-300">Facebook</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center mb-6">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="px-4 text-gray-500 text-xs font-medium uppercase tracking-widest">
                    or continue with email
                  </span>
                  <div className="flex-1 border-t border-white/10" />
                </div>
              </>
            )}

            {/* Alert */}
            {alert && (
              <div
                className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium border flex items-start gap-2.5 ${
                  alert.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                    : alert.type === 'info'
                      ? 'bg-blue-500/10 border-blue-400/30 text-blue-300'
                      : 'bg-red-500/10 border-red-400/30 text-red-300'
                }`}
              >
                <span className="mt-0.5 flex-shrink-0">
                  {alert.type === 'success' ? '✓' : alert.type === 'info' ? 'ℹ' : '⚠'}
                </span>
                {alert.message}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && !isOTPVerification && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">Full Name</label>
                  <input
                    id="input-name"
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400/50 focus:bg-white/8 focus:ring-2 focus:ring-emerald-400/10 transition-all duration-200"
                  />
                </div>
              )}

              {!isOTPVerification ? (
                <>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1.5">Email Address</label>
                    <input
                      id="input-email"
                      type="email"
                      placeholder="email@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400/50 focus:bg-white/8 focus:ring-2 focus:ring-emerald-400/10 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        id="input-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400/50 focus:bg-white/8 focus:ring-2 focus:ring-emerald-400/10 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">6-Digit OTP Code</label>
                  <input
                    id="input-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm text-center tracking-[0.5em] text-lg font-bold focus:outline-none focus:border-emerald-400/50 focus:bg-white/8 focus:ring-2 focus:ring-emerald-400/10 transition-all duration-200"
                  />
                </div>
              )}

              {/* Submit button */}
              <button
                id="btn-auth-submit"
                type="submit"
                disabled={isBusy}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {formLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : isOTPVerification ? (
                  '✓ Verify Email'
                ) : isSignUp ? (
                  '→ Create Account'
                ) : (
                  '→ Sign In'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-500">
              {isOTPVerification ? (
                <span>
                  Didn't get the code?{' '}
                  <button
                    onClick={handleResendOTP}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    Resend OTP
                  </button>
                </span>
              ) : isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <a href="#" onClick={handleToggleMode} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                    Sign in
                  </a>
                </span>
              ) : (
                <span>
                  New to FreshCart?{' '}
                  <a href="#" onClick={handleToggleMode} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                    Create account
                  </a>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-600 text-xs mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
