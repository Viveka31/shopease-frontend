import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave, FiStore } from 'react-icons/fi';
import './SellerPages.css';

export default function SellerStoreProfile() {
  const { user, updateUser } = useAuth();
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({
    name:      '',
    phone:     '',
    storeName:  '',
    storeDesc:  '',
    storePhone: '',
    storeEmail: '',
    storeCity:  '',
  });

  useEffect(() => {
    api.get('/seller/store-profile')
      .then(r => {
        const s = r.data.seller;
        setForm({
          name:       s.name        || '',
          phone:      s.phone       || '',
          storeName:  s.storeInfo?.storeName  || '',
          storeDesc:  s.storeInfo?.storeDesc  || '',
          storePhone: s.storeInfo?.storePhone || '',
          storeEmail: s.storeInfo?.storeEmail || '',
          storeCity:  s.storeInfo?.storeCity  || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/seller/store-profile', {
        name:      form.name,
        phone:     form.phone,
        storeInfo: {
          storeName:  form.storeName,
          storeDesc:  form.storeDesc,
          storePhone: form.storePhone,
          storeEmail: form.storeEmail,
          storeCity:  form.storeCity,
        },
      });
      updateUser({ ...user, name: data.seller.name, storeInfo: data.seller.storeInfo });
      toast.success('Store profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const upd = (key, val) => setForm(f => ({ ...f, [key]: val }));

  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <Link to="/seller/dashboard" className="back-link"><FiArrowLeft /> Back to Dashboard</Link>
        <h1 className="page-heading"><FiStore /> Store Profile</h1>

        <form onSubmit={handleSave}>
          {/* Personal info */}
          <div className="card seller-form-card" style={{ marginBottom: 20 }}>
            <h2 className="seller-form-section">Personal Information</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" value={form.name} onChange={e => upd('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phone} onChange={e => upd('phone', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Store info */}
          <div className="card seller-form-card" style={{ marginBottom: 20 }}>
            <h2 className="seller-form-section">Store Information</h2>
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input className="form-input" placeholder="e.g. Fashion Hub by Arjun" value={form.storeName} onChange={e => upd('storeName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Store Description</label>
              <textarea className="form-input" rows={3} placeholder="Tell buyers about your store..." value={form.storeDesc} onChange={e => upd('storeDesc', e.target.value)} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Store Contact Phone</label>
                <input className="form-input" placeholder="+91 98765 43210" value={form.storePhone} onChange={e => upd('storePhone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Store Contact Email</label>
                <input className="form-input" type="email" placeholder="store@example.com" value={form.storeEmail} onChange={e => upd('storeEmail', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Store City / Location</label>
              <input className="form-input" placeholder="e.g. Chennai, Tamil Nadu" value={form.storeCity} onChange={e => upd('storeCity', e.target.value)} />
            </div>
          </div>

          {/* Store card preview */}
          {(form.storeName || form.storeDesc) && (
            <div className="card seller-form-card store-preview" style={{ marginBottom: 20 }}>
              <h2 className="seller-form-section">Preview</h2>
              <div className="store-preview-card">
                <div className="store-preview-avatar">{(form.storeName || form.name)?.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="store-preview-name">{form.storeName || form.name}</div>
                  {form.storeCity && <div className="store-preview-city">📍 {form.storeCity}</div>}
                  {form.storeDesc && <div className="store-preview-desc">{form.storeDesc}</div>}
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                    {form.storePhone && <span className="store-preview-contact">📞 {form.storePhone}</span>}
                    {form.storeEmail && <span className="store-preview-contact">✉️ {form.storeEmail}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              <FiSave /> {saving ? 'Saving...' : 'Save Store Profile'}
            </button>
            <Link to="/seller/dashboard" className="btn btn-outline btn-lg">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
