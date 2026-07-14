import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiStar, FiShoppingBag, FiTruck, FiShield, FiMinus, FiPlus, FiChevronDown, FiHeart, FiCreditCard } from 'react-icons/fi';
import { ProductDetailSkeleton } from '../components/Skeleton';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, cart } = useCart();
  const { apiBase } = useAuth();
  const { showToast } = useToast();

  // States
  const [product, setProduct] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const prodId = product?.id || product?._id;

  // Persist Wishlist state
  useEffect(() => {
    if (!prodId) return;
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const inWish = wishlist.some(item => (item.id || item._id) === prodId);
    setIsWishlisted(inWish);
  }, [prodId]);

  // Fetch Product details & related
  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/products`);
        if (res.ok) {
          const data = await res.json();
          setProductsList(data);
          const found = data.find((p) => p.id?.toString() === id || p._id?.toString() === id);
          if (found) {
            setProduct(found);
            setActiveImage(found.image);
            
            // Check if item is already in cart to sync quantity
            const cartItem = cart.find(item => (item.id || item._id) === found._id || (item.id || item._id) === found.id);
            if (cartItem) {
              setQuantity(cartItem.quantity);
            } else {
              setQuantity(1);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching details:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id, apiBase, cart]);

  if (loading) {
    return (
      <main className="main-content container px-4 sm:px-6 lg:px-8">
        <ProductDetailSkeleton />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="main-content container px-4 sm:px-6 lg:px-8 text-center py-20">
        <span className="text-5xl">🚫</span>
        <h2 className="font-display font-extrabold text-2xl text-slate-800 dark:text-white mt-4">Product Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">The product you are trying to view does not exist or has been removed.</p>
        <Button onClick={() => navigate('/products')} variant="primary" size="md" className="mt-6">
          Back to Shop
        </Button>
      </main>
    );
  }

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const inWish = wishlist.some(item => (item.id || item._id) === prodId);
    
    if (inWish) {
      wishlist = wishlist.filter(item => (item.id || item._id) !== prodId);
      setIsWishlisted(false);
      showToast(`Removed ${product.name} from wishlist.`, 'info');
    } else {
      wishlist.push(product);
      setIsWishlisted(true);
      showToast(`Added ${product.name} to wishlist! ❤️`, 'success');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlist-update'));
  };

  // Filter Related Products
  const relatedProducts = productsList
    .filter((p) => p.category === product.category && (p.id !== product.id && p._id !== product._id))
    .slice(0, 4);

  const handleAddToCart = () => {
    const cartItem = cart.find(item => (item.id || item._id) === product._id || (item.id || item._id) === product.id);
    if (cartItem) {
      const delta = quantity - cartItem.quantity;
      updateQuantity(product._id || product.id, delta);
    } else {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <main className="main-content container px-4 sm:px-6 lg:px-8 text-left pb-20 lg:pb-8">
      {/* Breadcrumbs */}
      <Breadcrumb 
        paths={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/products' },
          { label: product.category, to: `/products?category=${encodeURIComponent(product.category)}` },
          { label: product.name, to: '#' }
        ]} 
      />

      {/* Main product display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mb-16 mt-2">
        
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-square rounded-[32px] bg-white dark:bg-slate-900 border border-slate-205/60 dark:border-slate-800 p-8 flex items-center justify-center shadow-sm relative overflow-hidden group">
            {product.badge && (
              <span className="absolute top-6 left-6 bg-amber-500 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider z-10 shadow-sm">
                {product.badge}
              </span>
            )}
            
            {/* Wishlist Button */}
            <button 
              onClick={toggleWishlist}
              className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/80 flex items-center justify-center shadow-sm cursor-pointer hover:scale-108 active:scale-95 transition-transform text-slate-450"
              aria-label="Add to wishlist"
            >
              <FiHeart className={`w-5 h-5 transition-colors duration-250 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-slate-400 dark:text-slate-500'}`} />
            </button>

            <img 
              src={activeImage} 
              alt={product.name} 
              className="max-h-[300px] object-contain group-hover:scale-[1.03] transition-transform duration-300" 
            />
          </div>
          {/* Thumbnails grid */}
          <div className="grid grid-cols-4 gap-3">
            <button 
              onClick={() => setActiveImage(product.image)}
              className={`aspect-square rounded-2xl bg-white dark:bg-slate-900 border p-2.5 flex items-center justify-center cursor-pointer transition-all ${activeImage === product.image ? 'border-primary shadow-sm' : 'border-slate-200/50 dark:border-slate-800'}`}
            >
              <img src={product.image} alt="" className="max-h-12 object-contain" />
            </button>
            {/* Mock additionals */}
            {[1, 2, 3].map((num) => (
              <button 
                key={num}
                onClick={() => setActiveImage(product.image)}
                className="aspect-square rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-2.5 flex items-center justify-center cursor-pointer transition-all opacity-60 hover:opacity-100"
              >
                <img src={product.image} alt="" className="max-h-12 object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Info Details */}
        <div className="flex flex-col gap-4.5 justify-center">
          <span className="text-[10px] font-extrabold text-primary bg-primary/10 dark:bg-primary/20 px-3.5 py-1.5 rounded-full w-fit uppercase tracking-wider">
            {product.category}
          </span>
          
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-305">
              <FiStar className="w-4 h-4 text-amber-500 fill-amber-500" />
              <strong className="text-sm font-extrabold">{product.rating || '4.5'}</strong>
              <span className="text-slate-400 font-semibold">({product.reviews || '50'} reviews)</span>
            </div>
            <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-emerald-500 dark:text-emerald-450">In Stock</span>
          </div>

          <div className="flex items-baseline gap-3 my-1.5 border-y border-slate-100 dark:border-slate-800/80 py-4.5">
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 line-through">₹{product.originalPrice}</span>
                <span className="text-[10px] font-extrabold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-md">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Inline Description */}
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pr-4">
            <p>Experience the finest grade {product.name} sourced directly from farms and delivered in optimal cold storage to preserve taste and nutrition. Our products are thoroughly inspected for quality.</p>
          </div>

          {/* Quantity selector & buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mt-3">
            <div className="flex items-center border border-slate-200 dark:border-slate-750 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-900 w-fit self-start shadow-sm">
              <button 
                onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)}
                className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-405 transition-colors cursor-pointer"
              >
                <FiMinus className="w-4 h-4" />
              </button>
              <span className="font-display font-extrabold text-sm w-9 text-center text-slate-800 dark:text-slate-100">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-405 transition-colors cursor-pointer"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex gap-3">
              <Button 
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="flex-1 bg-transparent hover:bg-slate-50 border-slate-250 font-bold text-xs"
              >
                <FiShoppingBag className="w-4.5 h-4.5 mr-1.5" /> Add to Cart
              </Button>
              <Button 
                onClick={handleBuyNow}
                variant="primary"
                size="lg"
                className="flex-1 font-bold text-xs"
              >
                <FiCreditCard className="w-4.5 h-4.5 mr-1.5" /> Buy Now
              </Button>
            </div>
          </div>

          {/* Quick value statements */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <FiTruck className="w-4 h-4 text-primary" /> Delivery in 10-15 Minutes
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <FiShield className="w-4 h-4 text-primary" /> 100% Quality Assurance
            </div>
          </div>
          
          {/* Collapsible Specifications Accordion */}
          <div className="mt-3 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 shadow-sm">
            <button 
              onClick={() => setIsSpecsOpen(!isSpecsOpen)}
              className="w-full flex justify-between items-center p-3.5 text-xs font-bold text-slate-800 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Specifications
              <motion.div animate={{ rotate: isSpecsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <FiChevronDown className="w-4 h-4 text-slate-500" />
              </motion.div>
            </button>
            <AnimatePresence>
              {isSpecsOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs text-slate-550 dark:text-slate-400">
                      <tbody>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-2 font-bold text-slate-750 dark:text-slate-350 pr-4">Shelf Life</td>
                          <td className="py-2">3 to 5 Days</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-2 font-bold text-slate-750 dark:text-slate-350 pr-4">Packaging</td>
                          <td className="py-2">Eco-Friendly Pouch</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-slate-750 dark:text-slate-350 pr-4">Origin</td>
                          <td className="py-2">Local Farms</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <section className="mb-16 space-y-6">
        <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-4">Ratings & Reviews</h2>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-205/65 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Overall Rating and Bar Chart */}
            <div className="flex flex-col sm:flex-row items-center gap-8 md:w-1/2 md:border-r border-slate-100 dark:border-slate-800/80 pr-8">
              <div className="text-center min-w-[120px]">
                <div className="text-4xl font-display font-extrabold text-slate-900 dark:text-white">{product.rating || '4.5'}</div>
                <div className="flex gap-0.5 justify-center mt-2">
                  {Array(5).fill(0).map((_, i) => (
                    <FiStar key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-2.5">Based on {product.reviews || '50'} reviews</div>
              </div>
              
              <div className="flex-1 w-full text-[10px] font-bold space-y-2">
                {[
                  { stars: 5, width: '80%' },
                  { stars: 4, width: '15%' },
                  { stars: 3, width: '5%' },
                  { stars: 2, width: '0%' },
                  { stars: 1, width: '0%' },
                ].map((row) => (
                  <div key={row.stars} className="flex items-center gap-3">
                    <span className="w-8 text-right text-slate-500 dark:text-slate-400">{row.stars} ★</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: row.width }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-primary h-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Written Reviews */}
            <div className="md:w-1/2 space-y-4">
              <div className="p-5 bg-slate-50/50 dark:bg-slate-850/30 border border-slate-150/70 dark:border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-205 text-xs">Rohit M.</span>
                  <span className="text-[10px] font-bold text-slate-400">2 days ago</span>
                </div>
                <div className="flex gap-0.5 mb-2.5">
                  {Array(5).fill(0).map((_, i) => <FiStar key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />)}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">Excellent fresh quality. Extremely fast packaging and deliveries. Highly satisfied.</p>
              </div>
              <div className="p-5 bg-slate-50/50 dark:bg-slate-850/30 border border-slate-150/70 dark:border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-205 text-xs">Aisha K.</span>
                  <span className="text-[10px] font-bold text-slate-400">1 week ago</span>
                </div>
                <div className="flex gap-0.5 mb-2.5">
                  {Array(4).fill(0).map((_, i) => <FiStar key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />)}
                  <FiStar className="w-3.5 h-3.5 text-slate-200 dark:text-slate-700" />
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">The product is very fresh and well-packed. Giving 4 stars because delivery took a few minutes longer than expected.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mb-12 space-y-6">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} layout="grid" />
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
