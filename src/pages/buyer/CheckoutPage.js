import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiLock, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import './CheckoutPage.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const CARD_STYLE = {
  style: {
    base: { fontSize: '16px', color: '#2C3E50', fontFamily: 'DM Sans, sans-serif', '::placeholder': { color: '#adb5bd' } },
    invalid: { color: '#e74c3c' },
  },
};

function CheckoutForm({ order, onSuccess }) {
  const stripe      = useStripe();
  const elements    = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError,  setCardError]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setCardError('');
    try {
      const { data } = await api.post('/payments/create-payment-intent', { orderId: order._id });
      const result   = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) {
        setCardError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        await api.put(`/payments/${order._id}/pay`, {
          paymentResult: {
            id:          result.paymentIntent.id,
            status:      result.paymentIntent.status,
            update_time: new Date().toISOString(),
          },
        });
        onSuccess();
      }
    } catch (err) {
      setCardError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-group">
        <label className="form-label">Card Details</label>
        <div className="card-element-wrap">
          <CardElement options={CARD_STYLE} />
        </div>
        <div className="card-hint">Test card: 4242 4242 4242 4242 | Any future date | Any CVC</div>
      </div>
      {cardError && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiAlertCircle /> {cardError}
        </div>
      )}
      <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={processing || !stripe}>
        <FiLock /> {processing ? 'Processing payment...' : `Pay ₹${order.totalPrice?.toLocaleString()}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [step,    setStep]    = useState(1);
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const [shipping, setShipping] = useState({
    fullName: user?.name    || '',
    phone:    user?.phone   || '',
    street:   user?.address?.street  || '',
    city:     user?.address?.city    || '',
    state:    user?.address?.state   || '',
    zipCode:  user?.address?.zipCode || '',
    country:  'India',
  });

  // ── Form validation ──────────────────────────────────────────────────────────
  const validateShipping = () => {
    const e = {};
    if (!shipping.fullName.trim())        e.fullName = 'Full name is required';
    if (!shipping.phone.trim())           e.phone    = 'Phone number is required';
    else if (!/^\+?[\d\s\-]{8,15}$/.test(shipping.phone.trim())) e.phone = 'Enter a valid phone number';
    if (!shipping.street.trim())          e.street   = 'Street address is required';
    if (!shipping.city.trim())            e.city     = 'City is required';
    if (!shipping.state.trim())           e.state    = 'State is required';
    if (!shipping.zipCode.trim())         e.zipCode  = 'PIN code is required';
    else if (!/^\d{6}$/.test(shipping.zipCode.trim())) e.zipCode = 'Enter a valid 6-digit PIN code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const upd = (key, val) => {
    setShipping(s => ({ ...s, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!validateShipping()) {
      toast.error('Please fix the errors below');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: shipping,
        paymentMethod: 'stripe',
      });
      setOrder(data.order);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // ── After successful payment: clear cart state + navigate ────────────────────
  const handlePaymentSuccess = async () => {
    toast.success('Payment successful! 🎉');
    await clearCart(); // clears both DB and frontend state
    navigate(`/order-confirmation/${order._id}`);
  };

  const shippingPrice = totalPrice > 999 ? 0 : 99;
  const taxPrice      = Math.round(totalPrice * 0.18 * 100) / 100;
  const grandTotal    = totalPrice + shippingPrice + taxPrice;

  if (!cart?.items?.length && !order) {
    navigate('/cart'); return null;
  }

  const Field = ({ label, field, placeholder, type = 'text' }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className={`form-input ${errors[field] ? 'error' : ''}`}
        placeholder={placeholder}
        value={shipping[field]}
        onChange={e => upd(field, e.target.value)}
      />
      {errors[field] && <div className="form-error"><FiAlertCircle size={12} /> {errors[field]}</div>}
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading">Checkout</h1>

        {/* Steps */}
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

            {/* Step 1 — Address */}
            {step === 1 && (
              <div className="card checkout-card">
                <h2 className="checkout-section-title">Shipping Address</h2>
                <form onSubmit={handleAddressSubmit} noValidate>
                  <div className="grid-2">
                    <Field label="Full Name *"     field="fullName" placeholder="Arjun Kumar" />
                    <Field label="Phone Number *"  field="phone"    placeholder="+91 98765 43210" type="tel" />
                  </div>
                  <Field label="Street Address *" field="street"  placeholder="42, MG Road, Nungambakkam" />
                  <div className="grid-3">
                    <Field label="City *"     field="city"    placeholder="Chennai" />
                    <Field label="State *"    field="state"   placeholder="Tamil Nadu" />
                    <Field label="PIN Code *" field="zipCode" placeholder="600001" />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? <><span className="btn-spinner" /> Saving...</> : 'Continue to Payment →'}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2 — Payment */}
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
                  <img
                    src={item.product?.images?.[0] || `https://picsum.photos/seed/${item.product?._id}/80/80`}
                    alt={item.name}
                  />
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
              <div className="summary-row">
                <span>Shipping</span>
                <span className={shippingPrice === 0 ? 'text-green' : ''}>
                  {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                </span>
              </div>
              <div className="summary-row"><span>GST (18%)</span><span>₹{taxPrice.toLocaleString()}</span></div>
              <div className="summary-total"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
