import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPlus, FiArrowRight } from 'react-icons/fi';
import './SellerPages.css';

const STATUS_COLORS = {
  pending: 'badge-orange', confirmed: 'badge-teal', processing: 'badge-navy',
  shipped: 'badge-navy', delivered: 'badge-green', cancelled: 'badge-red',
};

export default function SellerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;

  const { stats, recentOrders } = data || {};

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts, icon: <FiPackage />, color: 'teal', link: '/seller/products' },
    { label: 'Total Orders', value: stats?.totalOrders, icon: <FiShoppingBag />, color: 'navy', link: '/seller/orders' },
    { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <FiDollarSign />, color: 'green', link: '/seller/orders' },
    { label: 'Pending Orders', value: stats?.pendingOrders, icon: <FiTrendingUp />, color: 'orange', link: '/seller/orders?status=pending' },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="seller-page-header">
          <div>
            <h1 className="page-heading" style={{ marginBottom: 4 }}>Seller Dashboard</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Welcome back! Here's what's happening.</p>
          </div>
          <Link to="/seller/products/add" className="btn btn-primary"><FiPlus /> Add Product</Link>
        </div>

        {/* Stats */}
        <div className="seller-stats-grid">
          {statCards.map(card => (
            <Link to={card.link} key={card.label} className={`stat-card stat-${card.color}`}>
              <div className="stat-card-icon">{card.icon}</div>
              <div className="stat-card-info">
                <div className="stat-card-value">{card.value ?? 0}</div>
                <div className="stat-card-label">{card.label}</div>
              </div>
              <FiArrowRight className="stat-card-arrow" />
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="seller-quick-grid">
          <Link to="/seller/products" className="seller-quick-card">
            <FiPackage size={32} />
            <div>
              <h3>Manage Products</h3>
              <p>Add, edit, or remove your listings</p>
            </div>
          </Link>
          <Link to="/seller/orders" className="seller-quick-card">
            <FiShoppingBag size={32} />
            <div>
              <h3>Manage Orders</h3>
              <p>Process and update order status</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="card seller-section">
          <div className="seller-section-header">
            <h2 className="seller-section-title">Recent Orders</h2>
            <Link to="/seller/orders" className="btn btn-ghost btn-sm">View All <FiArrowRight /></Link>
          </div>
          {recentOrders?.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <p style={{ color: 'var(--gray-500)' }}>No orders yet</p>
            </div>
          ) : (
            <div className="seller-orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Buyer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders?.map(order => (
                    <tr key={order._id}>
                      <td className="order-id-cell">#{order._id?.slice(-8).toUpperCase()}</td>
                      <td>{order.buyer?.name}</td>
                      <td className="font-bold">₹{order.totalPrice?.toLocaleString()}</td>
                      <td><span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span></td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
