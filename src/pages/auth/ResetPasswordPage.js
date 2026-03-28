import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.put(`/auth/resetpassword/${token}`, { password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.');
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
          <h1 className="auth-title">Reset password</h1>
          <p className="auth-subtitle">Enter your new password below.</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input type="password" className="form-input with-icon" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input type="password" className="form-input with-icon" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
