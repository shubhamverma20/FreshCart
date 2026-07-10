import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { 
  FiUser, 
  FiPackage, 
  FiHeart, 
  FiMapPin, 
  FiSettings, 
  FiLogOut, 
  FiEdit, 
  FiPlus, 
  FiTrash2, 
  FiShoppingBag,
  FiChevronRight
} from 'react-icons/fi';
import { OrderCardSkeleton } from '../components/Skeleton';

export default function Dashboard() {
  const { user, logout, apiBase } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');

  // Dashboard Data States
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [wishlist, setWishlist] = useState([
    { id: 1, name: "Fresh Organic Bananas", category: "Fruits", price: 80, originalPrice: 100, image: "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/bananas.png" },
    { id: 4, name: "Amul Pure Milk (1L)", category: "Dairy & Eggs", price: 66, originalPrice: 66, image: "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/milk.png" }
  ]);
  const [addresses, setAddresses] = useState([
    { id: 1, type: 'Home', name: 'Shubham Verma', phone: '9876543210', flat: 'Flat 401, Green Meadows', pin: '400001' }
  ]);

  // Edit Profile States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully.", "info");
    navigate('/');
  };

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await fetch(`${apiBase}/api/orders`);
        if (res.ok) {
          const data = await res.json();
          // Filter orders relating to current user
          const userEmail = user?.email;
          const userOrders = data.filter(order => order.email === userEmail);
          setOrders(userOrders);
        }
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    if (user?.email) {
      fetchOrders();
    }
  }, [user, apiBase]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    showToast("Profile updated successfully!", "success");
  };

  const handleRemoveWishlist = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
    showToast("Item removed from wishlist.", "info");
  };

  const handleAddWishlistToCart = (item) => {
    addToCart(item);
    showToast(`${item.name} added to cart!`, "success");
  };

  const handleAddAddress = () => {
    const newAddr = {
      id: Date.now(),
      type: 'Work',
      name: name || 'Shubham Verma',
      phone: phone || '9876543210',
      flat: 'Building 12, Tech Park',
      pin: '400099'
    };
    setAddresses([...addresses, newAddr]);
    showToast("New address added!", "success");
  };

  const handleRemoveAddress = (id) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    showToast("Address deleted.", "info");
  };

  return (
    <main className="main-content container px-4 sm:px-6 lg:px-8 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-450 dark:text-slate-500 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <FiChevronRight className="w-3 h-3" />
        <span className="text-slate-600 dark:text-slate-350">My Account</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Menu */}
        <aside className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm h-fit">
          <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800/80 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white font-display font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-3">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <h3 className="font-display font-extrabold text-lg text-slate-850 dark:text-white leading-tight">
              {user?.name || 'User'}
            </h3>
            <span className="text-xs font-semibold text-slate-400 mt-1">{user?.email}</span>
            {user?.provider && (
              <span className="mt-2.5 text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-full">
                Logged in via {user.provider}
              </span>
            )}
          </div>

          <nav className="space-y-1">
            {[
              { id: 'orders', label: 'My Orders', icon: FiPackage },
              { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
              { id: 'addresses', label: 'Saved Addresses', icon: FiMapPin },
              { id: 'profile', label: 'Profile Details', icon: FiUser },
              { id: 'settings', label: 'Account Settings', icon: FiSettings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer mt-4"
            >
              <FiLogOut className="w-4.5 h-4.5" />
              Logout
            </button>
          </nav>
        </aside>

        {/* Right Dashboard Area */}
        <section className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-[32px] shadow-sm min-h-[480px]">
            
            {/* Tab: Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="font-display font-extrabold text-xl text-slate-850 dark:text-white">Order History</h2>
                
                {loadingOrders ? (
                  <div className="space-y-4">
                    <OrderCardSkeleton />
                    <OrderCardSkeleton />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-5xl">📦</span>
                    <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-150 mt-4">No orders placed yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xs mx-auto">
                      Explore our fresh collections and make your first purchase!
                    </p>
                    <button onClick={() => navigate('/products')} className="mt-6 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-3 rounded-full">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id || order.orderId} className="border border-slate-150 dark:border-slate-800 rounded-3xl p-5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                        <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="text-xs font-semibold text-slate-400 block">Order ID</span>
                            <strong className="text-sm font-extrabold text-slate-800 dark:text-slate-200">#{order.orderId}</strong>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-slate-400 block">Date</span>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-350">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Items listed */}
                        <div className="py-4 space-y-3.5">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-450">
                              <span className="text-slate-800 dark:text-slate-200 font-bold">{item.name} <span className="text-slate-400 font-medium">x {item.quantity}</span></span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                            <span className="text-xs text-emerald-600 dark:text-emerald-450 font-bold capitalize">{order.status || 'Delivered'}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 font-bold mr-1">Paid:</span>
                            <strong className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100">₹{order.totalPrice}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Wishlist */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <h2 className="font-display font-extrabold text-xl text-slate-850 dark:text-white">My Wishlist</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-5xl">❤️</span>
                    <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-150 mt-4">Wishlist is empty</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Like some items to save them here for later purchase.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border border-slate-150 dark:border-slate-800 rounded-2xl items-center">
                        <img src={item.image} alt="" className="w-14 h-14 object-contain rounded-xl" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{item.name}</h4>
                          <span className="text-xs text-primary font-bold">₹{item.price}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAddWishlistToCart(item)}
                            className="bg-primary hover:bg-primary-hover text-white p-2 rounded-xl cursor-pointer"
                          >
                            <FiShoppingBag className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRemoveWishlist(item.id)}
                            className="text-red-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-xl cursor-pointer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Saved Addresses */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-display font-extrabold text-xl text-slate-850 dark:text-white">Saved Addresses</h2>
                  <button 
                    onClick={handleAddAddress}
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    <FiPlus className="w-4 h-4" /> Add Address
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-5 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col gap-3 relative hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-md text-slate-500 uppercase tracking-wider">
                          {addr.type}
                        </span>
                        <button 
                          onClick={() => handleRemoveAddress(addr.id)}
                          className="text-red-400 hover:text-red-650 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                        >
                          <FiTrash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                      <div className="space-y-1 text-xs font-semibold text-slate-500">
                        <strong className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1">{addr.name}</strong>
                        <p className="text-slate-450">{addr.flat}</p>
                        <p>Pin: {addr.pin}</p>
                        <p>Ph: {addr.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="font-display font-extrabold text-xl text-slate-850 dark:text-white">Profile Details</h2>
                <form className="max-w-md space-y-4" onSubmit={handleUpdateProfile}>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-750 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-850 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Email Address (Read-Only)</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-400 dark:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-750 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-850 dark:text-slate-200"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white py-3.5 px-8 rounded-2xl font-bold text-sm transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="font-display font-extrabold text-xl text-slate-850 dark:text-white">Account Settings</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border border-slate-150 dark:border-slate-800 rounded-2xl">
                    <div className="text-left flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Email Notifications</span>
                      <span className="text-xs text-slate-400">Receive order receipts and coupon promotions</span>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-primary w-4.5 h-4.5 cursor-pointer" />
                  </div>
                  <div className="flex justify-between items-center p-4 border border-slate-150 dark:border-slate-800 rounded-2xl">
                    <div className="text-left flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">SMS Alerts</span>
                      <span className="text-xs text-slate-400">Get tracking updates on mobile phone</span>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-primary w-4.5 h-4.5 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

      </div>
    </main>
  );
}
