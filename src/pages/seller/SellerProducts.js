import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import './SellerPages.css';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const { data } = await api.get(`/seller/products?search=${search}`);
      setProducts(data.products);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="seller-page-header">
          <h1 className="page-heading">My Products</h1>
          <Link to="/seller/products/add" className="btn btn-primary"><FiPlus /> Add Product</Link>
        </div>

        <div className="seller-search-bar">
          <FiSearch className="search-icon-abs" />
          <input className="form-input" style={{ paddingLeft: 40 }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="loader-wrap"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products yet</h3>
            <p>Start by adding your first product</p>
            <Link to="/seller/products/add" className="btn btn-primary"><FiPlus /> Add First Product</Link>
          </div>
        ) : (
          <div className="seller-products-grid">
            {products.map(p => (
              <div key={p._id} className="seller-product-card card">
                <img src={p.images?.[0] || `https://picsum.photos/seed/${p._id}/200/200`} alt={p.name} className="seller-product-img" />
                <div className="seller-product-info">
                  <div className="seller-product-category">{p.category}</div>
                  <div className="seller-product-name">{p.name}</div>
                  <div className="seller-product-price">₹{p.price.toLocaleString()}</div>
                  <div className="seller-product-meta">
                    <span className={`badge ${p.stock > 0 ? 'badge-green' : 'badge-red'}`}>{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>
                    <span className="badge badge-gray">{p.sold || 0} sold</span>
                  </div>
                </div>
                <div className="seller-product-actions">
                  <Link to={`/seller/products/edit/${p._id}`} className="btn btn-outline btn-sm"><FiEdit2 /> Edit</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
