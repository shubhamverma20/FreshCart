import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiStar, FiShoppingBag, FiTruck, FiShield, FiHeart, FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi';
import { ProductDetailSkeleton, ProductCardSkeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

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
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);

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
        <button onClick={() => navigate('/products')} className="mt-6 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-full">
          Back to Shop
        </button>
      </main>
    );
  }

  // Filter Related Products (same category, excluding current product)
  const relatedProducts = productsList
    .filter((p) => p.category === product.category && (p.id !== product.id && p._id !== product._id))
    .slice(0, 4);

  const handleAddToCart = () => {
    // Check if item is already in cart, if yes we adjust quantity, else we add multiple
    const cartItem = cart.find(item => (item.id || item._id) === product._id || (item.id || item._id) === product.id);
    if (cartItem) {
      const delta = quantity - cartItem.quantity;
      updateQuantity(product._id || product.id, delta);
    } else {
      // Loop to add multiple
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
    <main className="main-content container px-4 sm:px-6 lg:px-8 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-450 dark:text-slate-500 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <FiChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
        <FiChevronRight className="w-3 h-3" />
        <Link to={`/products?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
        <FiChevronRight className="w-3 h-3" />
        <span className="text-slate-600 dark:text-slate-350 truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main product display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mb-16">
        
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-square rounded-[32px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 flex items-center justify-center shadow-sm relative overflow-hidden group">
            {product.badge && (
              <span className="absolute top-6 left-6 bg-amber-500 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                {product.badge}
              </span>
            )}
            <img 
              src={activeImage} 
              alt={product.name} 
              className="max-h-[300px] object-contain group-hover:scale-105 transition-transform duration-300" 
            />
          </div>
          {/* Thumbnails grid */}
          <div className="grid grid-cols-4 gap-3">
            <button 
              onClick={() => setActiveImage(product.image)}
              className={`aspect-square rounded-2xl bg-white dark:bg-slate-900 border p-2 flex items-center justify-center cursor-pointer transition-all ${activeImage === product.image ? 'border-primary shadow-md' : 'border-slate-100 dark:border-slate-800'}`}
            >
              <img src={product.image} alt="" className="max-h-12 object-contain" />
            </button>
            {/* Mock additionals */}
            {[1, 2, 3].map((num) => (
              <button 
                key={num}
                onClick={() => setActiveImage(product.image)}
                className="aspect-square rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 flex items-center justify-center cursor-pointer transition-all opacity-60 hover:opacity-100"
              >
                <img src={product.image} alt="" className="max-h-12 object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Info Details */}
        <div className="flex flex-col gap-5 justify-center">
          <span className="text-xs font-extrabold text-primary bg-primary/10 dark:bg-primary/20 px-3.5 py-1.5 rounded-full w-fit uppercase tracking-wider">
            {product.category}
          </span>
          
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-850 dark:text-white leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 text-sm font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <FiStar className="w-4 h-4 text-amber-500 fill-amber-500" />
              <strong className="text-base">{product.rating || '4.5'}</strong>
              <span className="text-slate-400">({product.reviews || '50'} reviews)</span>
            </div>
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-emerald-500 dark:text-emerald-450 font-bold">In Stock</span>
          </div>

          <div className="flex items-baseline gap-3 my-2 border-y border-slate-100 dark:border-slate-800/80 py-4">
            <span className="font-display font-extrabold text-3xl text-slate-850 dark:text-white">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-base font-semibold text-slate-400 dark:text-slate-500 line-through">₹{product.originalPrice}</span>
                <span className="text-xs font-extrabold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-md">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pr-4">
            Our premium fresh products are carefully inspected and sourced directly from organic farms to guarantee absolute quality. High nutrition and fresh taste delivered fast.
          </p>

          {/* Quantity selector & buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mt-4">
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-2xl p-1 bg-white dark:bg-slate-900 w-fit self-start">
              <button 
                onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)}
                className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              >
                <FiMinus className="w-4.5 h-4.5" />
              </button>
              <span className="font-display font-extrabold text-base w-10 text-center text-slate-800 dark:text-slate-100">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              >
                <FiPlus className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex-1 flex gap-3">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary font-bold px-6 py-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-primary/20"
              >
                <FiShoppingBag className="w-5 h-5" /> Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-4 rounded-2xl shadow-lg shadow-emerald-500/10 hover:scale-[1.01] transition-all cursor-pointer"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Quick value statements */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-550 dark:text-slate-400">
              <FiTruck className="w-4.5 h-4.5 text-primary" /> Delivery in 10-15 Minutes
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-550 dark:text-slate-400">
              <FiShield className="w-4.5 h-4.5 text-primary" /> 100% Quality Assurance
            </div>
          </div>

        </div>

      </div>

      {/* Product Detail Tabs */}
      <section className="mb-16">
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-6">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold capitalize transition-all relative cursor-pointer ${activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-650'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed text-left">
          {activeTab === 'description' && (
            <div className="space-y-3">
              <p>Experience the finest grade {product.name} sourced directly from farms and delivered in optimal cold storage to preserve taste and nutrition. Our vegetables are washed with clean water and sanitized carefully.</p>
              <p>Store in a cool, dry place. For vegetables, refrigeration is recommended to keep them crisp and crunchy for up to 5 days.</p>
            </div>
          )}
          {activeTab === 'specifications' && (
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 font-semibold text-slate-700 dark:text-slate-350 pr-4">Shelf Life</td>
                  <td className="py-3">3 to 5 Days</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 font-semibold text-slate-700 dark:text-slate-350 pr-4">Packaging Type</td>
                  <td className="py-3">Eco-Friendly Recycled Pouch</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 font-semibold text-slate-700 dark:text-slate-350 pr-4">Sourced From</td>
                  <td className="py-3">Local Indian Organic Farms</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-700 dark:text-slate-350 pr-4">Brand</td>
                  <td className="py-3">FreshCart Organic Essentials</td>
                </tr>
              </tbody>
            </table>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="text-center">
                  <div className="text-4xl font-display font-extrabold text-slate-850 dark:text-white">{product.rating || '4.5'}</div>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <FiStar key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <div className="text-xs text-slate-400 mt-1.5">Based on {product.reviews || '50'} ratings</div>
                </div>
                <div className="w-[1px] h-16 bg-slate-100 dark:bg-slate-800"></div>
                <div className="flex-1 text-xs font-semibold space-y-1.5 max-w-xs">
                  <div className="flex items-center gap-2">
                    <span>5 ★</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[80%]"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>4 ★</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[15%]"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>3 ★</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[5%]"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Rohit M.</span>
                    <span className="text-xs text-slate-450">2 days ago</span>
                  </div>
                  <div className="flex gap-0.5 mb-1.5"><FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /></div>
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">Excellent fresh quality. Extremely fast packaging and deliveries. Highly satisfied.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-display font-extrabold text-slate-850 dark:text-white mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id || p._id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col relative text-left">
                <Link to={`/products/${p.id || p._id}`} className="block">
                  <img src={p.image} alt={p.name} className="w-full h-40 object-contain mb-4" />
                </Link>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {p.category}
                </span>
                <Link to={`/products/${p.id || p._id}`} className="font-display font-bold text-base text-slate-800 dark:text-slate-100 hover:text-primary transition-colors line-clamp-1 mt-1">
                  {p.name}
                </Link>
                <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{p.rating || '4.5'}</span>
                  <span>({p.reviews || '50'})</span>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <div className="font-display font-extrabold text-xl text-slate-800 dark:text-slate-100">
                    ₹{p.price}
                  </div>
                  <button 
                    onClick={() => { addToCart(p); showToast(`${p.name} added to cart!`, 'success'); }}
                    className="bg-primary hover:bg-primary-hover text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
