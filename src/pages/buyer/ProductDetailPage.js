import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FiStar, FiHeart, FiShoppingCart, FiTruck, FiRefreshCw, FiShield, FiMinus, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [wished, setWished] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
        if (data.product.sizes?.length) setSelectedSize(data.product.sizes[0]);
        if (data.product.colors?.length) setSelectedColor(data.product.colors[0]);
      } catch { navigate('/products'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedSize && product.sizes?.length > 0) { toast.error('Please select a size'); return; }
    try {
      setAdding(true);
      await addToCart(product._id, qty, selectedSize, selectedColor);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally { setAdding(false); }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await api.post(`/wishlist/${product._id}`);
      setWished(data.added);
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      setSubmittingReview(true);
      await api.post(`/reviews/${id}`, review);
      toast.success('Review submitted!');
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;
  if (!product) return null;

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const images = product.images?.length > 0
    ? product.images
    : [`https://picsum.photos/seed/${product._id}/600/700`, `https://picsum.photos/seed/${product._id}a/600/700`];

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/products">Products</Link> / <Link to={`/products?category=${product.category}`}>{product.category}</Link> / <span>{product.name}</span>
        </div>

        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="product-main-img-wrap">
              <img src={images[selectedImg]} alt={product.name} className="product-main-img" />
              {discount > 0 && <span className="detail-discount-badge">{discount}% OFF</span>}
            </div>
            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map((img, i) => (
                  <button key={i} className={`thumbnail-btn ${selectedImg === i ? 'active' : ''}`} onClick={() => setSelectedImg(i)}>
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            <div className="product-info-category">{product.category}</div>
            <h1 className="product-info-name">{product.name}</h1>
            {product.brand && <div className="product-info-brand">by {product.brand}</div>}

            {product.numReviews > 0 && (
              <div className="product-rating">
                <div className="stars">
                  {[1,2,3,4,5].map(s => (
                    <FiStar key={s} className={s <= Math.round(product.rating) ? 'star-filled' : 'star-empty'} fill={s <= Math.round(product.rating) ? '#f59e0b' : 'none'} />
                  ))}
                </div>
                <span className="rating-val">{product.rating.toFixed(1)}</span>
                <span className="rating-count">({product.numReviews} reviews)</span>
              </div>
            )}

            <div className="product-price-section">
              <span className="product-price-current">₹{displayPrice.toLocaleString()}</span>
              {discount > 0 && (
                <>
                  <span className="product-price-original">₹{product.price.toLocaleString()}</span>
                  <span className="product-price-save">You save ₹{(product.price - displayPrice).toLocaleString()}</span>
                </>
              )}
            </div>

            <div className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} left)` : '✗ Out of Stock'}
            </div>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="variant-section">
                <div className="variant-label">Size: <strong>{selectedSize}</strong></div>
                <div className="size-options">
                  {product.sizes.map(s => (
                    <button key={s} className={`size-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="variant-section">
                <div className="variant-label">Color: <strong>{selectedColor}</strong></div>
                <div className="color-options">
                  {product.colors.map(c => (
                    <button key={c} className={`color-btn ${selectedColor === c ? 'active' : ''}`} onClick={() => setSelectedColor(c)} style={{ '--c': c }} title={c} />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="variant-section">
              <div className="variant-label">Quantity</div>
              <div className="qty-selector">
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}><FiMinus /></button>
                <span className="qty-val">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}><FiPlus /></button>
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleAddToCart} disabled={adding || product.stock === 0}>
                <FiShoppingCart /> {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button className="btn btn-navy btn-lg" style={{ flex: 1 }} onClick={handleBuyNow} disabled={product.stock === 0}>
                Buy Now
              </button>
              <button className={`wishlist-circle-btn ${wished ? 'active' : ''}`} onClick={handleWishlist}>
                <FiHeart />
              </button>
            </div>

            {/* Trust */}
            <div className="product-trust">
              <div className="trust-item"><FiTruck /><span>Free delivery on orders above ₹999</span></div>
              <div className="trust-item"><FiRefreshCw /><span>Easy 30-day returns</span></div>
              <div className="trust-item"><FiShield /><span>100% authentic products</span></div>
            </div>
          </div>
        </div>

        {/* Description & Reviews */}
        <div className="product-tabs">
          <div className="tab-section">
            <h2 className="tab-title">Product Description</h2>
            <p className="product-description">{product.description}</p>
            {product.tags?.length > 0 && (
              <div className="product-tags">
                {product.tags.map(t => <span key={t} className="product-tag">{t}</span>)}
              </div>
            )}
          </div>

          <div className="tab-section">
            <h2 className="tab-title">Customer Reviews ({product.numReviews})</h2>

            {product.reviews?.length > 0 && (
              <div className="reviews-list">
                {product.reviews.map(r => (
                  <div key={r._id} className="review-card">
                    <div className="review-header">
                      <div className="review-avatar">{r.name?.charAt(0)}</div>
                      <div>
                        <div className="review-name">{r.name}</div>
                        <div className="stars">
                          {[1,2,3,4,5].map(s => (
                            <FiStar key={s} size={12} className={s <= r.rating ? 'star-filled' : 'star-empty'} fill={s <= r.rating ? '#f59e0b' : 'none'} />
                          ))}
                        </div>
                      </div>
                      <div className="review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {user && user.role === 'buyer' && (
              <div className="review-form-wrap">
                <h3>Write a Review</h3>
                <form onSubmit={handleReview} className="review-form">
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <div className="star-select">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" className={`star-select-btn ${s <= review.rating ? 'active' : ''}`} onClick={() => setReview(r => ({ ...r, rating: s }))}>
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comment</label>
                    <textarea className="form-input" rows={4} placeholder="Share your experience..." value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
