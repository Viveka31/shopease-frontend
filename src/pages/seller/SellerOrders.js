import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './SellerPages.css';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: 'badge-orange', confirmed: 'badge-teal', processing: 'badge-navy',
  shipped: 'badge-navy', delivered: 'badge-green', cancelled: 'badge-red',
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterStatus ? `/seller/orders?status=${filterStatus}` : '/seller/orders';
      const { data } = await api.get(url);
      setOrders(data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    let trackingNumber = '';
    if (newStatus === 'shipped') {
      trackingNumber = window.prompt('Enter tracking number (optional):') || '';
    }
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus, trackingNumber });
      toast.success('Order status updated!');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="seller-page-header">
          <h1 className="page-heading">Manage Orders</h1>
        </div>

        <div className="status-tabs">
          <button className={`status-tab ${filterStatus === '' ? 'active' : ''}`} onClick={() => setFilterStatus('')}>All</button>
          {STATUSES.map(s => (
            <button key={s} className={`status-tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loader-wrap"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><h3>No orders found</h3></div>
        ) : (
          <div className="seller-orders-list">
            {orders.map(order => (
              <div key={order._id} className="seller-order-card card">
                <div className="seller-order-header" onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}>
                  <div className="seller-order-meta">
                    <span className="seller-order-id">#{order._id?.slice(-8).toUpperCase()}</span>
                    <span className="seller-order-buyer">{order.buyer?.name} &middot; {order.buyer?.email}</span>
                    <span className="seller-order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="seller-order-total">&#8377;{order.totalPrice?.toLocaleString()}</span>
                    <span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
                    <span className="expand-arrow">{expandedId === order._id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expandedId === order._id && (
                  <div className="seller-order-detail">
                    <div className="seller-order-items">
                      {order.items?.map(item => (
                        <div key={item._id} className="seller-order-item">
                          <img src={item.image || `https://picsum.photos/seed/${item.product}/60/60`} alt={item.name} />
                          <div>
                            <div className="font-semibold">{item.name}</div>
                            {item.size && <div className="text-sm text-gray">Size: {item.size}</div>}
                            <div className="text-sm text-gray">Qty: {item.quantity} &times; &#8377;{item.price}</div>
                          </div>
                          <div className="seller-item-subtotal">&#8377;{(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>

                    <div className="seller-order-shipping">
                      <strong>Ship to:</strong> {order.shippingAddress?.fullName}, {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode} &nbsp; &#128222; {order.shippingAddress?.phone}
                    </div>

                    <div className="seller-status-update">
                      <label className="form-label">Update Status:</label>
                      <div className="status-update-row">
                        <select
                          className="form-select"
                          value={order.orderStatus}
                          onChange={e => handleStatusUpdate(order._id, e.target.value)}
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        {order.trackingNumber && (
                          <div className="tracking-info">&#128230; Tracking: <strong>{order.trackingNumber}</strong></div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
