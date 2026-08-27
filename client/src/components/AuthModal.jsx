import React, { useState } from 'react';
import { Sparkles, Lock, Mail, User, Shield, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import * as api from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await api.login(email, password);
      } else {
        res = await api.register(name, email, password);
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }

      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setEmail('admin@studymind.ai');
    setPassword('admin123');
    setError(null);
    setLoading(true);
    try {
      const res = await api.login('admin@studymind.ai', 'admin123');
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudent = async () => {
    setEmail('alex@student.com');
    setPassword('student123');
    setError(null);
    setLoading(true);
    try {
      const res = await api.login('alex@student.com', 'student123');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-icon" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
              <Sparkles size={16} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              {mode === 'login' ? 'Sign In to StudyMind' : 'Create Student Account'}
            </h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Tab switch */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: '8px' }}>
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ paddingTop: '16px' }}>
            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="input-auth-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ayush Sharma"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="input-auth-email"
                type="email"
                className="form-input"
                placeholder="name@university.edu"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="input-auth-password"
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              id="btn-auth-submit"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Quick Demo Logins */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Instant Preview Options:
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  id="btn-demo-admin"
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleDemoAdmin}
                  title="Sign in as Administrator with full site settings & user management access"
                >
                  <Shield size={14} style={{ color: '#8b5cf6' }} />
                  <span>Admin Login</span>
                </button>
                <button
                  id="btn-demo-student"
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleDemoStudent}
                  title="Sign in as regular Student"
                >
                  <User size={14} style={{ color: '#06b6d4' }} />
                  <span>Student Login</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
