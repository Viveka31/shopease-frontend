import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiSave } from 'react-icons/fi';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', {
        name: form.name,
        phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode },
      });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put('/auth/updatepassword', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally { setSaving(false); }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading">My Profile</h1>

        <div className="profile-layout">
          {/* Sidebar */}
          <div className="profile-sidebar card">
            <div className="profile-avatar-section">
              <div className="profile-big-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="profile-avatar-name">{user?.name}</div>
              <div className="profile-avatar-email">{user?.email}</div>
              <span className={`badge badge-${user?.role === 'seller' ? 'teal' : 'navy'}`}>{user?.role}</span>
            </div>
            <div className="profile-nav">
              <button className={`profile-nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><FiUser /> Personal Info</button>
              <button className={`profile-nav-item ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}><FiLock /> Change Password</button>
            </div>
          </div>

          {/* Content */}
          <div className="profile-content card">
            {tab === 'profile' && (
              <>
                <h2 className="profile-section-title">Personal Information</h2>
                <form onSubmit={handleProfileSave}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                  </div>
                  <h3 className="profile-subsection">Delivery Address</h3>
                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input className="form-input" value={form.street} onChange={e => setForm({...form, street: e.target.value})} />
                  </div>
                  <div className="grid-3">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input className="form-input" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PIN Code</label>
                      <input className="form-input" value={form.zipCode} onChange={e => setForm({...form, zipCode: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </>
            )}

            {tab === 'password' && (
              <>
                <h2 className="profile-section-title">Change Password</h2>
                <form onSubmit={handlePasswordSave} style={{ maxWidth: 400 }}>
                  {['currentPassword', 'newPassword', 'confirmPassword'].map(f => (
                    <div key={f} className="form-group">
                      <label className="form-label">{f === 'currentPassword' ? 'Current Password' : f === 'newPassword' ? 'New Password' : 'Confirm New Password'}</label>
                      <input type="password" className="form-input" value={pwForm[f]} onChange={e => setPwForm({...pwForm, [f]: e.target.value})} required />
                    </div>
                  ))}
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
