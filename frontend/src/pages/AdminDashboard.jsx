import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiGrid, 
  FiPackage, 
  FiShoppingBag, 
  FiUsers, 
  FiTruck, 
  FiTrendingUp, 
  FiAlertCircle, 
  FiDollarSign, 
  FiPlus, 
  FiTrash2, 
  FiSearch, 
  FiX, 
  FiMenu, 
  FiSun, 
  FiMoon,
  FiHome
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const { apiBase } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Sidebar controls
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Vegetables');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductOriginalPrice, setNewProductOriginalPrice] = useState('');
  const [newProductBadge, setNewProductBadge] = useState('');
  const [newProductImage, setNewProductImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`${apiBase}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, [apiBase]);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${apiBase}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, [apiBase]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchProducts();
      fetchOrders();
    });
  }, [fetchProducts, fetchOrders]);

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!newProductName.trim() || !newProductPrice || !newProductCategory) {
      showToast("Product Name, Category, and Price are required.", "error");
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newProductName.trim());
      formData.append('category', newProductCategory);
      formData.append('price', Number(newProductPrice));
      
      if (newProductOriginalPrice) {
        formData.append('originalPrice', Number(newProductOriginalPrice));
      }
      if (newProductBadge) {
        formData.append('badge', newProductBadge);
      }
      if (newProductImage) {
        formData.append('image', newProductImage);
      }

      const res = await fetch(`${apiBase}/api/products/add`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Successfully added product: "${newProductName}"!`, "success");
        setIsAddModalOpen(false);
        
        // Reset form
        setNewProductName('');
        setNewProductCategory('Vegetables');
        setNewProductPrice('');
        setNewProductOriginalPrice('');
        setNewProductBadge('');
        setNewProductImage(null);
        
        // Reload products list
        fetchProducts();
      } else {
        showToast(data.message || "Failed to add product.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error uploading product.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${apiBase}/api/products/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok) {
        showToast("Product deleted successfully!", "success");
        setProducts(prev => prev.filter(p => (p.id || p._id) !== id));
      } else {
        showToast(data.message || "Failed to delete product.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Connection error deleting product.", "error");
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${apiBase}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showToast(`Order status updated to ${newStatus}`, "success");
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error updating status", "error");
    }
  };

  // Derived Metrics
  const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status === 'Processing' || o.status === 'Out for Delivery' || !o.status).length;
  const outOfStockCount = products.filter(p => p.price <= 0).length;

  // Filter lists based on search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (o.email && o.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Mock platform users derived from orders & default list
  const mockUsers = [
    { id: 1, name: 'Aarav Sharma', email: 'aarav@gmail.com', orders: 12, spent: 4850, verified: true },
    { id: 2, name: 'Priya Patel', email: 'priya@gmail.com', orders: 8, spent: 3120, verified: true },
    { id: 3, name: 'Shubham Verma', email: 'shubhamverma8299@gmail.com', orders: 4, spent: 1850, verified: true }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* 1. Collapsible Admin Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 p-6 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Logo */}
        <div className="flex justify-between items-center mb-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
              <FiShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-emerald-500">
              FreshCart
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Menu Links */}
        <nav className="flex-1 space-y-1.5 text-left">
          {[
            { id: 'dashboard', label: 'Overview', icon: FiGrid },
            { id: 'products', label: 'Products Catalog', icon: FiPackage },
            { id: 'orders', label: 'Order Requests', icon: FiShoppingBag },
            { id: 'customers', label: 'User Directory', icon: FiUsers },
            { id: 'delivery', label: 'Delivery Maps', icon: FiTruck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-emerald-500/10' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800 pt-6 space-y-3.5">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between text-slate-450 hover:text-white text-xs font-semibold cursor-pointer"
          >
            <span>Appearance Mode</span>
            {theme === 'dark' ? <FiSun className="w-4.5 h-4.5 text-amber-500" /> : <FiMoon className="w-4.5 h-4.5 text-slate-400" />}
          </button>
          <Link to="/" className="flex items-center gap-2 text-xs font-bold text-slate-450 hover:text-white transition-colors">
            <FiHome className="w-4 h-4" /> Back to Storefront
          </Link>
        </div>

      </aside>

      {/* 2. Main Panel */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-350 focus:outline-none">
              <FiMenu className="w-6.5 h-6.5" />
            </button>
            <h1 className="font-display font-black text-2xl text-slate-850 dark:text-white capitalize">
              Admin {activeTab}
            </h1>
          </div>

          {/* Search bar inside admin */}
          <div className="relative group w-48 sm:w-64">
            <input 
              type="text" 
              placeholder="Search catalog/orders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary text-xs font-semibold"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>
        </header>

        {/* Inner Content Area */}
        <main className="flex-1 p-6 sm:p-8 space-y-8">
          
          {/* TAB: OVERVIEW / DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: `₹${totalSales}`, trend: '+12.5%', color: 'from-emerald-500/10 to-teal-500/5 text-emerald-600', icon: FiDollarSign },
                  { label: 'Total Orders', value: orders.length, trend: '+8.4%', color: 'from-blue-500/10 to-indigo-500/5 text-blue-600', icon: FiShoppingBag },
                  { label: 'Inventory Items', value: products.length, trend: 'Updated', color: 'from-amber-500/10 to-yellow-500/5 text-amber-600', icon: FiPackage },
                  { label: 'Active Deliveries', value: activeOrdersCount, trend: 'Realtime', color: 'from-purple-500/10 to-pink-500/5 text-purple-600', icon: FiTruck }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm text-left flex items-center justify-between">
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                        <div className="font-display font-black text-2xl text-slate-850 dark:text-white">{stat.value}</div>
                        <span className="inline-block text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 px-2 py-0.5 rounded-full">{stat.trend}</span>
                      </div>
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5.5 h-5.5" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts area */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* SVG Sales Line Chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-left">
                  <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <FiTrendingUp className="text-primary w-4.5 h-4.5" /> Sales Performance
                  </h3>
                  
                  {/* SVG Chart Drawing */}
                  <div className="h-60 w-full relative">
                    <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
                      <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
                      
                      {/* Line graph path */}
                      <path 
                        d="M 0 170 C 80 140, 120 180, 200 110 C 280 80, 320 130, 400 60 L 500 40" 
                        fill="none" 
                        stroke="#10B981" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                      />
                      {/* Gradient fill */}
                      <path 
                        d="M 0 170 C 80 140, 120 180, 200 110 C 280 80, 320 130, 400 60 L 500 40 L 500 200 L 0 200 Z" 
                        fill="url(#chartGradient)"
                      />
                    </svg>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-4 px-2">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>

                {/* Categories Bar Distribution */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-left">
                  <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <FiPackage className="text-primary w-4.5 h-4.5" /> Category Share
                  </h3>
                  
                  <div className="space-y-4 pt-2">
                    {[
                      { name: 'Vegetables & Fruits', percent: '42%', width: 'w-[42%]', color: 'bg-emerald-500' },
                      { name: 'Dairy & Drinks', percent: '28%', width: 'w-[28%]', color: 'bg-blue-500' },
                      { name: 'Snacks & Bakery', percent: '20%', width: 'w-[20%]', color: 'bg-amber-500' },
                      { name: 'Others', percent: '10%', width: 'w-[10%]', color: 'bg-purple-500' }
                    ].map((cat, i) => (
                      <div key={i} className="space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between text-slate-600 dark:text-slate-350">
                          <span>{cat.name}</span>
                          <strong className="text-slate-850 dark:text-slate-200">{cat.percent}</strong>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div className={`${cat.color} h-full ${cat.width} rounded-full`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[32px] shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
                <h3 className="font-display font-extrabold text-lg text-slate-850 dark:text-white">Active Catalog ({filteredProducts.length})</h3>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-5 py-3 rounded-2xl cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {loadingProducts ? (
                <div className="text-center py-10 text-slate-400">Loading catalog...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No items found matching the search.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800/80">
                        <th className="py-4 text-xs font-bold text-slate-400 uppercase pr-4">Image</th>
                        <th className="py-4 text-xs font-bold text-slate-400 uppercase pr-4">Item Name</th>
                        <th className="py-4 text-xs font-bold text-slate-400 uppercase pr-4">Category</th>
                        <th className="py-4 text-xs font-bold text-slate-400 uppercase pr-4">Price</th>
                        <th className="py-4 text-xs font-bold text-slate-400 uppercase pr-4">Original Price</th>
                        <th className="py-4 text-xs font-bold text-slate-400 uppercase pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                      {filteredProducts.map((p) => {
                        const pid = p.id || p._id;
                        return (
                          <tr key={pid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-4 pr-4">
                              <img src={p.image} alt="" className="w-10 h-10 object-contain rounded-lg bg-white border p-0.5" />
                            </td>
                            <td className="py-4 pr-4 font-bold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">{p.name}</td>
                            <td className="py-4 pr-4 text-xs font-semibold">{p.category}</td>
                            <td className="py-4 pr-4 font-bold text-slate-800 dark:text-slate-100">₹{p.price}</td>
                            <td className="py-4 pr-4 text-slate-400 line-through">₹{p.originalPrice || p.price}</td>
                            <td className="py-4">
                              <button 
                                onClick={() => handleDeleteProduct(pid)}
                                className="text-red-400 hover:text-red-650 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                              >
                                <FiTrash2 className="w-4.5 h-4.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: ORDER REQUESTS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[32px] shadow-sm">
              <h3 className="font-display font-extrabold text-lg text-slate-850 dark:text-white pb-4 border-b border-slate-100 dark:border-slate-850 text-left">
                Manage Orders ({filteredOrders.length})
              </h3>

              {loadingOrders ? (
                <div className="text-center py-10 text-slate-400">Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No order logs found.</div>
              ) : (
                <div className="space-y-5">
                  {filteredOrders.map((order) => (
                    <div key={order._id || order.orderId} className="border border-slate-150 dark:border-slate-800 rounded-3xl p-5 text-left space-y-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                      <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <strong className="text-sm font-bold text-slate-800 dark:text-slate-100">Order ID: #{order.orderId}</strong>
                          <span className="text-xs text-slate-400 block mt-0.5">{order.email}</span>
                        </div>
                        {/* Status Select dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">Status:</span>
                          <select 
                            value={order.status || 'Pending'}
                            onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold focus:outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-slate-550 dark:text-slate-450 font-semibold">
                            <span>{item.name} <span className="text-slate-400 font-medium">x {item.quantity}</span></span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="text-slate-450 font-semibold max-w-sm truncate">
                          <strong>Address:</strong> {order.shippingAddress}
                        </div>
                        <div className="font-display font-extrabold text-base text-slate-800 dark:text-slate-150 self-end">
                          Total Amount: ₹{order.totalPrice}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: CUSTOMERS DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="space-y-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[32px] shadow-sm">
              <h3 className="font-display font-extrabold text-lg text-slate-850 dark:text-white pb-4 border-b border-slate-100 dark:border-slate-850 text-left">
                Active Platform Users
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="py-4 text-xs font-bold text-slate-400 uppercase pr-4">User Details</th>
                      <th className="py-4 text-xs font-bold text-slate-400 uppercase pr-4">Orders Placed</th>
                      <th className="py-4 text-xs font-bold text-slate-400 uppercase pr-4">Total Spent</th>
                      <th className="py-4 text-xs font-bold text-slate-400 uppercase pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-650 dark:text-slate-350 text-sm">
                    {mockUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-4 pr-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{u.name}</div>
                          <span className="text-xs text-slate-400">{u.email}</span>
                        </td>
                        <td className="py-4 pr-4 font-semibold">{u.orders} orders</td>
                        <td className="py-4 pr-4 font-bold text-slate-800 dark:text-slate-100">₹{u.spent}</td>
                        <td className="py-4 pr-4">
                          <span className="text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DELIVERY TRACKING MAP */}
          {activeTab === 'delivery' && (
            <div className="space-y-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[32px] shadow-sm text-left">
              <h3 className="font-display font-extrabold text-lg text-slate-850 dark:text-white pb-2">Active Deliveries Routing</h3>
              <p className="text-slate-450 text-sm">Real-time GPS tracking and path optimization logs for active deliveries in progress.</p>
              
              <div className="aspect-video w-full max-h-96 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center relative">
                <div className="text-center space-y-2">
                  <FiTruck className="w-12 h-12 text-primary mx-auto animate-bounce" />
                  <span className="font-display font-extrabold text-slate-700 dark:text-slate-350 block">GPS Delivery Mapping Active</span>
                  <span className="text-xs text-slate-450 block">Open tracking page via track order menu to see maps in action.</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. Framer Motion Add Product Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[9998] cursor-pointer"
            />
            {/* Modal Card Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="fixed inset-x-4 top-20 sm:mx-auto max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[32px] p-6 sm:p-8 z-[9999] text-left overflow-y-auto max-h-[85vh]"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850 mb-6">
                <h2 className="font-display font-extrabold text-xl text-slate-850 dark:text-white">Add New Product</h2>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Product Name</label>
                  <input 
                    type="text" 
                    placeholder="Fresh Coriander Leaves"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Category</label>
                    <select 
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none"
                    >
                      {['Vegetables', 'Fruits', 'Dairy & Eggs', 'Bakery', 'Beverages', 'Snacks'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Price (₹)</label>
                    <input 
                      type="number" 
                      placeholder="15"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Original Price (Optional)</label>
                    <input 
                      type="number" 
                      placeholder="25"
                      value={newProductOriginalPrice}
                      onChange={(e) => setNewProductOriginalPrice(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Badge (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Hot Offer"
                      value={newProductBadge}
                      onChange={(e) => setNewProductBadge(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Product Image (Optional)</label>
                  <input 
                    type="file" 
                    onChange={(e) => setNewProductImage(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-sm shadow-md mt-6 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? "Uploading Product..." : "Create Product"}
                </button>
              </form>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
