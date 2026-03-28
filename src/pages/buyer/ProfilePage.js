import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiSave, FiPackage, FiHeart } from 'react-icons/fi';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    street:  user?.address?.street  || '',
    city:    user?.address?.city    || '',
    state:   user?.address?.state   || '',
    zipCode: user?.address?.zipCode || '',
  });

  const [pwForm, setPwForm] = useState({
    currentPassword:  '',
    newPassword:      '',
    confirmPassword:  '',
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', {
        name:    form.name,
        phone:   form.phone,
        address: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode },
      });
      updateUser(data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match'); return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setSaving(true);
    try {
      await api.put('/auth/updatepassword', {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect current password');
    } finally {
      setSaving(false);
    }
  };

  const upd = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading">My Account</h1>

        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar card">
            <div className="profile-avatar-section">
              <div className="profile-big-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-avatar-name">{user?.name}</div>
              <div className="profile-avatar-email">{user?.email}</div>
              <span className={`badge badge-${user?.role === 'seller' ? 'teal' : 'navy'}`}>
                {user?.role}
              </span>
            </div>

            <nav className="profile-nav">
              <button
                className={`profile-nav-item ${tab === 'profile' ? 'active' : ''}`}
                onClick={() => setTab('profile')}
              >
                <FiUser /> Personal Info
              </button>
              <button
                className={`profile-nav-item ${tab === 'password' ? 'active' : ''}`}
                onClick={() => setTab('password')}
              >
                <FiLock /> Change Password
              </button>
              <div className="profile-nav-divider" />
              <Link to="/orders" className="profile-nav-item">
                <FiPackage /> My Orders
              </Link>
              <Link to="/wishlist" className="profile-nav-item">
                <FiHeart /> My Wishlist
              </Link>
            </nav>
          </aside>

          {/* Content */}
          <div className="profile-content card">
            {/* ── Personal Info Tab ─────────────────────────────────────── */}
            {tab === 'profile' && (
              <>
                <h2 className="profile-section-title">Personal Information</h2>
                <form onSubmit={handleProfileSave}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        className="form-input"
                        value={form.name}
                        onChange={e => upd('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        className="form-input"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={e => upd('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <h3 className="profile-subsection">📦 Default Delivery Address</h3>
                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 42, MG Road"
                      value={form.street}
                      onChange={e => upd('street', e.target.value)}
                    />
                  </div>
                  <div className="grid-3">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" placeholder="Chennai" value={form.city} onChange={e => upd('city', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input className="form-input" placeholder="Tamil Nadu" value={form.state} onChange={e => upd('state', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PIN Code</label>
                      <input className="form-input" placeholder="600001" value={form.zipCode} onChange={e => upd('zipCode', e.target.value)} />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </>
            )}

            {/* ── Change Password Tab ───────────────────────────────────── */}
            {tab === 'password' && (
              <>
                <h2 className="profile-section-title">Change Password</h2>
                <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>
                  Choose a strong password with at least 6 characters.
                </p>
                <form onSubmit={handlePasswordSave} style={{ maxWidth: 420 }}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter your current password"
                      value={pwForm.currentPassword}
                      onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="At least 6 characters"
                      value={pwForm.newPassword}
                      onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Repeat your new password"
                      value={pwForm.confirmPassword}
                      onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Password strength hint */}
                  {pwForm.newPassword.length > 0 && (
                    <div className={`pwd-strength ${pwForm.newPassword.length >= 8 ? 'strong' : pwForm.newPassword.length >= 6 ? 'medium' : 'weak'}`}>
                      {pwForm.newPassword.length >= 8 ? '✓ Strong password' : pwForm.newPassword.length >= 6 ? '⚠ Medium — add more characters' : '✗ Too short'}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <FiLock /> {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
