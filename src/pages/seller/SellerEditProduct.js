import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';
import './SellerPages.css';

const CATEGORIES = ["Men's Clothing", "Women's Clothing", "Kids' Clothing", 'Accessories', 'Footwear', 'Activewear'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

export default function SellerEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [colorInput, setColorInput] = useState('');

  useEffect(() => {
    api.get(`/products/${id}`).then(r => {
      const p = r.data.product;
      setForm({
        name: p.name, description: p.description, price: p.price,
        discountPrice: p.discountPrice || '', category: p.category,
        brand: p.brand || '', stock: p.stock,
        sizes: p.sizes || [], colors: p.colors || [],
        images: p.images?.length ? p.images : [''],
        tags: p.tags?.join(', ') || '',
        isFeatured: p.isFeatured || false, isActive: p.isActive !== false,
      });
    }).catch(() => navigate('/seller/products'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const toggleSize = (s) => setForm(f => ({
    ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s],
  }));

  const updateImage = (i, val) => {
    const imgs = [...form.images]; imgs[i] = val;
    setForm(f => ({ ...f, images: imgs }));
  };

  const addColor = () => {
    const c = colorInput.trim();
    if (c && !form.colors.includes(c)) {
      setForm(f => ({ ...f, colors: [...f.colors, c] }));
      setColorInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/products/${id}`, {
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        stock: Number(form.stock),
        images: form.images.filter(img => img.trim()),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      toast.success('Product updated!');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;
  if (!form) return null;

  return (
    <div className="page">
      <div className="container">
        <Link to="/seller/products" className="back-link"><FiArrowLeft /> Back to Products</Link>
        <h1 className="page-heading">Edit Product</h1>

        <form onSubmit={handleSubmit} className="seller-form">
          <div className="seller-form-grid">
            <div className="card seller-form-card">
              <h2 className="seller-form-section">Basic Information</h2>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-input" rows={5} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input className="form-input" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
                </div>
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price (₹)</label>
                  <input className="form-input" type="number" min="0" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input className="form-input" type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                  Featured
                </label>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  Active (visible to buyers)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card seller-form-card">
                <h2 className="seller-form-section">Sizes</h2>
                <div className="size-options">
                  {SIZES.map(s => (
                    <button type="button" key={s} className={`size-btn ${form.sizes.includes(s) ? 'active' : ''}`} onClick={() => toggleSize(s)}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="card seller-form-card">
                <h2 className="seller-form-section">Colors</h2>
                <div className="color-tags">
                  {form.colors.map(c => (
                    <span key={c} className="color-tag">
                      <span className="color-dot" style={{ background: c }} />{c}
                      <button type="button" onClick={() => setForm(f => ({ ...f, colors: f.colors.filter(x => x !== c) }))}><FiX size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="color-add-row">
                  <input className="form-input" placeholder="e.g. Red, Navy Blue" value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())} />
                  <button type="button" className="btn btn-outline btn-sm" onClick={addColor}><FiPlus /></button>
                </div>
              </div>

              <div className="card seller-form-card">
                <h2 className="seller-form-section">Product Images</h2>
                {form.images.map((img, i) => (
                  <div key={i} className="image-url-row">
                    <input className="form-input" placeholder={`Image URL ${i + 1}`} value={img} onChange={e => updateImage(i, e.target.value)} />
                    {img && <img src={img} alt="preview" className="img-preview" onError={e => e.target.style.display = 'none'} />}
                    {i > 0 && <button type="button" className="img-remove-btn" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}><FiX /></button>}
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm(f => ({ ...f, images: [...f.images, ''] }))} style={{ marginTop: 10 }}>
                  <FiPlus /> Add Image URL
                </button>
              </div>
            </div>
          </div>

          <div className="seller-form-actions">
            <Link to="/seller/products" className="btn btn-outline btn-lg">Cancel</Link>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
