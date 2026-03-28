import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import './Auth.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/forgotpassword', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container single">
        <div className="auth-card">
          <Link to="/" className="auth-logo" style={{ marginBottom: 24 }}>
            <span className="logo-icon">S</span><span>ShopEase</span>
          </Link>

          {sent ? (
            <div className="auth-success">
              <FiCheckCircle size={48} color="var(--teal)" />
              <h2>Email sent!</h2>
              <p>Check your inbox for a password reset link. It expires in 10 minutes.</p>
              <Link to="/login" className="btn btn-primary btn-full">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Forgot password?</h1>
              <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrap">
                    <FiMail className="input-icon" />
                    <input type="email" className="form-input with-icon" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p className="auth-switch"><Link to="/login">← Back to Sign In</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
