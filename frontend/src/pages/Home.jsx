import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiArrowRight, FiClock, FiStar, FiChevronRight, FiChevronLeft, FiMail, FiShield, FiTruck, FiPhoneCall, FiShoppingBag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCardSkeleton, CategorySkeleton } from '../components/Skeleton';

const CATEGORIES = [
  { id: 'Vegetables', name: 'Vegetables', icon: '🥬', bg: 'from-green-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/10' },
  { id: 'Fruits', name: 'Fruits', icon: '🍎', bg: 'from-red-50 to-orange-100 dark:from-red-950/20 dark:to-orange-900/10' },
  { id: 'Dairy & Eggs', name: 'Dairy & Eggs', icon: '🥛', bg: 'from-blue-50 to-sky-100 dark:from-blue-950/20 dark:to-sky-900/10' },
  { id: 'Bakery', name: 'Bakery', icon: '🍞', bg: 'from-amber-50 to-yellow-100 dark:from-amber-950/20 dark:to-yellow-900/10' },
  { id: 'Beverages', name: 'Beverages', icon: '🧃', bg: 'from-purple-50 to-fuchsia-100 dark:from-purple-950/20 dark:to-fuchsia-900/10' },
  { id: 'Snacks', name: 'Snacks', icon: '🍫', bg: 'from-pink-50 to-rose-100 dark:from-pink-950/20 dark:to-rose-900/10' }
];

