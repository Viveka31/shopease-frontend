import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import './Auth.css';

// ✅ Default export (was incorrectly named export before — that caused the page to be blank)
export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgotpassword', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container single">
        <div className="auth-card">
          <Link to="/" className="auth-logo" style={{ marginBottom: 24 }}>
            <span className="logo-icon">S</span>
            <span>ShopEase</span>
          </Link>

          {sent ? (
            <div className="auth-success">
              <FiCheckCircle size={52} color="var(--teal)" />
              <h2>Check your inbox!</h2>
              <p>
                We sent a password reset link to <strong>{email}</strong>.
                The link expires in <strong>30 minutes</strong>.
              </p>
              <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                Didn't get it? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                >
                  try again
                </button>.
              </p>
              <Link to="/login" className="btn btn-primary btn-full">← Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Forgot password?</h1>
              <p className="auth-subtitle">
                Enter your registered email and we'll send you a reset link.
              </p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrap">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      className="form-input with-icon"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="btn-spinner" /> Sending...</>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <p className="auth-switch">
                <Link to="/login">← Back to Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
