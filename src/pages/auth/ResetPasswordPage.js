import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

export default function ResetPasswordPage() {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

  // Validate token exists in URL
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-container single">
          <div className="auth-card">
            <div className="auth-success">
              <h2 style={{ color: 'var(--red)' }}>Invalid Link</h2>
              <p>This reset link is invalid or has already been used.</p>
              <Link to="/forgot-password" className="btn btn-primary btn-full">
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/auth/resetpassword/${token}`, { password });
      setSuccess(true);
      toast.success('Password reset successfully!');
      // Auto-redirect after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setError('This reset link has expired or is invalid. Please request a new one.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? null
    : password.length < 6  ? 'weak'
    : password.length < 10 ? 'medium'
    : 'strong';

  return (
    <div className="auth-page">
      <div className="auth-container single">
        <div className="auth-card">
          <Link to="/" className="auth-logo" style={{ marginBottom: 24 }}>
            <span className="logo-icon">S</span>
            <span>ShopEase</span>
          </Link>

          {success ? (
            <div className="auth-success">
              <FiCheckCircle size={52} color="var(--teal)" />
              <h2>Password Reset!</h2>
              <p>Your password has been changed successfully. Redirecting you to login...</p>
              <Link to="/login" className="btn btn-primary btn-full">Sign In Now</Link>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Reset password</h1>
              <p className="auth-subtitle">Choose a strong new password for your account.</p>

              {error && (
                <div className="alert alert-error">
                  {error}
                  {error.includes('expired') && (
                    <div style={{ marginTop: 8 }}>
                      <Link to="/forgot-password" style={{ color: 'var(--red)', fontWeight: 700 }}>
                        → Request a new reset link
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-icon-wrap">
                    <FiLock className="input-icon" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="form-input with-icon with-icon-right"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() => setShowPw(v => !v)}
                    >
                      {showPw ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {strength && (
                    <div className="pw-strength-wrap">
                      <div className={`pw-strength-bar ${strength}`} />
                      <span className={`pw-strength-label ${strength}`}>
                        {strength === 'weak'   && '⚠ Weak — too short'}
                        {strength === 'medium' && '◑ Medium — could be stronger'}
                        {strength === 'strong' && '✓ Strong password'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-icon-wrap">
                    <FiLock className="input-icon" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      className={`form-input with-icon ${confirm && confirm !== password ? 'error' : ''}`}
                      placeholder="Repeat your new password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                  {confirm && confirm !== password && (
                    <div className="form-error">Passwords do not match</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading || password !== confirm || password.length < 6}
                >
                  {loading ? (
                    <><span className="btn-spinner" /> Resetting...</>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              <p className="auth-switch">
                Remember it? <Link to="/login">Sign in instead</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
