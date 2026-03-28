import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiCheckCircle, FiPackage, FiTruck, FiHome } from 'react-icons/fi';
import './OrderPages.css';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order)).catch(console.error);
  }, [id]);

  if (!order) return <div className="loader-wrap"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="confirmation-wrap">
          <div className="confirmation-icon"><FiCheckCircle size={64} color="var(--teal)" /></div>
          <h1 className="confirmation-title">Order Placed Successfully!</h1>
          <p className="confirmation-sub">Order ID: <strong>#{order._id?.slice(-8).toUpperCase()}</strong></p>
          <p className="confirmation-msg">A confirmation email has been sent to your registered email address.</p>

          <div className="confirmation-card">
            <div className="conf-items">
              {order.items?.map(item => (
                <div key={item._id} className="conf-item">
                  <img src={item.image || `https://picsum.photos/seed/${item.product}/80/80`} alt={item.name} />
                  <div className="conf-item-info">
                    <div className="conf-item-name">{item.name}</div>
                    {item.size && <div className="conf-item-meta">Size: {item.size}</div>}
                    <div className="conf-item-meta">Qty: {item.quantity} × ₹{item.price}</div>
                  </div>
                  <div className="conf-item-total">₹{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="conf-total">
              <span>Total Paid</span>
              <span>₹{order.totalPrice?.toLocaleString()}</span>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link to="/orders" className="btn btn-primary"><FiPackage /> View My Orders</Link>
            <Link to="/" className="btn btn-outline"><FiHome /> Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
