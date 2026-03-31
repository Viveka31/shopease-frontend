import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'buyer' });
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim())             e.name            = 'Full name is required';
    else if (form.name.trim().length < 2) e.name         = 'Name must be at least 2 characters';

    if (!form.email.trim())            e.email           = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email  = 'Enter a valid email address';

    if (!form.password)                e.password        = 'Password is required';
    else if (form.password.length < 6) e.password        = 'Password must be at least 6 characters';

    if (!form.confirmPassword)         e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const upd = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
    if (apiError)    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      toast.success(`Welcome to ShopEase, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'seller' ? '/seller/dashboard' : '/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            <span className="logo-icon">S</span>
            <span>ShopEase</span>
          </Link>
          <p className="auth-brand-tagline">Fashion. Delivered.</p>
          <div className="auth-brand-visual">
            <div className="brand-circle c1" />
            <div className="brand-circle c2" />
            <div className="brand-circle c3" />
          </div>
        </div>

        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join thousands of fashion lovers</p>

          {apiError && (
            <div className="alert alert-error"><FiAlertCircle /> {apiError}</div>
          )}

          {/* Role Selector */}
          <div className="role-selector">
            <button type="button" className={`role-btn ${form.role === 'buyer' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, role: 'buyer' }))}>
              🛍️ I'm a Buyer
            </button>
            <button type="button" className={`role-btn ${form.role === 'seller' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, role: 'seller' }))}>
              🏪 I'm a Seller
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-icon-wrap">
                <FiUser className="input-icon" />
                <input type="text" className={`form-input with-icon ${errors.name ? 'error' : ''}`} placeholder="Arjun Kumar" value={form.name} onChange={e => upd('name', e.target.value)} />
              </div>
              {errors.name && <div className="form-error"><FiAlertCircle size={12} /> {errors.name}</div>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" />
                <input type="email" className={`form-input with-icon ${errors.email ? 'error' : ''}`} placeholder="you@example.com" value={form.email} onChange={e => upd('email', e.target.value)} />
              </div>
              {errors.email && <div className="form-error"><FiAlertCircle size={12} /> {errors.email}</div>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input type={showPw ? 'text' : 'password'} className={`form-input with-icon with-icon-right ${errors.password ? 'error' : ''}`} placeholder="Min. 6 characters" value={form.password} onChange={e => upd('password', e.target.value)} />
                <button type="button" className="input-icon-right" onClick={() => setShowPw(v => !v)}>
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <div className="form-error"><FiAlertCircle size={12} /> {errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input type={showPw ? 'text' : 'password'} className={`form-input with-icon ${errors.confirmPassword ? 'error' : ''}`} placeholder="Repeat your password" value={form.confirmPassword} onChange={e => upd('confirmPassword', e.target.value)} />
              </div>
              {errors.confirmPassword && <div className="form-error"><FiAlertCircle size={12} /> {errors.confirmPassword}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Creating account...</> : `Create ${form.role === 'seller' ? 'Seller' : 'Buyer'} Account`}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
