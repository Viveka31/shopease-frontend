import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiPackage, FiLogOut, FiSettings, FiBarChart2, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Navbar.css';

const CATEGORIES = ["Men's Clothing", "Women's Clothing", "Kids' Clothing", 'Accessories', 'Footwear', 'Activewear'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/products?keyword=${encodeURIComponent(search.trim())}`); setSearch(''); }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
    setDropdownOpen(false);
  };

  const isSeller = user?.role === 'seller' || user?.role === 'admin';

  return (
    <header className="navbar">
      {/* Top bar */}
      <div className="navbar-top">
        <div className="container navbar-top-inner">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">S</span>
            <span className="logo-text">ShopEase</span>
          </Link>

          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for clothes, brands, styles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <FiSearch size={18} />
            </button>
          </form>

          <div className="navbar-actions">
            {user ? (
              <>
                {!isSeller && (
                  <>
                    <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
                      <FiHeart size={20} />
                    </Link>
                    <Link to="/cart" className="nav-icon-btn cart-btn" title="Cart">
                      <FiShoppingCart size={20} />
                      {totalItems > 0 && <span className="cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>}
                    </Link>
                  </>
                )}

                <div className="user-dropdown" ref={dropdownRef}>
                  <button className="user-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                    <span className="user-name-short">{user.name?.split(' ')[0]}</span>
                    <FiChevronDown size={14} className={`chevron ${dropdownOpen ? 'open' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <div className="dropdown-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="dropdown-name">{user.name}</div>
                          <div className="dropdown-email">{user.email}</div>
                          <span className={`badge badge-${isSeller ? 'teal' : 'navy'}`}>{user.role}</span>
                        </div>
                      </div>
                      <div className="dropdown-divider" />
                      {isSeller ? (
                        <>
                          <Link to="/seller/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}><FiBarChart2 /> Dashboard</Link>
                          <Link to="/seller/products" className="dropdown-item" onClick={() => setDropdownOpen(false)}><FiPackage /> My Products</Link>
                          <Link to="/seller/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}><FiPackage /> Orders</Link>
                        </>
                      ) : (
                        <>
                          <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}><FiSettings /> Profile</Link>
                          <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}><FiPackage /> My Orders</Link>
                          <Link to="/wishlist" className="dropdown-item" onClick={() => setDropdownOpen(false)}><FiHeart /> Wishlist</Link>
                        </>
                      )}
                      <div className="dropdown-divider" />
                      <button className="dropdown-item danger" onClick={handleLogout}><FiLogOut /> Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-btns">
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
              </div>
            )}

            <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="navbar-cats">
        <div className="container">
          <div className="cats-list">
            <Link to="/products" className="cat-link">All</Link>
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className="cat-link">{cat}</Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleSearch} className="mobile-search">
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <div className="mobile-cats">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className="mobile-cat-link">{cat}</Link>
            ))}
          </div>
          {!user && (
            <div className="mobile-auth">
              <Link to="/login" className="btn btn-outline btn-full">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-full">Join Free</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
