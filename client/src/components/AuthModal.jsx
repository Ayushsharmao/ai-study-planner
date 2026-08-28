import React, { useState, useEffect, useRef } from 'react';
import { Lock, Mail, User, ArrowRight, X, Sparkles, KeyRound, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import * as api from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState('form'); // 'form' | 'otp'

  // Form Fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpNotice, setOtpNotice] = useState(null);

  // UI state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const googleBtnRef = useRef(null);

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('studymind_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => setOtpCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Initialize official Google Identity Services
  useEffect(() => {
    if (!isOpen || step === 'otp') return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 380,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
        }
      } catch (err) {
        console.warn('Google Identity Services init notice:', err);
      }
    }
  }, [isOpen, step, mode]);

  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.googleAuth({ credential: response.credential });
      if (rememberMe && res.user?.email) {
        localStorage.setItem('studymind_remembered_email', res.user.email);
      }
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Handle Form Submit (Sign In OR Send Registration OTP)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        if (rememberMe) {
          localStorage.setItem('studymind_remembered_email', email);
        } else {
          localStorage.removeItem('studymind_remembered_email');
        }
        onAuthSuccess(res.user);
        onClose();
      } else {
        // Mode: Register -> Send OTP to Email
        if (!age || Number(age) < 10) {
          throw new Error('Please enter a valid age (10 or older).');
        }

        const otpRes = await api.sendRegistrationOtp(name, email, password, age);
        setStep('otp');
        setOtpCooldown(60);
        setOtp('');
        if (otpRes.fallbackOtp) {
          setOtpNotice(`Verification Code: ${otpRes.fallbackOtp}`);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification Submit
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.verifyRegistrationOtp(email, otp.trim());
      if (rememberMe) {
        localStorage.setItem('studymind_remembered_email', email);
      }
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    setError(null);
    setLoading(true);

    try {
      const res = await api.resendOtp(email);
      setOtpCooldown(60);
      if (res.fallbackOtp) {
        setOtpNotice(`New Verification Code: ${res.fallbackOtp}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Trigger
  const handleGoogleSignInClick = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (window.google?.accounts?.id && clientId) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          triggerGoogleManualPrompt();
        }
      });
    } else {
      triggerGoogleManualPrompt();
    }
  };

  const triggerGoogleManualPrompt = async () => {
    const googleEmail = prompt('Enter your Google / Gmail address:', email || '');
    if (!googleEmail || !googleEmail.includes('@')) return;

    const googleName = prompt('Enter your display name:', name || googleEmail.split('@')[0]);

    setLoading(true);
    setError(null);
    try {
      const res = await api.googleAuth({
        email: googleEmail,
        name: googleName,
        age: age ? Number(age) : 20
      });
      if (rememberMe) {
        localStorage.setItem('studymind_remembered_email', googleEmail);
      }
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {step === 'otp' 
                ? 'Verify Your Email' 
                : mode === 'login' 
                  ? 'Sign In to StudyMind' 
                  : 'Create an Account'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {step === 'otp'
                ? `Enter the 6-digit code sent to ${email}`
                : mode === 'login' 
                  ? 'Access your private study schedule' 
                  : 'Get started with verified email authentication'}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tab Switcher (Visible only on form step) */}
        {step === 'form' && (
          <div style={{ padding: '16px 20px 0' }}>
            <div className="timer-presets" style={{ width: '100%', margin: 0 }}>
              <button
                id="tab-auth-login"
                className={`preset-btn ${mode === 'login' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => { setMode('login'); setError(null); }}
              >
                Sign In
              </button>
              <button
                id="tab-auth-register"
                className={`preset-btn ${mode === 'register' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => { setMode('register'); setError(null); }}
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        <div className="modal-body" style={{ paddingTop: '16px' }}>
          {error && (
            <div style={{
              background: 'var(--color-danger-subtle)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--color-danger)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.82rem',
              marginBottom: '14px'
            }}>
              {error}
            </div>
          )}

          {otpNotice && (
            <div style={{
              background: 'var(--accent-primary-subtle)',
              border: '1px solid rgba(79, 70, 229, 0.3)',
              color: 'var(--text-primary)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.84rem',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <span>{otpNotice}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                onClick={() => {
                  const match = otpNotice.match(/\d{6}/);
                  if (match) setOtp(match[0]);
                }}
              >
                Auto-Fill
              </button>
            </div>
          )}

          {/* STEP 1: Main Login / Register Form */}
          {step === 'form' && (
            <>
              {/* Official Google Identity Button Mount Target */}
              <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}></div>

              {/* Google Sign In Button */}
              <button
                type="button"
                className="btn btn-secondary"
                style={{ 
                  width: '100%', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  padding: '10px 14px'
                }}
                onClick={handleGoogleSignInClick}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                margin: '12px 0 16px',
                color: 'var(--text-tertiary)',
                fontSize: '0.78rem'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                <span>or continue with email</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              </div>

              <form onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          id="input-auth-name"
                          type="text"
                          className="form-input"
                          placeholder="Enter your full name"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Age *</label>
                        <input
                          id="input-auth-age"
                          type="number"
                          min="10"
                          max="100"
                          className="form-input"
                          placeholder="Enter your age"
                          required
                          value={age}
                          onChange={e => setAge(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    id="input-auth-email"
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    id="input-auth-password"
                    type="password"
                    className="form-input"
                    placeholder="Enter password (min. 6 characters)"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>

                {/* Remember Me Checkbox */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  margin: '10px 0 16px',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      id="checkbox-remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                    <span>Remember my login</span>
                  </label>
                </div>

                <button
                  id="btn-auth-submit"
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px' }}
                  disabled={loading}
                >
                  <span>
                    {loading 
                      ? 'Please wait...' 
                      : mode === 'login' 
                        ? 'Sign In' 
                        : 'Verify Email & Send OTP'}
                  </span>
                  <ArrowRight size={15} />
                </button>
              </form>
            </>
          )}

          {/* STEP 2: Email OTP Verification Screen */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'var(--accent-primary-subtle)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <KeyRound size={24} />
                </div>
                
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  We sent a 6-digit verification code to: <br />
                  <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                </div>

                <div className="form-group" style={{ maxWidth: '280px', margin: '0 auto 16px' }}>
                  <label className="form-label" style={{ textAlign: 'center' }}>Enter 6-Digit OTP</label>
                  <input
                    id="input-otp-code"
                    type="text"
                    maxLength="6"
                    autoFocus
                    className="form-input"
                    style={{
                      textAlign: 'center',
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      letterSpacing: '8px',
                      padding: '10px'
                    }}
                    placeholder="••••••"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.82rem', marginBottom: '20px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Didn't receive code?</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 8px', fontSize: '0.78rem' }}
                    onClick={handleResendOtp}
                    disabled={otpCooldown > 0 || loading}
                  >
                    <RefreshCw size={12} className={loading ? 'spinning' : ''} />
                    <span>{otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => { setStep('form'); setError(null); setOtpNotice(null); }}
                  >
                    <ArrowLeft size={15} />
                    <span>Edit Details</span>
                  </button>

                  <button
                    id="btn-submit-otp"
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1.4 }}
                    disabled={loading || otp.length < 6}
                  >
                    <CheckCircle2 size={15} />
                    <span>{loading ? 'Verifying...' : 'Verify & Sign Up'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
