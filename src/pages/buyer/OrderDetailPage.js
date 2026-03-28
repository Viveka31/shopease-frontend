import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiArrowLeft } from 'react-icons/fi';
import './OrderPages.css';

const STATUS_COLORS = {
  pending: 'badge-orange', confirmed: 'badge-teal', processing: 'badge-navy',
  shipped: 'badge-navy', delivered: 'badge-green', cancelled: 'badge-red',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;
  if (!order) return null;

  const addr = order.shippingAddress;

  return (
    <div className="page">
      <div className="container">
        <Link to="/orders" className="back-link"><FiArrowLeft /> Back to Orders</Link>

        <div className="order-detail-header">
          <div>
            <h1 className="page-heading" style={{ marginBottom: 4 }}>Order #{order._id?.slice(-8).toUpperCase()}</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-gray'}`} style={{ fontSize: 14, padding: '8px 16px' }}>{order.orderStatus}</span>
        </div>

        <div className="order-detail-grid">
          <div>
            <div className="card order-detail-card">
              <h3 className="order-detail-section-title">Order Items</h3>
              {order.items?.map(item => (
                <div key={item._id} className="order-detail-item">
                  <img src={item.image || `https://picsum.photos/seed/${item.product}/80/80`} alt={item.name} />
                  <div className="order-detail-item-info">
                    <div className="order-detail-item-name">{item.name}</div>
                    {item.size && <div className="order-detail-item-meta">Size: {item.size}</div>}
                    <div className="order-detail-item-meta">Qty: {item.quantity}</div>
                  </div>
                  <div className="order-detail-item-price">₹{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
              <div className="order-price-breakdown">
                <div className="breakdown-row"><span>Subtotal</span><span>₹{order.itemsPrice?.toLocaleString()}</span></div>
                <div className="breakdown-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
                <div className="breakdown-row"><span>GST</span><span>₹{order.taxPrice?.toLocaleString()}</span></div>
                <div className="breakdown-total"><span>Total</span><span>₹{order.totalPrice?.toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card order-detail-card">
              <h3 className="order-detail-section-title">Shipping Address</h3>
              <div className="address-display">
                <strong>{addr?.fullName}</strong>
                <p>{addr?.street}</p>
                <p>{addr?.city}, {addr?.state} - {addr?.zipCode}</p>
                <p>{addr?.country}</p>
                <p>📞 {addr?.phone}</p>
              </div>
            </div>
            <div className="card order-detail-card">
              <h3 className="order-detail-section-title">Payment Info</h3>
              <div className="payment-info">
                <div className="pi-row"><span>Method</span><span style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</span></div>
                <div className="pi-row"><span>Status</span><span className={order.isPaid ? 'text-green' : 'text-orange'}>{order.isPaid ? '✓ Paid' : 'Pending'}</span></div>
                {order.isPaid && <div className="pi-row"><span>Paid on</span><span>{new Date(order.paidAt).toLocaleDateString()}</span></div>}
                {order.trackingNumber && <div className="pi-row"><span>Tracking</span><span>{order.trackingNumber}</span></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
