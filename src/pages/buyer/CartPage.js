import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './CartPage.css';

export default function CartPage() {
  const { cart, totalPrice, totalItems, updateQuantity, removeItem, loading } = useCart();
  const navigate = useNavigate();

  const handleRemove = async (itemId) => {
    try { await removeItem(itemId); toast.success('Item removed'); }
    catch { toast.error('Failed to remove'); }
  };

  const handleUpdateQty = async (itemId, qty) => {
    try { await updateQuantity(itemId, qty); }
    catch { toast.error('Failed to update'); }
  };

  const shippingPrice = totalPrice > 999 ? 0 : 99;
  const taxPrice = Math.round(totalPrice * 0.18 * 100) / 100;
  const grandTotal = totalPrice + shippingPrice + taxPrice;

  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;

  if (!cart?.items?.length) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon"><FiShoppingBag size={64} /></div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet</p>
            <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading">Shopping Cart <span className="heading-count">{totalItems} items</span></h1>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item._id} className="cart-item">
                <Link to={`/products/${item.product?._id}`} className="cart-item-img">
                  <img
                    src={item.product?.images?.[0] || `https://picsum.photos/seed/${item.product?._id}/200/200`}
                    alt={item.name}
                  />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/products/${item.product?._id}`} className="cart-item-name">{item.name}</Link>
                  <div className="cart-item-meta">
                    {item.size && <span className="cart-item-variant">Size: {item.size}</span>}
                    {item.color && <span className="cart-item-variant">Color: {item.color}</span>}
                  </div>
                  <div className="cart-item-price">₹{item.price.toLocaleString()}</div>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-selector">
                    <button className="qty-btn" onClick={() => handleUpdateQty(item._id, item.quantity - 1)}><FiMinus size={12} /></button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => handleUpdateQty(item._id, item.quantity + 1)}><FiPlus size={12} /></button>
                  </div>
                  <div className="cart-item-subtotal">₹{(item.price * item.quantity).toLocaleString()}</div>
                  <button className="cart-remove-btn" onClick={() => handleRemove(item._id)}><FiTrash2 /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="card summary-card">
              <h2 className="summary-title">Order Summary</h2>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className={shippingPrice === 0 ? 'text-green' : ''}>
                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                  </span>
                </div>
                <div className="summary-row">
                  <span>GST (18%)</span>
                  <span>₹{taxPrice.toLocaleString()}</span>
                </div>
                {shippingPrice > 0 && (
                  <div className="shipping-tip">
                    Add ₹{(999 - totalPrice).toFixed(0)} more for free shipping!
                  </div>
                )}
                <div className="summary-total">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <FiArrowRight />
              </button>
              <Link to="/products" className="btn btn-outline btn-full" style={{ marginTop: 10 }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