export default function Home({ searchQuery }) {
  const { addToCart } = useCart();
  const { apiBase } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(14400); // 4 hours in seconds
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}h : ${m}m : ${s}s`;
  };

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

  // Filters for displaying specific sections
  const flashDeals = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 4);
  const bestSellers = products.filter(p => p.badge === 'Bestseller' || p.rating >= 4.7).slice(0, 4);
  const featuredProducts = products.slice(0, 8);

  const handleAddToCart = (product) => {
    addToCart(product);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const testimonials = [
    { name: "Aarav Sharma", text: "Extremely fast delivery! The spinach and tomatoes were fresher than what I get at my local market. FreshCart has become my default grocery provider.", rating: 5, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop" },
    { name: "Priya Patel", text: "I love the clean interface and dark mode support. Checkout is super smooth, and the coupon discounts are real. Highly recommended!", rating: 5, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop" }
  ];

  return (
    <main className="main-content container px-4 sm:px-6 lg:px-8">
      {/* 1. Hero Banner Section */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-amber-500/5 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border border-emerald-500/10 p-8 sm:p-12 lg:p-16 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        
        <div className="flex-1 max-w-xl">
          <span className="inline-block bg-primary/10 text-primary dark:bg-primary/20 font-extrabold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4">
            ⚡ Quickest Grocery App
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-800 dark:text-white leading-tight">
            Fresh Groceries, <br />
            <span className="text-primary">Delivered in 10 Mins.</span>
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-md">
            Get your daily essentials, organic fruits, vegetables, dairy, and bakery items delivered straight to your door instantly.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/products')}
              className="bg-primary hover:bg-primary-hover text-white text-base font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.01] flex items-center gap-2 cursor-pointer"
            >
              Order Now <FiArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-base font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
            >
              View Offers
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-center md:justify-end">
          <motion.img
            src="https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/hero.png"
            alt="Premium Groceries Basket"
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="max-h-[340px] drop-shadow-[0_20px_35px_rgba(16,185,129,0.18)]"
          />
        </div>
      </section>

      {/* 2. Shop By Categories */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-white">Shop by Category</h2>
          <span className="text-sm font-semibold text-primary cursor-pointer hover:underline" onClick={() => navigate('/products')}>
            View All Categories
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/products?category=${cat.id}`)}
              className={`bg-gradient-to-b ${cat.bg} p-6 rounded-3xl border border-slate-100 dark:border-slate-800/40 text-center cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <div className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Flash Deals Section */}
      {flashDeals.length > 0 && (
        <section className="mb-12 bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/10 rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-white">Flash Deals</h2>
              <div className="flex items-center gap-1.5 bg-amber-500 text-white font-mono font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                <FiClock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              flashDeals.map((product) => (
                <div key={product.id || product._id} className="bg-white dark:bg-slate-850 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col relative text-left">
                  {product.badge && (
                    <span className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
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
                    <span>({product.reviews || '45'})</span>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <div className="font-display font-extrabold text-xl text-slate-800 dark:text-slate-100">
                      ₹{product.price}
                      {product.originalPrice && (
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
              ))
            )}
          </div>
        </section>
      )}

      {/* 4. Best Sellers */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-white">Best Sellers</h2>
          <span className="text-sm font-semibold text-primary cursor-pointer hover:underline" onClick={() => navigate('/products')}>
            View All Best Sellers
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            bestSellers.map((product) => (
              <div key={product.id || product._id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/40 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col relative text-left">
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
                  </div>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="bg-primary hover:bg-primary-hover text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/10 cursor-pointer active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. Featured Products Grid */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-white">Featured Products</h2>
          <span className="text-sm font-semibold text-primary cursor-pointer hover:underline" onClick={() => navigate('/products')}>
            View All Products
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            featuredProducts.map((product) => (
              <div key={product.id || product._id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/40 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col relative text-left">
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
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
            ))
          )}
        </div>
      </section>

      {/* Brand Values / Trust Badges */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 py-8 border-y border-slate-100 dark:border-slate-850">
        <div className="flex gap-4 items-start p-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-primary flex items-center justify-center flex-shrink-0">
            <FiTruck className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100">Free Delivery</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Get free delivery on orders above ₹199 inside city limits.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start p-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-primary flex items-center justify-center flex-shrink-0">
            <FiShield className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100">100% Secure Checkout</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Fully integrated payments via Razorpay cards, UPI, and COD.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start p-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-primary flex items-center justify-center flex-shrink-0">
            <FiPhoneCall className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100">24/7 Premium Support</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Need help? Chat with our customer success agents instantly.</p>
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews Testimonial */}
      <section className="mb-16 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 sm:p-12 flex flex-col items-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-white mb-6">Loved by Thousands</h2>
        
        <div className="min-h-[140px] flex flex-col justify-center items-center">
          <p className="text-base sm:text-lg italic text-slate-600 dark:text-slate-300 text-center max-w-xl">
            "{testimonials[activeTestimonial].text}"
          </p>
          <div className="flex gap-1.5 mt-4">
            {Array(testimonials[activeTestimonial].rating).fill(0).map((_, i) => (
              <FiStar key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-6">
            <img src={testimonials[activeTestimonial].avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div className="text-left">
              <div className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100">
                {testimonials[activeTestimonial].name}
              </div>
              <div className="text-xs text-slate-400">Verified Buyer</div>
            </div>
          </div>
        </div>

        {/* Carousel controls */}
        <div className="flex gap-3 mt-8">
          <button 
            onClick={() => setActiveTestimonial(p => p === 0 ? testimonials.length - 1 : p - 1)}
            className="p-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActiveTestimonial(p => p === testimonials.length - 1 ? 0 : p + 1)}
            className="p-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 7. Newsletter Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-900 dark:to-emerald-950 text-white rounded-[32px] p-8 sm:p-12 mb-16 text-center max-w-4xl mx-auto shadow-xl shadow-emerald-600/10">
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold">Get 20% Off Your First Order</h2>
        <p className="text-sm text-emerald-100 mt-2 max-w-md mx-auto">
          Subscribe to our newsletter to receive updates, exclusive deals, and healthy recipes.
        </p>
        <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); showToast('Subscribed to newsletter!', 'success'); }}>
          <div className="relative flex-1">
            <input 
              type="email" 
              required
              placeholder="Enter your email address" 
              className="w-full bg-white/10 text-white border border-white/20 pl-11 pr-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-emerald-100 text-sm font-semibold"
            />
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-100 w-4.5 h-4.5" />
          </div>
          <button 
            type="submit"
            className="bg-white hover:bg-slate-50 text-emerald-700 font-bold px-6 py-3.5 rounded-2xl transition-all cursor-pointer text-sm shadow-md"
          >
            Subscribe
          </button>
        </form>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-850 pt-16 pb-8 text-slate-500 dark:text-slate-400 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
                <FiShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-emerald-600 dark:text-emerald-500">
                FreshCart
              </span>
            </Link>
            <p className="text-xs leading-relaxed mt-2 pr-6">
              Your favorite daily grocery app delivering organic vegetables, fruits, dairy products, bakery items, and drinks to your home in 10 minutes.
            </p>
          </div>
          {/* Categories links */}
          <div>
            <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/products?category=Vegetables" className="hover:text-primary transition-colors">Vegetables</Link></li>
              <li><Link to="/products?category=Fruits" className="hover:text-primary transition-colors">Fruits</Link></li>
              <li><Link to="/products?category=Dairy%20%26%20Eggs" className="hover:text-primary transition-colors">Dairy & Eggs</Link></li>
              <li><Link to="/products?category=Bakery" className="hover:text-primary transition-colors">Bakery</Link></li>
            </ul>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/products" className="hover:text-primary transition-colors">Shop Products</Link></li>
              <li><Link to="/delivery" className="hover:text-primary transition-colors">Track Delivery</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">User Account</Link></li>
              <li><Link to="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>
          {/* Payments Badge */}
          <div>
            <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Payment Methods</h4>
            <p className="text-xs leading-relaxed mb-4">We accept Visa, MasterCard, RuPay Cards, Google Pay, PhonePe, and COD.</p>
            <img src="https://help.razorpay.com/assets/images/pay_methods.png" alt="Payment Gateways Badge" className="max-w-[200px] brightness-90 dark:brightness-75" />
          </div>
        </div>
        
        <div className="border-t border-slate-100 dark:border-slate-850 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <span>&copy; 2026 FreshCart Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer">Terms of Service</span>
            <span className="hover:text-primary cursor-pointer">Cookie Settings</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
