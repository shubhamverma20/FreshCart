import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiArrowRight, FiClock, FiStar, FiChevronRight, FiChevronLeft, FiShield, FiTruck, FiPhoneCall } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCardSkeleton } from '../components/Skeleton';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';

const CATEGORIES = [
  { id: 'Vegetables', name: 'Vegetables', icon: '🥬', bg: 'from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/10 dark:to-emerald-900/5' },
  { id: 'Fruits', name: 'Fruits', icon: '🍎', bg: 'from-rose-50/50 to-rose-100/30 dark:from-rose-950/10 dark:to-rose-900/5' },
  { id: 'Dairy & Eggs', name: 'Dairy & Eggs', icon: '🥛', bg: 'from-sky-50/50 to-sky-100/30 dark:from-sky-950/10 dark:to-sky-900/5' },
  { id: 'Bakery', name: 'Bakery', icon: '🍞', bg: 'from-amber-50/50 to-amber-100/30 dark:from-amber-950/10 dark:to-amber-900/5' },
  { id: 'Beverages', name: 'Beverages', icon: '🧃', bg: 'from-purple-50/50 to-purple-100/30 dark:from-purple-950/10 dark:to-purple-900/5' },
  { id: 'Snacks', name: 'Snacks', icon: '🍫', bg: 'from-pink-50/50 to-rose-100/30 dark:from-pink-950/10 dark:to-pink-900/5' }
];

