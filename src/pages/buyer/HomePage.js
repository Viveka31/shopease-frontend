import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import { FiArrowRight, FiTruck, FiRefreshCw, FiShield, FiHeadphones } from 'react-icons/fi';
import './HomePage.css';

const CATEGORIES = [
  { name: "Men's Clothing",   emoji: '👔', color: '#2C3E50', bg: '#eaf0fb' },
  { name: "Women's Clothing", emoji: '👗', color: '#8e44ad', bg: '#f5eafb' },
  { name: "Kids' Clothing",   emoji: '🧒', color: '#e67e22', bg: '#fef5ea' },
  { name: 'Accessories',      emoji: '👜', color: '#00C2A8', bg: '#e0faf6' },
  { name: 'Footwear',         emoji: '👟', color: '#e74c3c', bg: '#fdeaea' },
  { name: 'Activewear',       emoji: '🏋️', color: '#27ae60', bg: '#eafaf1' },
];

const FEATURES = [
  { icon: <FiTruck />,       title: 'Free Shipping',   desc: 'On orders above ₹999'       },
  { icon: <FiRefreshCw />,   title: 'Easy Returns',    desc: '30-day hassle-free returns'  },
  { icon: <FiShield />,      title: 'Secure Payment',  desc: '100% protected checkout'     },
  { icon: <FiHeadphones />,  title: '24/7 Support',    desc: 'Dedicated customer care'     },
];

// ── Hero Carousel — auto-slides every 3s ────────────────────────────────────
const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80',
    label: 'Traditional Saree',
    tag: '🔥 Trending Now',
  },
  {
    src: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
    label: 'Ethnic Elegance',
    tag: '✨ New Arrival',
  },
  {
    src: 'https://images.unsplash.com/photo-1617627131698-f9d51ec0df38?w=600&q=80',
    label: 'Festive Collection',
    tag: '🎉 Season Special',
  },
  {
    src: 'https://images.unsplash.com/photo-1594938298603-9f8e388c3a41?w=600&q=80',
    label: 'Bridal Wear',
    tag: "💫 Editor's Pick",
  },
];

function HeroCarousel() {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-carousel">
      <div className="hero-carousel-track" style={{ transform: `translateX(-${current * 100}%)`  }}>
        {HERO_SLIDES.map((slide, i) => (
          <div key={i} className="hero-carousel-slide">
            <img src={slide.src} alt={slide.label} className="hero-img" />
          </div>
        ))}
      </div>

      {/* Badge */}
      <div className="hero-img-badge">
        <span>{HERO_SLIDES[current].tag.split(' ')[0]}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{HERO_SLIDES[current].tag.slice(3)}</div>
          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{HERO_SLIDES[current].label}</div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="hero-carousel-dots">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [featured,    setFeatured]    = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [stats,       setStats]       = useState({ products: 0, customers: 0, brands: 0 });
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [featRes, newRes, statsRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products?sort=-createdAt&limit=8'),
          api.get('/products/stats'),
        ]);
        setFeatured(featRes.data.products || []);
        setNewArrivals(newRes.data.products || []);
        if (statsRes.data) setStats(statsRes.data);
      } catch (e) {
        // stats endpoint might not exist yet, ignore gracefully
        try {
          const [featRes, newRes] = await Promise.all([
            api.get('/products/featured'),
            api.get('/products?sort=-createdAt&limit=8'),
          ]);
          setFeatured(featRes.data.products || []);
          setNewArrivals(newRes.data.products || []);
        } catch (e2) { console.error(e2); }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmtNum = (n) => n >= 1000 ? `${(n / 1000).toFixed(0)}K+` : n > 0 ? `${n}+` : '—';

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob b1" />
          <div className="hero-blob b2" />
          <div className="hero-blob b3" />
        </div>
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="hero-badge">New Season 2026 🔥</span>
            <h1 className="hero-title">
              Dress to<br />
              <span className="hero-accent">Impress</span>
            </h1>
            <p className="hero-desc">
              Discover the latest trends in fashion. From everyday essentials to statement pieces — curated just for you.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Shop Now <FiArrowRight />
              </Link>
              <Link to="/products?category=Women's%20Clothing" className="btn btn-outline btn-lg">
                Women's
              </Link>
            </div>
            {(stats.products > 0 || stats.customers > 0) && (
              <div className="hero-stats">
                {stats.products > 0 && (
                  <>
                    <div className="hero-stat">
                      <span className="stat-num">{fmtNum(stats.products)}</span>
                      <span>Products</span>
                    </div>
                    <div className="hero-stat-div" />
                  </>
                )}
                {stats.customers > 0 && (
                  <>
                    <div className="hero-stat">
                      <span className="stat-num">{fmtNum(stats.customers)}</span>
                      <span>Customers</span>
                    </div>
                    <div className="hero-stat-div" />
                  </>
                )}
                {stats.brands > 0 && (
                  <div className="hero-stat">
                    <span className="stat-num">{fmtNum(stats.brands)}</span>
                    <span>Brands</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="hero-visual">
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="features-strip">
        <div className="container">
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-item">
                <span className="feature-icon">{f.icon}</span>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Find exactly what you're looking for</p>
            </div>
            <Link to="/products" className="btn btn-ghost">View All <FiArrowRight /></Link>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
                style={{ '--cat-color': cat.color, '--cat-bg': cat.bg }}
              >
                <div className="category-emoji">{cat.emoji}</div>
                <div className="category-name">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : featured.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Featured Products</h2>
                <p className="section-subtitle">Handpicked just for you</p>
              </div>
              <Link to="/products" className="btn btn-ghost">View All <FiArrowRight /></Link>
            </div>
            <div className="grid-4">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Promo Banners */}
      <section className="banner-section">
        <div className="container">
          <div className="banner-grid">
            <div className="banner-card banner-primary">
              <div className="banner-content">
                <span className="banner-tag">Up to 50% Off</span>
                <h3>Women's Summer Sale</h3>
                <p>Limited time. Don't miss out.</p>
                <Link to="/products?category=Women's%20Clothing" className="btn btn-primary btn-sm">Shop Now</Link>
              </div>
              <div className="banner-emoji">👗</div>
            </div>
            <div className="banner-card banner-secondary">
              <div className="banner-content">
                <span className="banner-tag">New Arrivals</span>
                <h3>Men's Street Style</h3>
                <p>Fresh drops every week.</p>
                <Link to="/products?category=Men's%20Clothing" className="btn btn-navy btn-sm">Explore</Link>
              </div>
              <div className="banner-emoji">👔</div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">New Arrivals</h2>
                <p className="section-subtitle">Fresh fashion, just landed</p>
              </div>
              <Link to="/products?sort=-createdAt" className="btn btn-ghost">View All <FiArrowRight /></Link>
            </div>
            <div className="grid-4">
              {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Empty state for fresh installs */}
      {!loading && featured.length === 0 && newArrivals.length === 0 && (
        <section className="section">
          <div className="container">
            <div className="empty-state">
              <div style={{ fontSize: 64 }}>🛍️</div>
              <h2>No products yet</h2>
              <p>Run <code>npm run seed</code> in the backend to add sample products, or sign up as a seller and add your own!</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary">Become a Seller</Link>
                <Link to="/products" className="btn btn-outline">Browse Products</Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
