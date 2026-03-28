import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import { FiHeart } from 'react-icons/fi';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.wishlist);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = (productId, added) => {
    if (!added) setWishlist(w => w.filter(p => p._id !== productId));
  };

  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading">My Wishlist <span className="heading-count">{wishlist.length} items</span></h1>

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiHeart size={64} /></div>
            <h2>Your wishlist is empty</h2>
            <p>Save items you love by clicking the heart icon on any product</p>
            <Link to="/products" className="btn btn-primary">Discover Products</Link>
          </div>
        ) : (
          <div className="grid-4">
            {wishlist.map(p => (
              <ProductCard key={p._id} product={p} onWishlistToggle={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
