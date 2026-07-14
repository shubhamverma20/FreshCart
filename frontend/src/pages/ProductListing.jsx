import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiStar, FiFilter, FiSearch, FiSliders, FiGrid, FiList, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCardSkeleton } from '../components/Skeleton';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';
import Button from '../components/Button';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy & Eggs', 'Bakery', 'Beverages', 'Snacks'];

export default function ProductListing({ searchQuery, setSearchQuery }) {
  const { apiBase } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
        return (b.reviews || 0) - (a.reviews || 0); // Default to popular
      });
  }, [products, selectedCategory, maxPrice, minRating, sortBy, searchQuery]);

  // Pagination Logic
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-primary" /> Filters
        </h3>
        <button 
          onClick={clearAllFilters}
          className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="font-display font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Category</h4>
        <div className="space-y-1 max-h-[30vh] lg:max-h-none overflow-y-auto pr-1 hide-scrollbar">
          <button
            onClick={() => handleCategorySelect('All')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'All' 
                ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                  : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <h4 className="font-display font-extrabold text-xs text-slate-808 dark:text-slate-200 uppercase tracking-wider">Max Price</h4>
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
        <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
          <span>₹10</span>
          <span>₹500</span>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3 pt-2">
        <h4 className="font-display font-extrabold text-xs text-slate-808 dark:text-slate-200 uppercase tracking-wider">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 0].map((stars) => (
            <label 
              key={stars} 
              className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none"
            >
              <input 
                type="radio" 
                name="rating-filter"
                checked={minRating === stars}
                onChange={() => setMinRating(stars)}
                className="accent-primary w-4 h-4 cursor-pointer" 
              />
              {stars === 0 ? 'Any Rating' : (
                <span className="flex items-center gap-1 font-bold">
                  {stars}+ <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <main className="main-content container px-4 sm:px-6 lg:px-8 text-left pb-20">
      {/* Breadcrumbs */}
      <Breadcrumb 
        paths={[
          { label: 'Home', to: '/' },
          { label: 'Shop Products', to: '/products' }
        ]} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative mt-2">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-[28px] shadow-sm h-fit sticky top-24">
          <FilterContent />
        </aside>

        {/* Mobile Filter Bottom Sheet */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 lg:hidden"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[32px] p-6 lg:hidden max-h-[85vh] overflow-y-auto shadow-soft-lg border-t border-slate-100 dark:border-slate-800"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="absolute top-6 right-6 p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <FiX className="w-4 h-4" />
                </button>
                <FilterContent />
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <Button 
                    onClick={() => setIsFilterOpen(false)}
                    variant="primary"
                    size="md"
                    className="w-full text-xs font-bold"
                  >
                    Apply Filters
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Floating Mobile Filter Button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 dark:bg-slate-800 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold hover:scale-105 active:scale-95 transition-transform"
        >
          <FiFilter className="w-4 h-4" />
          Filters
        </button>

        {/* 2. Main Content Grid */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* Grid Top Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl shadow-sm w-full">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-800 dark:text-white">{filteredProducts.length}</strong> items matching
            </span>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              {/* Sorting */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FiSliders className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-primary"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Average Rating</option>
                </select>
              </div>

              {/* Grid / List Mode */}
              <div className="flex border border-slate-250/60 dark:border-slate-800 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-950 hidden sm:flex">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-500'}`}
                >
                  <FiGrid className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-500'}`}
                >
                  <FiList className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid / List Display */}
          {loading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {Array(6).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-[32px] p-8 shadow-sm">
              <span className="text-4xl" role="img" aria-label="Not Found">🥗</span>
              <h3 className="font-display font-extrabold text-lg text-slate-800 dark:text-slate-100 mt-4">No products found</h3>
              <p className="text-slate-450 dark:text-slate-500 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                Try widening your search terms, clearing some filters, or adjusting the price slider.
              </p>
              <Button 
                onClick={clearAllFilters}
                variant="primary"
                size="md"
                className="mt-6 text-xs font-bold"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id || product._id} product={product} layout={viewMode} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array(totalPages).fill(0).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === i + 1 
                      ? 'bg-primary text-white shadow-sm shadow-emerald-500/10' 
                      : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