const HERO_SLIDES = [
  {
    title: "Fresh Groceries",
    highlight: "Delivered in 12 Mins.",
    desc: "Get your daily essentials, organic fruits, vegetables, dairy, and bakery items delivered straight to your door instantly.",
    img: "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/hero.png"
  },
  {
    title: "Organic Choices",
    highlight: "Straight from Farm",
    desc: "Choose from a wide variety of fresh, organically grown produce delivered at peak freshness.",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Midnight Cravings?",
    highlight: "We Got You",
    desc: "Snacks, beverages, and ready-to-eat meals available anytime you need them.",
    img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600&auto=format&fit=crop"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 28 } }
};

export default function Home({ searchQuery }) {
  const { apiBase } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero carousel timer
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  // Flash Deals Countdown Timer
  useEffect(() => {
    const calcTimeLeft = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      return Math.floor((nextHour - now) / 1000);
    };
    
    setTimeLeft(calcTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}m : ${s}s`;
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

  const flashDeals = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 4);
  const bestSellers = products.filter(p => p.badge === 'Bestseller' || p.rating >= 4.7).slice(0, 4);
  const featuredProducts = products.slice(0, 8);

  const testimonials = [
    { name: "Aarav Sharma", text: "Extremely fast delivery! The spinach and tomatoes were fresher than what I get at my local market. FreshCart has become my default grocery provider.", rating: 5, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop" },
    { name: "Priya Patel", text: "I love the clean interface and dark mode support. Checkout is super smooth, and the coupon discounts are real. Highly recommended!", rating: 5, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop" },
    { name: "Rohan Gupta", text: "The flash deals section is a lifesaver. I always grab my snacks and drinks at a huge discount right before weekend parties.", rating: 4, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop" }
  ];

  return (
    <main className="main-content container px-4 sm:px-6 lg:px-8 pb-20 space-y-16">
      
      {/* 1. Hero Banner Section */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-left h-[520px] md:h-[420px] shadow-sm"
      >
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/40 dark:bg-primary-950/15 rounded-full filter blur-3xl -z-10 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-full filter blur-3xl -z-10 animate-blob animation-delay-2000"></div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.4 }}
            className="flex-1 max-w-xl z-10"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary dark:bg-primary/20 font-extrabold text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
              ⚡ Quickest Grocery App
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 dark:text-white leading-tight">
              {HERO_SLIDES[currentSlide].title}, <br />
              <span className="text-primary">{HERO_SLIDES[currentSlide].highlight}</span>
            </h1>
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-md">
              {HERO_SLIDES[currentSlide].desc}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button onClick={() => navigate('/products')} variant="primary" size="lg" className="text-sm">
                Order Now <FiArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button onClick={() => navigate('/products')} variant="secondary" size="lg" className="text-sm">
                View Offers
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div 
            key={`img-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              opacity: { duration: 0.4 },
              scale: { duration: 0.4 },
              y: { repeat: Infinity, duration: 6, ease: "easeInOut" }
            }}
            className="flex-1 flex justify-center md:justify-end absolute md:relative right-4 opacity-15 md:opacity-100 z-0 md:z-10"
          >
            <img
              src={HERO_SLIDES[currentSlide].img}
              alt="Hero graphic"
              className="max-h-[260px] md:max-h-[350px] drop-shadow-[0_20px_40px_rgba(34,197,94,0.08)] object-contain rounded-3xl mix-blend-multiply dark:mix-blend-normal"
            />
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-5 bg-primary' : 'w-1.5 bg-slate-200 dark:bg-slate-800'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </motion.section>

      {/* 2. Shop By Categories */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white">Shop by Category</h2>
          <span className="text-xs font-bold text-primary cursor-pointer hover:underline" onClick={() => navigate('/products')}>
            View All Categories
          </span>
        </div>
        
        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-5 snap-x snap-mandatory hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <motion.div
              variants={itemVariants}
              key={cat.id}
              onClick={() => navigate(`/products?category=${cat.id}`)}
              className={`snap-start flex-shrink-0 w-36 sm:w-auto bg-gradient-to-b ${cat.bg} p-6 rounded-3xl border border-slate-100 dark:border-slate-800/30 text-center cursor-pointer hover:-translate-y-1 hover:shadow-sm transition-all duration-350`}
            >
              <div className="text-3xl mb-3.5 drop-shadow-sm select-none">{cat.icon}</div>
              <div className="font-display font-bold text-xs text-slate-800 dark:text-slate-200">{cat.name}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 3. Flash Deals Section */}
      <AnimatePresence>
        {(!loading && flashDeals.length > 0) && (
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/10 rounded-[32px] p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xl animate-bounce">⚡</span>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white">Flash Deals</h2>
                <div className="flex items-center gap-1.5 bg-amber-505/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-extrabold text-[10px] px-3 py-1 rounded-full shadow-inner border border-amber-500/10">
                  <FiClock className="w-3.5 h-3.5" />
                  <span>{formatTime(timeLeft)} left</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashDeals.map((product) => (
                <motion.div variants={itemVariants} key={product.id || product._id}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 4. Best Sellers */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white">Best Sellers</h2>
          <span className="text-xs font-bold text-primary cursor-pointer hover:underline" onClick={() => navigate('/products')}>
            View All Best Sellers
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <motion.div key={`skeleton-bs-${i}`} variants={itemVariants}>
                <ProductCardSkeleton />
              </motion.div>
            ))
          ) : (
            bestSellers.map((product) => (
              <motion.div variants={itemVariants} key={product.id || product._id}>
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      {/* 5. Featured Products Grid */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white">Featured Products</h2>
          <span className="text-xs font-bold text-primary cursor-pointer hover:underline" onClick={() => navigate('/products')}>
            View All Products
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <motion.div key={`skeleton-fp-${i}`} variants={itemVariants}>
                <ProductCardSkeleton />
              </motion.div>
            ))
          ) : (
            featuredProducts.map((product) => (
              <motion.div variants={itemVariants} key={product.id || product._id}>
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      {/* Brand Values / Trust Badges */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-y border-slate-200/50 dark:border-slate-900/60"
      >
        <motion.div variants={itemVariants} className="flex gap-4 items-start p-4 hover:translate-y-[-2px] transition-transform">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <FiTruck className="w-5.5 h-5.5" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-slate-100">Free Delivery</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">Get free delivery on orders above ₹199 inside city limits.</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex gap-4 items-start p-4 hover:translate-y-[-2px] transition-transform">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <FiShield className="w-5.5 h-5.5" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-slate-100">Secure Payments</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">Fully integrated payments via Stripe, Razorpay cards, UPI, and COD.</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex gap-4 items-start p-4 hover:translate-y-[-2px] transition-transform">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <FiPhoneCall className="w-5.5 h-5.5" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-slate-100">Premium Support</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">Need help? Chat with our customer success agents instantly.</p>
          </div>
        </motion.div>
      </motion.section>

      {/* 6. Customer Reviews Testimonial */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="space-y-8"
      >
        <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white text-center">Loved by Thousands</h2>
        
        {/* Swipeable snap-scroll cards */}
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 gap-6 snap-x snap-mandatory hide-scrollbar">
          {testimonials.map((testimonial, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="snap-center flex-shrink-0 w-[85vw] sm:w-auto bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-[28px] p-8 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array(testimonial.rating).fill(0).map((_, i) => (
                  <FiStar key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs sm:text-sm italic font-medium leading-relaxed text-slate-605 dark:text-slate-300 flex-1 mb-6 text-left">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3 mt-auto border-t border-slate-100 dark:border-slate-850 pt-4 text-left">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-9 h-9 rounded-full object-cover shadow-sm bg-slate-100" />
                <div>
                  <div className="font-display font-extrabold text-xs text-slate-900 dark:text-slate-100">
                    {testimonial.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Verified Buyer</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

    </main>
  );
}
