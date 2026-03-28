import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';
import './SellerPages.css';

const CATEGORIES = ["Men's Clothing", "Women's Clothing", "Kids' Clothing", 'Accessories', 'Footwear', 'Activewear'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const EMPTY = {
  name: '', description: '', price: '', discountPrice: '',
  category: "Men's Clothing", brand: '', stock: '',
  sizes: [], colors: [], images: [''], tags: '',
  isFeatured: false,
};

export default function SellerAddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const toggleSize = (s) => setForm(f => ({
    ...f,
    sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s],
  }));

  const updateImage = (i, val) => {
    const imgs = [...form.images];
    imgs[i] = val;
    setForm(f => ({ ...f, images: imgs }));
  };

  const addImageField = () => setForm(f => ({ ...f, images: [...f.images, ''] }));
  const removeImageField = (i) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) {
      toast.error('Please fill in all required fields'); return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        stock: Number(form.stock),
        images: form.images.filter(img => img.trim()),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        colors: form.colors,
      };
      await api.post('/products', payload);
      toast.success('Product added successfully!');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="container">
        <Link to="/seller/products" className="back-link"><FiArrowLeft /> Back to Products</Link>
        <h1 className="page-heading">Add New Product</h1>

        <form onSubmit={handleSubmit} className="seller-form">
          <div className="seller-form-grid">
            {/* Main Info */}
            <div className="card seller-form-card">
              <h2 className="seller-form-section">Basic Information</h2>

              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" placeholder="e.g. Slim Fit Cotton T-Shirt" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-input" rows={5} placeholder="Describe your product in detail..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
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
                  <input className="form-input" placeholder="e.g. Nike, Zara" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" min="0" placeholder="999" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price (₹)</label>
                  <input className="form-input" type="number" min="0" placeholder="799" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input className="form-input" type="number" min="0" placeholder="50" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-input" placeholder="summer, casual, cotton" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  Mark as Featured Product
                </label>
              </div>
            </div>

            {/* Variants & Images */}
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
                <ColorInput colors={form.colors} onChange={colors => setForm(f => ({ ...f, colors }))} />
              </div>

              <div className="card seller-form-card">
                <h2 className="seller-form-section">Product Images</h2>
                <p className="seller-form-hint">Enter image URLs. Use Unsplash, Cloudinary or any public URL.</p>
                {form.images.map((img, i) => (
                  <div key={i} className="image-url-row">
                    <input className="form-input" placeholder={`Image URL ${i + 1}`} value={img} onChange={e => updateImage(i, e.target.value)} />
                    {img && (
                      <img src={img} alt="preview" className="img-preview" onError={e => e.target.style.display = 'none'} />
                    )}
                    {i > 0 && (
                      <button type="button" className="img-remove-btn" onClick={() => removeImageField(i)}><FiX /></button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={addImageField} style={{ marginTop: 10 }}>
                  <FiPlus /> Add Image URL
                </button>
              </div>
            </div>
          </div>

          <div className="seller-form-actions">
            <Link to="/seller/products" className="btn btn-outline btn-lg">Cancel</Link>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ColorInput({ colors, onChange }) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !colors.includes(trimmed)) {
      onChange([...colors, trimmed]);
      setInput('');
    }
  };
  return (
    <div>
      <div className="color-tags">
        {colors.map(c => (
          <span key={c} className="color-tag">
            <span className="color-dot" style={{ background: c }} />
            {c}
            <button type="button" onClick={() => onChange(colors.filter(x => x !== c))}><FiX size={10} /></button>
          </span>
        ))}
      </div>
      <div className="color-add-row">
        <input className="form-input" placeholder="e.g. Red, #FF0000, Navy Blue" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} />
        <button type="button" className="btn btn-outline btn-sm" onClick={add}><FiPlus /> Add</button>
      </div>
    </div>
  );
}
