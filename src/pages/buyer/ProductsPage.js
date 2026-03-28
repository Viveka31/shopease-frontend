import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './ProductsPage.css';

const CATEGORIES = ["Men's Clothing", "Women's Clothing", "Kids' Clothing", 'Accessories', 'Footwear', 'Activewear'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Top Rated' },
  { value: '-sold', label: 'Best Selling' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      keyword: searchParams.get('keyword') || '',
      category: searchParams.get('category') || '',
    }));
  }, [searchParams]);

  const updateFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ keyword: '', category: '', minPrice: '', maxPrice: '', rating: '', sort: '-createdAt', page: 1 });
    setSearchParams({});
  };

  const activeFiltersCount = [filters.category, filters.minPrice, filters.maxPrice, filters.rating].filter(Boolean).length;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="products-header">
          <div>
            <h1 className="products-title">
              {filters.keyword ? `Results for "${filters.keyword}"` : filters.category || 'All Products'}
            </h1>
            <p className="products-count">{total} items found</p>
          </div>
          <div className="products-controls">
            <button className="filter-toggle-btn" onClick={() => setFilterOpen(!filterOpen)}>
              <FiFilter />
              Filters
              {activeFiltersCount > 0 && <span className="filter-count">{activeFiltersCount}</span>}
            </button>
            <select className="form-select sort-select" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className={`products-sidebar ${filterOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {activeFiltersCount > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear all</button>
                )}
                <button className="sidebar-close" onClick={() => setFilterOpen(false)}><FiX /></button>
              </div>
            </div>

            {/* Category */}
            <FilterSection title="Category">
              <div className="filter-options">
                <label className={`filter-option ${!filters.category ? 'active' : ''}`}>
                  <input type="radio" name="category" value="" checked={!filters.category} onChange={() => updateFilter('category', '')} />
                  All Categories
                </label>
                {CATEGORIES.map(cat => (
                  <label key={cat} className={`filter-option ${filters.category === cat ? 'active' : ''}`}>
                    <input type="radio" name="category" value={cat} checked={filters.category === cat} onChange={() => updateFilter('category', cat)} />
                    {cat}
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Price */}
            <FilterSection title="Price Range">
              <div className="price-inputs">
                <div className="price-input-wrap">
                  <span>₹</span>
                  <input type="number" className="form-input price-input" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} />
                </div>
                <span className="price-dash">—</span>
                <div className="price-input-wrap">
                  <span>₹</span>
                  <input type="number" className="form-input price-input" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} />
                </div>
              </div>
            </FilterSection>

            {/* Rating */}
            <FilterSection title="Minimum Rating">
              {[4, 3, 2, 1].map(r => (
                <label key={r} className={`filter-option ${filters.rating === String(r) ? 'active' : ''}`}>
                  <input type="radio" name="rating" value={r} checked={filters.rating === String(r)} onChange={() => updateFilter('rating', String(r))} />
                  {'★'.repeat(r)}{'☆'.repeat(5 - r)} & up
                </label>
              ))}
              {filters.rating && (
                <button className="btn btn-ghost btn-sm" onClick={() => updateFilter('rating', '')}>Clear</button>
              )}
            </FilterSection>
          </aside>

          {/* Products Grid */}
          <div className="products-main">
            {loading ? (
              <div className="loader-wrap"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <div className="no-products-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" disabled={filters.page === 1} onClick={() => updateFilter('page', filters.page - 1)}>← Prev</button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`page-btn ${filters.page === p ? 'active' : ''}`} onClick={() => updateFilter('page', p)}>{p}</button>
                    ))}
                    <button className="page-btn" disabled={filters.page === pages} onClick={() => updateFilter('page', filters.page + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="filter-section">
      <button className="filter-section-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  );
}
