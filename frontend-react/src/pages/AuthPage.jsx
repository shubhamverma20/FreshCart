import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, signup, requestOTP, verifyOTP, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isOTPVerification, setIsOTPVerification] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [alert, setAlert] = useState(null); // { message, type: 'success' | 'error' }
  const [formLoading, setFormLoading] = useState(false);

  // Sync mode from query param if any (e.g. ?mode=signup)
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [searchParams]);

  // If user is already logged in and verified, redirect to home
  useEffect(() => {
    if (user && user.isVerified) {
      navigate('/');
    }
  }, [user, navigate]);

  const showAlert = (message, type) => {
    setAlert({ message, type });
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const handleToggleMode = (e) => {
    if (e) e.preventDefault();
    hideAlert();
    setIsSignUp(!isSignUp);
    setIsOTPVerification(false);
    setOtp('');
  };

  const handleResendOTP = async () => {
    showAlert("Resending OTP code...", "success");
    const res = await requestOTP(email);
    if (res.success) {
      showAlert("A new OTP code has been sent to your email.", "success");
    } else {
      showAlert(res.error || "Failed to resend OTP.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    hideAlert();
    setFormLoading(true);

    try {
      if (isOTPVerification) {
        // OTP verify flow
        const signupEmail = localStorage.getItem('signup_email') || email;
        const res = await verifyOTP(signupEmail, otp);
        if (res.success) {
          showAlert("Email verified successfully! Redirecting...", "success");
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          showAlert(res.error || "Invalid or expired OTP code.", "error");
        }
      } else if (isSignUp) {
        // Sign up flow
        if (!name.trim()) {
          showAlert("Name is required", "error");
          setFormLoading(false);
          return;
        }
        if (password.length < 6) {
          showAlert("Password must be at least 6 characters long", "error");
          setFormLoading(false);
          return;
        }

        const res = await signup(name, email, password);
        if (res.success) {
          showAlert("Registration successful! Triggering verification code...", "success");
          const otpRes = await requestOTP(email);
          if (otpRes.success) {
            setIsOTPVerification(true);
            setOtp('');
          } else {
            showAlert("Registration complete, but failed to send verification OTP automatically.", "error");
          }
        } else {
          showAlert(res.error || "Registration failed.", "error");
        }
      } else {
        // Login flow
        const res = await login(email, password);
        if (res.success) {
          showAlert("Login successful! Redirecting...", "success");
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          showAlert(res.error || "Login failed.", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showAlert("An unexpected error occurred.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Page-specific inline CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .auth-container {
            min-height: calc(100vh - 100px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%);
            margin-top: 80px;
            width: 100%;
        }
        
        .auth-card {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            width: 100%;
            max-width: 450px;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            text-align: center;
        }

        .auth-title {
            font-size: 28px;
            margin-bottom: 8px;
        }

        .auth-subtitle {
            color: var(--text-secondary);
            margin-bottom: 30px;
            font-size: 14px;
        }

        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }

        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
            color: var(--text-primary);
        }

        .form-input {
            width: 100%;
            padding: 14px 16px;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            font-family: 'Inter';
            font-size: 15px;
            transition: all 0.3s;
            background: #F8FAFC;
            box-sizing: border-box;
        }

        .form-input:focus {
            outline: none;
            border-color: var(--primary-color);
            background: white;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .btn-auth {
            width: 100%;
            padding: 14px;
            font-size: 16px;
            border-radius: 12px;
            margin-top: 10px;
        }

        .social-login {
            margin-top: 30px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .btn-social {
            background: white;
            border: 1px solid var(--border-color);
            padding: 12px;
            border-radius: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s;
            color: var(--text-primary);
        }

        .btn-social:hover {
            background: #f1f5f9;
        }
        
        .divider {
            display: flex;
            align-items: center;
            text-align: center;
            margin: 20px 0;
            color: var(--text-secondary);
            font-size: 14px;
        }

        .divider::before, .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid var(--border-color);
        }

        .divider:not(:empty)::before { margin-right: 15px; }
        .divider:not(:empty)::after { margin-left: 15px; }
      `}} />

      <div className="auth-card fade-in">
        <h1 className="auth-title">
          {isOTPVerification 
            ? "Verify Your Email" 
            : isSignUp 
              ? "Create Account" 
              : "Welcome Back"
          }
        </h1>
        <p className="auth-subtitle">
          {isOTPVerification
            ? `Enter the 6-digit OTP code sent to: ${localStorage.getItem('signup_email') || email}`
            : isSignUp
              ? "Sign up today for fresh grocery deliveries."
              : "Log in to track your orders and fast checkout."
          }
        </p>

        <form onSubmit={handleSubmit}>
          {isSignUp && !isOTPVerification && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {!isOTPVerification ? (
            <>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">Verification OTP</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          )}

          {alert && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '20px',
                fontWeight: '500',
                textAlign: 'left',
                border: `1px solid ${alert.type === 'success' ? '#10b981' : '#ef4444'}`,
                background: alert.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: alert.type === 'success' ? '#065f46' : '#991b1b'
              }}
            >
              {alert.message}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary btn-auth"
            disabled={formLoading}
          >
            {formLoading 
              ? "Processing..." 
              : isOTPVerification 
                ? "Verify OTP Code" 
                : isSignUp 
                  ? "Sign Up Now" 
                  : "Log In Now"
            }
          </button>
        </form>

        <div className="divider">OR CONTINUE WITH</div>

        <div className="social-login">
          <button className="btn-social" type="button">
            <ion-icon name="logo-google" style={{ color: '#EA4335' }}></ion-icon> Google
          </button>
          <button className="btn-social" type="button" onClick={handleToggleMode}>
            <ion-icon name="person-add-outline" style={{ color: 'var(--primary-color)' }}></ion-icon> Toggle Mode
          </button>
        </div>

        <p style={{ marginTop: '30px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isOTPVerification ? (
            <a href="#" onClick={(e) => { e.preventDefault(); handleResendOTP(); }} style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
              Resend OTP Code
            </a>
          ) : isSignUp ? (
            <>
              Already have an account?{' '}
              <a href="#" onClick={handleToggleMode} style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                Log in
              </a>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <a href="#" onClick={handleToggleMode} style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                Sign up
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
