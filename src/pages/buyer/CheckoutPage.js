import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import './CheckoutPage.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const CARD_STYLE = {
  style: {
    base: { fontSize: '16px', color: '#2C3E50', fontFamily: 'DM Sans, sans-serif', '::placeholder': { color: '#adb5bd' } },
    invalid: { color: '#e74c3c' },
  },
};

function CheckoutForm({ order, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true); setError('');
    try {
      const { data } = await api.post('/payments/create-payment-intent', { orderId: order._id });
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        await api.put(`/payments/${order._id}/pay`, {
          paymentResult: {
            id: result.paymentIntent.id,
            status: result.paymentIntent.status,
            update_time: new Date().toISOString(),
          },
        });
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally { setProcessing(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-group">
        <label className="form-label">Card Details</label>
        <div className="card-element-wrap">
          <CardElement options={CARD_STYLE} />
        </div>
        <div className="card-hint">Use: 4242 4242 4242 4242 | Any future date | Any CVC</div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={processing || !stripe}>
        <FiLock /> {processing ? 'Processing...' : `Pay ₹${order.totalPrice?.toLocaleString()}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { cart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=address, 2=payment
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: 'India',
  });

  const shippingPrice = totalPrice > 999 ? 0 : 99;
  const taxPrice = Math.round(totalPrice * 0.18 * 100) / 100;
  const grandTotal = totalPrice + shippingPrice + taxPrice;

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const required = ['fullName', 'phone', 'street', 'city', 'state', 'zipCode'];
    for (const f of required) {
      if (!shipping[f]) { toast.error(`Please fill in ${f}`); return; }
    }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', { shippingAddress: shipping, paymentMethod: 'stripe' });
      setOrder(data.order);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally { setLoading(false); }
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment successful! 🎉');
    navigate(`/order-confirmation/${order._id}`);
  };

  if (!cart?.items?.length && !order) {
    navigate('/cart'); return null;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading">Checkout</h1>

        <div className="checkout-steps">
          {['Shipping Address', 'Payment'].map((s, i) => (
            <div key={s} className={`checkout-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
              <div className="step-num">{step > i + 1 ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {step === 1 && (
              <div className="card checkout-card">
                <h2 className="checkout-section-title">Shipping Address</h2>
                <form onSubmit={handleAddressSubmit}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={shipping.fullName} onChange={e => setShipping({...shipping, fullName: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input className="form-input" value={shipping.street} onChange={e => setShipping({...shipping, street: e.target.value})} required />
                  </div>
                  <div className="grid-3">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input className="form-input" value={shipping.state} onChange={e => setShipping({...shipping, state: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PIN Code</label>
                      <input className="form-input" value={shipping.zipCode} onChange={e => setShipping({...shipping, zipCode: e.target.value})} required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? 'Saving...' : 'Continue to Payment →'}
                  </button>
                </form>
              </div>
            )}

            {step === 2 && order && (
              <div className="card checkout-card">
                <div className="payment-header">
                  <h2 className="checkout-section-title">Secure Payment</h2>
                  <div className="secure-badge"><FiLock size={12} /> SSL Encrypted</div>
                </div>
                <Elements stripe={stripePromise}>
                  <CheckoutForm order={order} onSuccess={handlePaymentSuccess} />
                </Elements>
                <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ marginTop: 12 }}>
                  <FiArrowLeft /> Edit Address
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="card checkout-summary">
            <h2 className="summary-title">Order Summary</h2>
            <div className="checkout-items">
              {(cart?.items || []).map(item => (
                <div key={item._id} className="checkout-item">
                  <img src={item.product?.images?.[0] || `https://picsum.photos/seed/${item.product?._id}/80/80`} alt={item.name} />
                  <div className="checkout-item-info">
                    <div className="checkout-item-name">{item.name}</div>
                    {item.size && <div className="checkout-item-meta">Size: {item.size}</div>}
                    <div className="checkout-item-meta">Qty: {item.quantity}</div>
                  </div>
                  <div className="checkout-item-price">₹{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal</span><span>₹{totalPrice.toLocaleString()}</span></div>
              <div className="summary-row"><span>Shipping</span><span className={shippingPrice === 0 ? 'text-green' : ''}>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span></div>
              <div className="summary-row"><span>GST (18%)</span><span>₹{taxPrice.toLocaleString()}</span></div>
              <div className="summary-total"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
