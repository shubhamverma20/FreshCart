import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { apiBase } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  
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

  // Alert Messages
  const [pageAlert, setPageAlert] = useState(null); // { message, type }
  const [modalAlert, setModalAlert] = useState(null);
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
    fetchProducts();
    fetchOrders();
  }, [fetchProducts, fetchOrders]);

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setModalAlert(null);
    setSubmitting(true);

    if (!newProductName.trim() || !newProductPrice || !newProductCategory) {
      setModalAlert({ message: "Product Name, Category, and Price are required.", type: "error" });
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
        setPageAlert({ message: `Successfully added product: "${newProductName}"!`, type: "success" });
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
        setModalAlert({ message: data.message || "Failed to add product. Make sure credentials and file are correct.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setModalAlert({ message: "Network connection error while uploading product.", type: "error" });
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
        setPageAlert({ message: "Product deleted successfully!", type: "success" });
        // Update local state directly or reload
        setProducts(prev => prev.filter(p => (p.id || p._id) !== id));
      } else {
        setPageAlert({ message: data.message || "Failed to delete product.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setPageAlert({ message: "Connection error deleting product.", type: "error" });
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
        setPageAlert({ message: `Order #${orderId} status updated to ${newStatus}`, type: "success" });
        // Update local state without refetching
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
      } else {
        setPageAlert({ message: "Failed to update status", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setPageAlert({ message: "Network error updating status", type: "error" });
    }
  };

  // Auto-dismiss page alert
  useEffect(() => {
    if (pageAlert) {
      const timer = setTimeout(() => setPageAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [pageAlert]);

  // Derived metrics from real data
  const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status === 'Processing' || o.status === 'Out for Delivery' || !o.status).length;
  // Out of stock calculation: products with price less than 20 or count static items that are out of stock (mocked as 8)
  const outOfStockCount = products.filter(p => p.price <= 0).length;

  // Filter lists based on search bar
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (o.email && o.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="admin-layout">
      {/* Page-specific CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-layout {
            display: flex;
            min-height: 100vh;
            background-color: #F1F5F9;
            width: 100%;
        }

        .sidebar {
            width: 260px;
            background: #0F172A;
            color: white;
            padding: 20px;
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            left: 0;
            top: 0;
            z-index: 10;
        }

        .sidebar-logo {
            font-family: 'Outfit';
            font-size: 24px;
            font-weight: 800;
            color: var(--primary-color);
            margin-bottom: 40px;
            display: flex;
            align-items: center;
            gap: 10px;
            text-align: left;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 8px;
            color: #94A3B8;
            margin-bottom: 5px;
            transition: all 0.2s;
            cursor: pointer;
            font-weight: 500;
            text-align: left;
        }

        .nav-item:hover, .nav-item.active {
            background: #1E293B;
            color: white;
        }

        .nav-item.active {
            border-left: 4px solid var(--primary-color);
        }

        .main-panel {
            flex: 1;
            margin-left: 260px;
            padding: 30px 40px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            text-align: left;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            text-align: left;
            border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .stat-title {
            color: var(--text-secondary);
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
        }

        .stat-value {
            font-size: 28px;
            font-weight: 700;
            font-family: 'Outfit';
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .stat-trend {
            font-size: 12px;
            color: var(--primary-color);
            background: rgba(16, 185, 129, 0.1);
            padding: 4px 8px;
            border-radius: 12px;
        }

        .data-table-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            text-align: left;
            padding: 12px 15px;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-weight: 500;
            font-size: 14px;
        }

        td {
            padding: 15px;
            border-bottom: 1px solid #F1F5F9;
            font-size: 14px;
            text-align: left;
            vertical-align: middle;
        }

        .badge-status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        .status-pending { background: #FEF3C7; color: #D97706; }
        .status-ready { background: #E0E7FF; color: #4338CA; }
        .status-delivered { background: #D1FAE5; color: #059669; }

        /* Modal Overlay */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(15, 23, 42, 0.5);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        }

        .modal-card {
            background: white;
            border-radius: 24px;
            padding: 35px;
            width: 100%;
            max-width: 500px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.12);
            border: 1px solid rgba(255,255,255,0.4);
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        /* Form styling */
        .admin-form-group {
            margin-bottom: 18px;
            text-align: left;
        }

        .admin-form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1E293B;
        }

        .admin-form-input {
            width: 100%;
            padding: 12px 14px;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            font-family: 'Inter';
            font-size: 15px;
            box-sizing: border-box;
            background: #F8FAFC;
        }

        .admin-form-input:focus {
            outline: none;
            border-color: var(--primary-color);
            background: white;
        }

        /* Hide Storefront header when in admin view */
        nav.navbar {
            display: none !important;
        }
      `}} />

      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <ion-icon name="basket"></ion-icon> Admin
        </div>
        
        <div 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <ion-icon name="grid-outline"></ion-icon> Dashboard
        </div>
        <div 
          className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <ion-icon name="cube-outline"></ion-icon> Products
        </div>
        <div 
          className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ion-icon name="receipt-outline"></ion-icon> Orders
        </div>
        <div 
          className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <ion-icon name="people-outline"></ion-icon> Customers
        </div>
        <div 
          className={`nav-item ${activeTab === 'delivery' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivery')}
        >
          <ion-icon name="bicycle-outline"></ion-icon> Delivery Team
        </div>
        
        <div style={{ flex: 1 }}></div>
        
        <div className="nav-item" style={{ color: '#F87171' }} onClick={() => navigate('/')}>
          <ion-icon name="log-out-outline"></ion-icon> Logout
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-panel fade-in">
        
        {/* Floating Notification */}
        {pageAlert && (
          <div 
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 999,
              fontWeight: '600',
              border: `1px solid ${pageAlert.type === 'success' ? '#10b981' : '#ef4444'}`,
              background: pageAlert.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: pageAlert.type === 'success' ? '#065f46' : '#991b1b',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {pageAlert.message}
          </div>
        )}

        <div className="header">
          <div>
            <h1 style={{ fontSize: '28px', margin: 0 }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Overview
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0' }}>
              Welcome back, Admin. Here's what's happening today.
            </p>
          </div>
          <div>
            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <ion-icon name="add-outline"></ion-icon> Add Product
            </button>
            <button 
              className="btn-primary" 
              style={{ background: 'white', color: 'black', border: '1px solid #ccc', marginLeft: '10px' }}
              onClick={() => navigate('/')}
            >
              Storefront
            </button>
          </div>
        </div>

        {/* Global Stats bar (Always visible on main dashboard, summaries elsewhere) */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Sales (Today)</div>
            <div className="stat-value">
              ₹{totalSales.toLocaleString()}{' '}
              <span className="stat-trend">
                <ion-icon name="arrow-up"></ion-icon> 12%
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Active Orders</div>
            <div className="stat-value">{activeOrdersCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Products Out of Stock</div>
            <div className="stat-value" style={{ color: '#EF4444' }}>
              {outOfStockCount}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Delivery Boys Online</div>
            <div className="stat-value">15/20</div>
          </div>
        </div>

        {/* Tab content rendering */}
        {activeTab === 'dashboard' && (
          <div className="data-table-card">
            <div className="table-header">
              <h2 style={{ fontSize: '20px', margin: 0 }}>Recent Orders</h2>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search orders..." 
                style={{ maxWidth: '250px', padding: '8px 15px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {loadingOrders ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>No orders found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice(0, 5).map((order) => {
                    const statusClass = 
                      order.status === 'Processing' ? 'status-pending' : 
                      order.status === 'Out for Delivery' ? 'status-ready' : 'status-delivered';
                    return (
                      <tr key={order.orderId}>
                        <td style={{ fontWeight: 600 }}>#{order.orderId}</td>
                        <td>{order.email ? order.email.split('@')[0] : 'Guest User'}</td>
                        <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}</td>
                        <td>₹{order.totalPrice}</td>
                        <td>
                          <span className={`badge-status ${statusClass}`}>{order.status || 'Processing'}</span>
                        </td>
                        <td>
                          <select 
                            value={order.status || 'Processing'} 
                            onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                            style={{ 
                              padding: '5px', 
                              borderRadius: '6px', 
                              border: '1px solid #ccc',
                              fontSize: '12px',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="data-table-card">
            <div className="table-header">
              <h2 style={{ fontSize: '20px', margin: 0 }}>Product Inventory</h2>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search products..." 
                style={{ maxWidth: '250px', padding: '8px 15px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {loadingProducts ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>No products match your search.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Original Price</th>
                    <th>Badge</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const productId = p.id || p._id;
                    return (
                      <tr key={productId}>
                        <td>
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px' }}
                          />
                        </td>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>{p.category}</td>
                        <td>₹{p.price}</td>
                        <td>{p.originalPrice ? `₹${p.originalPrice}` : '-'}</td>
                        <td>
                          {p.badge ? (
                            <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                              {p.badge}
                            </span>
                          ) : '-'}
                        </td>
                        <td>
                          <button 
                            onClick={() => handleDeleteProduct(productId)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="data-table-card">
            <div className="table-header">
              <h2 style={{ fontSize: '20px', margin: 0 }}>All Orders</h2>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search orders..." 
                style={{ maxWidth: '250px', padding: '8px 15px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {loadingOrders ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>No orders found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Email</th>
                    <th>Items Count</th>
                    <th>Payment</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusClass = 
                      order.status === 'Processing' ? 'status-pending' : 
                      order.status === 'Out for Delivery' ? 'status-ready' : 'status-delivered';
                    return (
                      <tr key={order.orderId}>
                        <td style={{ fontWeight: 600 }}>#{order.orderId}</td>
                        <td>{order.email || 'guest@freshcart.com'}</td>
                        <td>{order.items ? order.items.reduce((sum, i) => sum + i.quantity, 0) : 1} items</td>
                        <td style={{ textTransform: 'uppercase' }}>{order.paymentMethod || 'upi'}</td>
                        <td style={{ fontWeight: '600' }}>₹{order.totalPrice}</td>
                        <td>
                          <span className={`badge-status ${statusClass}`}>{order.status || 'Processing'}</span>
                        </td>
                        <td>
                          <select 
                            value={order.status || 'Processing'} 
                            onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                            style={{ 
                              padding: '5px', 
                              borderRadius: '6px', 
                              border: '1px solid #ccc',
                              fontSize: '12px',
                              cursor: 'pointer',
                              outline: 'none',
                              marginRight: '8px'
                            }}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          <button 
                            className="btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => navigate(`/delivery?orderId=${order.orderId}`)}
                          >
                            Track
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="data-table-card">
            <div className="table-header">
              <h2 style={{ fontSize: '20px', margin: 0 }}>Registered Customers</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Rahul Sharma</td>
                  <td>rahul@example.com</td>
                  <td>June 12, 2026</td>
                  <td><span className="badge-status status-delivered">Active</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Priya Patel</td>
                  <td>priya@example.com</td>
                  <td>June 14, 2026</td>
                  <td><span className="badge-status status-delivered">Active</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Amit Kumar</td>
                  <td>amit@example.com</td>
                  <td>June 15, 2026</td>
                  <td><span className="badge-status status-delivered">Active</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Ananya Sen</td>
                  <td>ananya@example.com</td>
                  <td>June 17, 2026</td>
                  <td><span className="badge-status status-delivered">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="data-table-card">
            <div className="table-header">
              <h2 style={{ fontSize: '20px', margin: 0 }}>Delivery Personnel</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Vehicle</th>
                  <th>Active Order</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Vidya shankar</td>
                  <td>⭐ 4.9</td>
                  <td><span className="badge-status status-delivered">Online</span></td>
                  <td>Bicycle</td>
                  <td>#ORD-9824X</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Amit Pal</td>
                  <td>⭐ 4.8</td>
                  <td><span className="badge-status status-delivered">Online</span></td>
                  <td>Motorcycle</td>
                  <td>#ORD-9823X</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Deepak Negi</td>
                  <td>⭐ 4.7</td>
                  <td><span className="badge-status status-pending">Offline</span></td>
                  <td>Scooter</td>
                  <td>None</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Rajesh Kumar</td>
                  <td>⭐ 4.9</td>
                  <td><span className="badge-status status-delivered">Online</span></td>
                  <td>Bicycle</td>
                  <td>None</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* Add Product Modal Overlay */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '22px' }}>Add New Product</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Product Name</label>
                <input 
                  type="text" 
                  className="admin-form-input" 
                  placeholder="e.g. Farm Fresh Carrots"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  required 
                />
              </div>

              <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Category</label>
                  <select 
                    className="admin-form-input"
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Meat">Meat</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Price (₹)</label>
                  <input 
                    type="number" 
                    className="admin-form-input" 
                    placeholder="e.g. 50"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Original Price (₹)</label>
                  <input 
                    type="number" 
                    className="admin-form-input" 
                    placeholder="e.g. 70"
                    value={newProductOriginalPrice}
                    onChange={(e) => setNewProductOriginalPrice(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Badge</label>
                  <select 
                    className="admin-form-input"
                    value={newProductBadge}
                    onChange={(e) => setNewProductBadge(e.target.value)}
                  >
                    <option value="">None</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Fresh Arrival">Fresh Arrival</option>
                    <option value="Offer">Offer</option>
                    <option value="High Demand">High Demand</option>
                    <option value="New">New</option>
                    <option value="Trending">Trending</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="admin-form-input"
                  style={{ padding: '8px 10px', marginBottom: newProductImage ? '10px' : '0' }}
                  onChange={(e) => setNewProductImage(e.target.files[0])}
                />
                {newProductImage && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    background: '#f8fafc', 
                    borderRadius: '8px', 
                    display: 'inline-block',
                    border: '1px dashed #cbd5e1'
                  }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b' }}>Image Preview</p>
                    <img 
                      src={URL.createObjectURL(newProductImage)} 
                      alt="Preview" 
                      style={{ maxHeight: '100px', borderRadius: '4px', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>

              {modalAlert && (
                <div 
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginBottom: '15px',
                    border: `1px solid ${modalAlert.type === 'success' ? '#10b981' : '#ef4444'}`,
                    background: modalAlert.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: modalAlert.type === 'success' ? '#065f46' : '#991b1b',
                    textAlign: 'left'
                  }}
                >
                  {modalAlert.message}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ background: 'white', color: 'black', border: '1px solid #ccc' }}
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Uploading..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
