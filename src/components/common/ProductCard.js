import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './ProductCard.css';

export default function ProductCard({ product, onWishlistToggle }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);

  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      setAdding(true);
      await addToCart(product._id);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await api.post(`/wishlist/${product._id}`);
      setWished(data.added);
      toast.success(data.message);
      if (onWishlistToggle) onWishlistToggle(product._id, data.added);
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card-img-wrap">
        <img
          src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/400/500`}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
        />
        {discount > 0 && <span className="product-discount-badge">{discount}% OFF</span>}
        {product.stock === 0 && <div className="product-out-of-stock">Out of Stock</div>}

        <div className="product-card-overlay">
          <button className={`wishlist-btn ${wished ? 'active' : ''}`} onClick={handleWishlist} title="Add to wishlist">
            <FiHeart />
          </button>
          {product.stock > 0 && (
            <button className="quick-add-btn" onClick={handleAddToCart} disabled={adding}>
              <FiShoppingCart />
              {adding ? 'Adding...' : 'Quick Add'}
            </button>
          )}
        </div>
      </div>

      <div className="product-card-info">
        <div className="product-card-category">{product.category}</div>
        <h3 className="product-card-name">{product.name}</h3>
        {product.brand && <div className="product-card-brand">{product.brand}</div>}

        <div className="product-card-bottom">
          <div className="product-card-price">
            <span className="price-current">₹{displayPrice.toLocaleString()}</span>
            {discount > 0 && <span className="price-original">₹{product.price.toLocaleString()}</span>}
          </div>

          {product.numReviews > 0 && (
            <div className="product-card-rating">
              <FiStar className="star-icon" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="review-count">({product.numReviews})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
