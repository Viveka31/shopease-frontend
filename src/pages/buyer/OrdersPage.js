import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiPackage } from 'react-icons/fi';
import './OrderPages.css';

const STATUS_COLORS = {
  pending: 'badge-orange', confirmed: 'badge-teal', processing: 'badge-navy',
  shipped: 'badge-navy', delivered: 'badge-green', cancelled: 'badge-red',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/myorders')
      .then(r => setOrders(r.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading">My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiPackage size={64} /></div>
            <h2>No orders yet</h2>
            <p>Your orders will appear here once you make a purchase</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <Link key={order._id} to={`/orders/${order._id}`} className="order-row">
                <div className="order-row-id">
                  <FiPackage className="order-icon" />
                  <div>
                    <div className="order-id-label">Order #{order._id?.slice(-8).toUpperCase()}</div>
                    <div className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
                <div className="order-row-items">
                  {order.items?.slice(0, 3).map(item => (
                    <img key={item._id} src={item.image || `https://picsum.photos/seed/${item.product}/60/60`} alt={item.name} className="order-row-thumb" />
                  ))}
                  {order.items?.length > 3 && <span className="order-row-more">+{order.items.length - 3}</span>}
                </div>
                <div className="order-row-total">₹{order.totalPrice?.toLocaleString()}</div>
                <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-gray'}`}>{order.orderStatus}</span>
                <span className="order-row-arrow">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
