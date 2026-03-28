import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import {
  FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp,
  FiPlus, FiArrowRight, FiBarChart2, FiStar
} from 'react-icons/fi';
import './SellerPages.css';

const STATUS_COLORS = {
  pending: 'badge-orange', confirmed: 'badge-teal', processing: 'badge-navy',
  shipped: 'badge-navy', delivered: 'badge-green', cancelled: 'badge-red',
};

export default function SellerDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('overview'); // 'overview' | 'sales'

  useEffect(() => {
    api.get('/seller/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;

  const { stats, monthlySales = [], topProducts = [], recentOrders = [] } = data || {};

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts,  icon: <FiPackage />,    color: 'teal',   link: '/seller/products' },
    { label: 'Total Orders',   value: stats?.totalOrders,    icon: <FiShoppingBag />, color: 'navy',   link: '/seller/orders'   },
    { label: 'Total Revenue',  value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <FiDollarSign />, color: 'green', link: '/seller/orders' },
    { label: 'Pending Orders', value: stats?.pendingOrders,  icon: <FiTrendingUp />, color: 'orange', link: '/seller/orders?status=pending' },
  ];

  // Chart max for scaling bars
  const maxRevenue = Math.max(...monthlySales.map(m => m.revenue), 1);

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="seller-page-header">
          <div>
            <h1 className="page-heading" style={{ marginBottom: 4 }}>Seller Dashboard</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
              Welcome back! Here's what's happening with your store.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/seller/store-profile" className="btn btn-outline">
              <FiBarChart2 /> Store Profile
            </Link>
            <Link to="/seller/products/add" className="btn btn-primary">
              <FiPlus /> Add Product
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
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

        {/* Tab switcher */}
        <div className="dash-tabs">
          <button className={`dash-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
            Overview
          </button>
          <button className={`dash-tab ${tab === 'sales' ? 'active' : ''}`} onClick={() => setTab('sales')}>
            Sales Report
          </button>
        </div>

        {tab === 'overview' && (
          <div className="dash-grid">
            {/* Recent Orders */}
            <div className="card seller-section">
              <div className="seller-section-header">
                <h2 className="seller-section-title">Recent Orders</h2>
                <Link to="/seller/orders" className="btn btn-ghost btn-sm">View All <FiArrowRight /></Link>
              </div>
              {recentOrders.length === 0 ? (
                <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--gray-400)' }}>
                  No orders yet
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
                      {recentOrders.map(order => (
                        <tr key={order._id}>
                          <td className="order-id-cell">#{order._id?.slice(-8).toUpperCase()}</td>
                          <td>{order.buyer?.name}</td>
                          <td className="font-bold">₹{order.totalPrice?.toLocaleString()}</td>
                          <td>
                            <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-gray'}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="card seller-section">
              <div className="seller-section-header">
                <h2 className="seller-section-title">Top Selling Products</h2>
                <Link to="/seller/products" className="btn btn-ghost btn-sm">View All <FiArrowRight /></Link>
              </div>
              {topProducts.length === 0 ? (
                <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--gray-400)' }}>
                  No products yet.{' '}
                  <Link to="/seller/products/add" style={{ color: 'var(--teal)' }}>Add your first →</Link>
                </div>
              ) : (
                <div className="top-products-list">
                  {topProducts.map((p, i) => (
                    <div key={p._id} className="top-product-row">
                      <span className="top-rank">#{i + 1}</span>
                      <img
                        src={p.images?.[0] || `https://picsum.photos/seed/${p._id}/48/48`}
                        alt={p.name}
                        className="top-product-img"
                      />
                      <div className="top-product-info">
                        <div className="top-product-name">{p.name}</div>
                        <div className="top-product-price">₹{p.price?.toLocaleString()}</div>
                      </div>
                      <div className="top-product-sold">
                        <FiShoppingBag size={12} />
                        {p.sold || 0} sold
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'sales' && (
          <div className="sales-report-wrap">
            {/* Bar chart — pure CSS, no library needed */}
            <div className="card seller-section" style={{ marginBottom: 24 }}>
              <div className="seller-section-header">
                <h2 className="seller-section-title">Monthly Revenue (Last 6 Months)</h2>
              </div>
              <div className="sales-chart">
                {monthlySales.map(m => (
                  <div key={m.month} className="chart-col">
                    <div className="chart-bar-wrap">
                      <div
                        className="chart-bar"
                        style={{ height: `${Math.round((m.revenue / maxRevenue) * 180)}px` }}
                        title={`₹${m.revenue.toLocaleString()}`}
                      >
                        <span className="chart-bar-val">
                          {m.revenue > 0 ? `₹${(m.revenue / 1000).toFixed(1)}k` : '—'}
                        </span>
                      </div>
                    </div>
                    <div className="chart-label">{m.month}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary table */}
            <div className="card seller-section">
              <div className="seller-section-header">
                <h2 className="seller-section-title">Sales Summary</h2>
              </div>
              <div className="sales-summary-grid">
                <div className="sales-summary-card">
                  <div className="ss-label">Total Revenue</div>
                  <div className="ss-value teal">₹{(stats?.totalRevenue || 0).toLocaleString()}</div>
                </div>
                <div className="sales-summary-card">
                  <div className="ss-label">Orders Delivered</div>
                  <div className="ss-value green">{stats?.completedOrders || 0}</div>
                </div>
                <div className="sales-summary-card">
                  <div className="ss-label">Pending Orders</div>
                  <div className="ss-value orange">{stats?.pendingOrders || 0}</div>
                </div>
                <div className="sales-summary-card">
                  <div className="ss-label">Active Products</div>
                  <div className="ss-value navy">{stats?.activeProducts || 0}</div>
                </div>
              </div>

              <div className="seller-orders-table" style={{ marginTop: 20 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Revenue</th>
                      <th>Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySales.map(m => (
                      <tr key={m.month}>
                        <td style={{ fontWeight: 600 }}>{m.month}</td>
                        <td className="font-bold">₹{m.revenue.toLocaleString()}</td>
                        <td style={{ width: '50%' }}>
                          <div className="inline-bar-wrap">
                            <div
                              className="inline-bar"
                              style={{ width: `${Math.round((m.revenue / maxRevenue) * 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
