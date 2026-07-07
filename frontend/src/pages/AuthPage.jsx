import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// SVG Icons
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  const [view, setView] = useState(() => searchParams.get('mode') === 'signup' ? 'signup' : 'login');

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
    } catch {
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
    <div className="min-h-screen w-full bg-emerald-50/50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">

      {/* Decorative Blob Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md mx-auto relative z-10">

        <div className="flex justify-center text-emerald-600 mb-6 drop-shadow-md cursor-pointer" onClick={() => navigate('/')}>
          <ion-icon name="basket" style={{ fontSize: '48px' }}></ion-icon>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {view === 'verify-email' ? 'Verify Your Email' :
            view === 'verify-phone' ? 'Verify Phone Number' :
              view === 'signup' ? 'Create Your Account' :
                view === 'forgot-password' ? 'Reset Password' :
                  view === 'reset-password' ? 'Create New Password' :
                    view === 'phone-login' ? 'Welcome Back' :
                      'Welcome to FreshCart'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w-sm mx-auto">
          {view === 'verify-email' ? `We sent an OTP to ${localStorage.getItem('signup_email') || email}` :
            view === 'verify-phone' ? `Enter the SMS code sent to ${phoneNumber}` :
              view === 'signup' ? 'Get fresh groceries delivered to your door in minutes' :
                view === 'forgot-password' ? 'Enter your email to receive a secure reset code' :
                  view === 'reset-password' ? 'Enter the OTP and pick a strong new password' :
                    view === 'phone-login' ? 'Sign in securely using your mobile number' :
                      'Sign in to track orders, manage your cart, and checkout faster'}
        </p>
      </div>

      <div className="mt-8 w-full max-w-[440px] mx-auto relative z-10">

        <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl sm:px-12 border border-white/50">

          {/* Social & Alternative Logins */}
          {(view === 'login' || view === 'signup' || view === 'phone-login') && (
            <div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isBusy}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow transition-all disabled:opacity-50"
                >
                  {socialLoading === 'google' ? (
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <GoogleIcon />
                      <span className="ml-2">Google</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setView(view === 'phone-login' ? 'login' : 'phone-login')}
                  disabled={isBusy}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow transition-all disabled:opacity-50"
                >
                  <PhoneIcon />
                  <span className="ml-2">{view === 'phone-login' ? 'Use Email' : 'Use Phone'}</span>
                </button>
              </div>

              <div className="mt-8 mb-8 relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>
            </div>
          )}

          {/* Alert */}
          {alert && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-start gap-3 shadow-sm border ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-800 border-red-100'}`}>
              <div className="mt-0.5">{alert.type === 'success' ? '✓' : '⚠'}</div>
              <div>{alert.message}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={view === 'phone-login' ? handleSendPhoneOtp : handleSubmit}>

            {/* Name Field */}
            {view === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Full Name</label>
                <div className="mt-1">
                  <input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-colors bg-white" />
                </div>
              </div>
            )}

            {/* Email Field */}
            {['login', 'signup', 'forgot-password'].includes(view) && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email address</label>
                <div className="mt-1">
                  <input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-colors bg-white" />
                </div>
              </div>
            )}

            {/* Phone Number Field */}
            {view === 'phone-login' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Phone Number</label>
                <div className="mt-1">
                  <input id="phone" type="tel" placeholder="+91 9876543210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-colors bg-white" />
                </div>
              </div>
            )}

            {/* Password Field */}
            {['login', 'signup', 'reset-password'].includes(view) && (
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1 pr-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {view === 'reset-password' ? 'New Password' : 'Password'}
                  </label>
                  {view === 'login' && (
                    <button type="button" onClick={() => { setView('forgot-password'); hideAlert(); }} className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="mt-1 relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-colors pr-12 bg-white" />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
            )}

            {/* OTP Field */}
            {['verify-email', 'verify-phone', 'reset-password'].includes(view) && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1 text-center">6-Digit Code</label>
                <div className="mt-1">
                  <input id="otp" type="text" inputMode="numeric" maxLength={6} placeholder="------" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required
                    className="block w-full px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] border border-gray-200 rounded-xl shadow-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-600 transition-colors bg-white" />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isBusy}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Processing...</>
                ) : view === 'verify-email' ? 'Verify Email'
                  : view === 'verify-phone' ? 'Verify Phone'
                    : view === 'signup' ? 'Create Account'
                      : view === 'forgot-password' ? 'Send Reset Code'
                        : view === 'reset-password' ? 'Update Password'
                          : view === 'phone-login' ? 'Send SMS Code'
                            : 'Sign in to FreshCart'}
              </button>
            </div>
          </form>

          {/* Footer Nav */}
          <div className="mt-8 text-center">
            {view === 'verify-email' ? (
              <p className="text-sm text-gray-600">Didn't get the code? <button onClick={() => requestOTP(email)} className="font-semibold text-emerald-600 hover:text-emerald-500">Resend Code</button></p>
            ) : ['forgot-password', 'reset-password'].includes(view) ? (
              <p className="text-sm text-gray-600">Remember your password? <button onClick={() => setView('login')} className="font-semibold text-emerald-600 hover:text-emerald-500">Sign in instead</button></p>
            ) : view === 'signup' ? (
              <p className="text-sm text-gray-600">Already have an account? <button onClick={() => setView('login')} className="font-semibold text-emerald-600 hover:text-emerald-500">Sign in</button></p>
            ) : (
              <p className="text-sm text-gray-600">New to FreshCart? <button onClick={() => setView('signup')} className="font-semibold text-emerald-600 hover:text-emerald-500">Create an account</button></p>
            )}
          </div>
        </div>
      </div>

      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" className="fixed bottom-0 right-0 z-50"></div>
    </div>
  );
}
