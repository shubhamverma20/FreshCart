import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiStar, FiFilter, FiSearch, FiSliders, FiGrid, FiList } from 'react-icons/fi';
import { ProductCardSkeleton } from '../components/Skeleton';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy & Eggs', 'Bakery', 'Beverages', 'Snacks'];

export default function ProductListing({ searchQuery, setSearchQuery }) {
  const { addToCart } = useCart();
  const { apiBase } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [maxPrice, setMaxPrice] = useState(400);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price-low' | 'price-high' | 'rating'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sync category state with search query URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'All';
    if (categoryParam !== selectedCategory) {
      Promise.resolve().then(() => {
        setSelectedCategory(categoryParam);
      });
    }
  }, [searchParams, selectedCategory]);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [apiBase]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory = selectedCategory === 'All' 
          ? true 
          : product.category.toLowerCase() === selectedCategory.toLowerCase();
          
        const matchesPrice = product.price <= maxPrice;
        const matchesRating = product.rating >= minRating;
        
        const matchesSearch = searchQuery
          ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        return matchesCategory && matchesPrice && matchesRating && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return b.reviews - a.reviews; // Default to popular
      });
  }, [products, selectedCategory, maxPrice, minRating, sortBy, searchQuery]);

  // Pagination Logic
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleAddToCart = (product) => {
    addToCart(product);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setMaxPrice(400);
    setMinRating(0);
    setSortBy('popular');
    setSearchQuery('');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  return (
    <main className="main-content container px-4 sm:px-6 lg:px-8 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-300">Shop Products</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 1. Sidebar Filters */}
        <aside className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm h-fit">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <h3 className="font-display font-extrabold text-lg text-slate-850 dark:text-white flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-primary" /> Filters
            </h3>
            <button 
              onClick={clearAllFilters}
              className="text-xs font-bold text-red-500 hover:text-red-650 cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 mb-3.5">Category</h4>
            <div className="space-y-2">
              <button
                onClick={() => handleCategorySelect('All')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'All' 
                    ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">Max Price</h4>
              <span className="text-xs font-extrabold text-primary">₹{maxPrice}</span>
            </div>
            <input 
              type="range" 
              min={10} 
              max={500} 
              step={10}
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1">
              <span>₹10</span>
              <span>₹500</span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 mb-3">Minimum Rating</h4>
            <div className="space-y-2">
              {[4, 3, 0].map((stars) => (
                <label 
                  key={stars} 
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-450 cursor-pointer"
                >
                  <input 
                    type="radio" 
                    name="rating-filter"
                    checked={minRating === stars}
                    onChange={() => setMinRating(stars)}
                    className="accent-primary w-4 h-4 cursor-pointer" 
                  />
                  {stars === 0 ? 'Any Rating' : (
                    <span className="flex items-center gap-1">
                      {stars}+ <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* 2. Main Content Grid */}
        <section className="lg:col-span-3">
          
          {/* Grid Top Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm mb-6 w-full">
            <span className="text-sm font-semibold text-slate-550 dark:text-slate-400">
              Showing <strong className="text-slate-800 dark:text-white">{filteredProducts.length}</strong> items matching
            </span>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              {/* Sorting */}
              <div className="flex items-center gap-2">
                <FiSliders className="w-4 h-4 text-slate-400" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-1.5 focus:outline-none focus:border-primary"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Average Rating</option>
                </select>
              </div>

              {/* Grid / List Mode */}
              <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800/50">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-650'}`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-650'}`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid / List Display */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
              <span className="text-5xl" role="img" aria-label="Not Found">🥗</span>
              <h3 className="font-display font-extrabold text-xl text-slate-800 dark:text-slate-100 mt-4">No products found</h3>
              <p className="text-slate-500 dark:text-slate-450 text-sm mt-2 max-w-xs mx-auto">
                Try widening your search terms, clearing some filters, or adjusting the price slider.
              </p>
              <button 
                onClick={clearAllFilters}
                className="mt-6 bg-primary hover:bg-primary-hover text-white font-bold text-sm px-6 py-3 rounded-full transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <div key={product.id || product._id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col relative text-left">
                  {product.badge && (
                    <span className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
                      {product.badge}
                    </span>
                  )}
                  <Link to={`/products/${product.id || product._id}`} className="block">
                    <img src={product.image} alt={product.name} className="w-full h-40 object-contain mb-4 hover:scale-105 transition-transform duration-300" />
                  </Link>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {product.category}
                  </span>
                  <Link to={`/products/${product.id || product._id}`} className="font-display font-bold text-base text-slate-800 dark:text-slate-100 hover:text-primary transition-colors line-clamp-1 mt-1">
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{product.rating || '4.5'}</span>
                    <span>({product.reviews || '50'})</span>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <div className="font-display font-extrabold text-xl text-slate-800 dark:text-slate-100">
                      ₹{product.price}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs font-semibold text-red-500 line-through ml-2">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="bg-primary hover:bg-primary-hover text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/10 cursor-pointer active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List layout */
            <div className="space-y-4">
              {paginatedProducts.map((product) => (
                <div key={product.id || product._id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 text-left relative">
                  {product.badge && (
                    <span className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
                      {product.badge}
                    </span>
                  )}
                  
                  <Link to={`/products/${product.id || product._id}`} className="block w-36 h-36 flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
                  </Link>

                  <div className="flex-1 flex flex-col justify-center min-w-0 w-full">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <Link to={`/products/${product.id || product._id}`} className="font-display font-extrabold text-lg text-slate-850 dark:text-slate-100 hover:text-primary mt-1 line-clamp-1">
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-slate-550 dark:text-slate-450">
                      <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{product.rating || '4.5'}</span>
                      <span>({product.reviews || '50'} customer reviews)</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 line-clamp-2">
                      Get premium, locally sourced fresh products delivered straight to your door with secure checkout options.
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 w-full sm:w-32 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-display font-extrabold text-xl text-slate-850 dark:text-slate-100">
                        ₹{product.price}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-xs font-semibold text-red-500 line-through">
                          ₹{product.originalPrice}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="bg-primary hover:bg-primary-hover text-white font-bold text-sm px-4.5 py-2.5 rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      Add +
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array(totalPages).fill(0).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    currentPage === i + 1 
                      ? 'bg-primary text-white shadow-md' 
                      : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}

        </section>

      </div>
    </main>
  );
}
