import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">S</span>
              <span>ShopEase</span>
            </div>
            <p className="footer-tagline">Fashion. Delivered.</p>
            <p className="footer-desc">Your one-stop destination for the latest trends in clothing and accessories. Quality guaranteed, delivered to your door.</p>
            <div className="footer-social">
              <a href="#!" className="social-btn"><FiInstagram /></a>
              <a href="#!" className="social-btn"><FiTwitter /></a>
              <a href="#!" className="social-btn"><FiFacebook /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/products?category=Men's Clothing">Men's Clothing</Link>
            <Link to="/products?category=Women's Clothing">Women's Clothing</Link>
            <Link to="/products?category=Kids' Clothing">Kids' Clothing</Link>
            <Link to="/products?category=Accessories">Accessories</Link>
            <Link to="/products?category=Footwear">Footwear</Link>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/profile">Profile</Link>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <div className="footer-contact"><FiMail /><span>support@shopease.com</span></div>
            <div className="footer-contact"><FiPhone /><span>+91 1800-123-4567</span></div>
            <div className="footer-contact"><FiMapPin /><span>Chennai, Tamil Nadu</span></div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
          <div className="footer-links">
            <a href="#!">Privacy Policy</a>
            <a href="#!">Terms of Service</a>
            <a href="#!">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
