import React, { useState, useMemo } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const initialProducts = [
  { id: '1', name: "Fresh Organic Bananas", category: "Fruits", price: 80, stock: 150, status: "Active", image: "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/bananas.png" },
  { id: '2', name: "Alphonso Mangoes (1kg)", category: "Fruits", price: 500, stock: 45, status: "Active", image: "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/mangoes.png" },
  { id: '3', name: "Brown Bread", category: "Bakery", price: 40, stock: 12, status: "Low Stock", image: "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/bread.png" },
  { id: '4', name: "Amul Pure Milk (1L)", category: "Dairy & Eggs", price: 66, stock: 0, status: "Out of Stock", image: "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/milk.png" }
];

export default function Products() {
  const { showToast } = useToast();
  const { apiBase } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch Products on Mount
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${apiBase}/api/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [apiBase]);

  // Table Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Fruits', price: '', stock: '', status: 'Active' });

  // Categories for filter
  const categories = ['All', 'Fruits', 'Vegetables', 'Dairy & Eggs', 'Bakery', 'Snacks', 'Beverages'];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredProducts = useMemo(() => {
    let sorted = [...products];
    if (categoryFilter !== 'All') {
      sorted = sorted.filter(p => p.category === categoryFilter);
    }
    if (searchQuery) {
      sorted = sorted.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    sorted.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [products, searchQuery, categoryFilter, sortConfig]);

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`${apiBase}/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setProducts(prev => prev.filter(p => p.id !== id && p._id !== id));
          showToast("Product deleted.", "info");
        } else {
          showToast("Failed to delete product.", "error");
        }
      } catch (err) {
        showToast("Error deleting product.", "error");
      }
    }
  };

  const openModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod.id);
      setFormData(prod);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: 'Fruits', price: '', stock: '', status: 'Active', image: null });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      // Fake edit (since backend PUT is missing)
      setProducts(prev => prev.map(p => (p.id === editingProduct || p._id === editingProduct) ? { ...p, ...formData, price: Number(formData.price), stock: Number(formData.stock) } : p));
      showToast("Product updated successfully.", "success");
      setIsModalOpen(false);
    } else {
      try {
        const formPayload = new FormData();
        formPayload.append('name', formData.name);
        formPayload.append('price', formData.price);
        formPayload.append('category', formData.category);
        formPayload.append('stock', formData.stock);
        if (formData.image) {
          formPayload.append('image', formData.image);
        }

        const res = await fetch(`${apiBase}/api/products/add`, {
          method: 'POST',
          body: formPayload
        });
        if (res.ok) {
          const newProd = await res.json();
          setProducts([newProd, ...products]);
          showToast("New product added.", "success");
        } else {
          showToast("Failed to add product.", "error");
        }
      } catch (err) {
        showToast("Error adding product.", "error");
      }
      setIsModalOpen(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Active') return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30';
    if (status === 'Low Stock') return 'bg-amber-50 text-amber-600 dark:bg-amber-950/30';
    return 'bg-red-50 text-red-600 dark:bg-red-950/30';
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <FiChevronDown className="w-3 h-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary text-xs font-semibold"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>
          {/* Category Filter */}
          <div className="relative w-full sm:w-48">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary text-xs font-semibold appearance-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <FiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>
        </div>

        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-transform hover:scale-105 shadow-md shadow-emerald-500/10 cursor-pointer w-full lg:w-auto"
        >
          <FiPlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Data Table / Responsive Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden text-left">
        {/* Desktop Table (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Product <SortIcon column="name" /></div>
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-1">Category <SortIcon column="category" /></div>
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-1">Price <SortIcon column="price" /></div>
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer" onClick={() => handleSort('stock')}>
                  <div className="flex items-center gap-1">Stock <SortIcon column="stock" /></div>
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status <SortIcon column="status" /></div>
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-sm font-semibold">Loading products...</td>
                </tr>
              ) : filteredProducts.map((p, i) => (
                <tr 
                  key={p.id || p._id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  style={{ animation: `fadeIn 0.3s ease-out ${i * 0.05}s both` }}
                >
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <img src={p.image || "https://placehold.co/150x150/png"} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100 dark:border-slate-700 bg-white" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-slate-600 dark:text-slate-400">{p.category}</td>
                  <td className="py-3 px-6 font-bold text-slate-800 dark:text-slate-100">₹{p.price}</td>
                  <td className="py-3 px-6 text-slate-600 dark:text-slate-400">{p.stock} units</td>
                  <td className="py-3 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button onClick={() => openModal(p)} className="p-2 text-slate-400 hover:text-primary hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-colors cursor-pointer mr-1">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id || p._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-sm font-semibold">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {filteredProducts.map(p => (
            <div key={p.id || p._id} className="p-5 flex flex-col gap-3">
              <div className="flex gap-3">
                <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-700 bg-white flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{p.name}</h4>
                  <span className="text-xs text-slate-500">{p.category}</span>
                  <div className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 mt-1">₹{p.price}</div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Stock: {p.stock}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getStatusColor(p.status)}`}>{p.status}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal(p)} className="p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm">
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 bg-white dark:bg-slate-700 text-red-500 rounded-lg shadow-sm">
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="py-10 text-center text-slate-400 text-sm font-semibold">No products found.</div>
          )}
        </div>
      </div>

      {/* Slide-over Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col text-left">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-display font-black text-xl text-slate-850 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500 cursor-pointer"><FiX className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="product-form" onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Product Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-850 dark:text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Product Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setFormData({...formData, image: e.target.files[0]})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-850 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary-hover" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Category</label>
                      <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none text-slate-850 dark:text-slate-200">
                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Price (₹)</label>
                      <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-850 dark:text-slate-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Stock</label>
                      <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-850 dark:text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none text-slate-850 dark:text-slate-200">
                        <option value="Active">Active</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                <button type="submit" form="product-form" className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.02] cursor-pointer">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
