import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      {/* Page-specific inline CSS */}
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

        /* Disable main navbar when in admin view */
        nav.navbar {
            display: none !important;
        }
      `}} />

      <aside className="sidebar">
        <div className="sidebar-logo">
          <ion-icon name="basket"></ion-icon> Admin
        </div>
        
        <div className="nav-item active">
          <ion-icon name="grid-outline"></ion-icon> Dashboard
        </div>
        <div className="nav-item">
          <ion-icon name="cube-outline"></ion-icon> Products
        </div>
        <div className="nav-item">
          <ion-icon name="receipt-outline"></ion-icon> Orders
        </div>
        <div className="nav-item">
          <ion-icon name="people-outline"></ion-icon> Customers
        </div>
        <div className="nav-item">
          <ion-icon name="bicycle-outline"></ion-icon> Delivery Team
        </div>
        
        <div style={{ flex: 1 }}></div>
        
        <div className="nav-item" style={{ color: '#F87171' }} onClick={() => navigate('/')}>
          <ion-icon name="log-out-outline"></ion-icon> Logout
        </div>
      </aside>

      <main className="main-panel fade-in">
        <div className="header">
          <div>
            <h1 style={{ fontSize: '28px', margin: 0 }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0' }}>
              Welcome back, Admin. Here's what's happening today.
            </p>
          </div>
          <div>
            <button className="btn-primary">
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

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Sales (Today)</div>
            <div className="stat-value">
              ₹24,500{' '}
              <span className="stat-trend">
                <ion-icon name="arrow-up"></ion-icon> 12%
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Active Orders</div>
            <div className="stat-value">42</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Products Out of Stock</div>
            <div className="stat-value" style={{ color: '#EF4444' }}>8</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Delivery Boys Online</div>
            <div className="stat-value">15/20</div>
          </div>
        </div>

        <div className="data-table-card">
          <div className="table-header">
            <h2 style={{ fontSize: '20px', margin: 0 }}>Recent Orders</h2>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search orders..." 
              style={{ maxWidth: '250px', padding: '8px 15px' }}
            />
          </div>
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
              <tr>
                <td style={{ fontWeight: 600 }}>#ORD-9824X</td>
                <td>Rahul Sharma</td>
                <td>Today, 10:24 AM</td>
                <td>₹680</td>
                <td>
                  <span className="badge-status status-pending">Processing</span>
                </td>
                <td>
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                    Assign Boy
                  </a>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>#ORD-9823X</td>
                <td>Priya Patel</td>
                <td>Today, 09:15 AM</td>
                <td>₹1240</td>
                <td>
                  <span className="badge-status status-ready">Out for Delivery</span>
                </td>
                <td>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/delivery?orderId=ORD-9823X'); }} style={{ color: 'var(--text-secondary)' }}>
                    Track
                  </a>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>#ORD-9822X</td>
                <td>Amit Kumar</td>
                <td>Today, 08:30 AM</td>
                <td>₹450</td>
                <td>
                  <span className="badge-status status-delivered">Delivered</span>
                </td>
                <td>
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-secondary)' }}>
                    View Details
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
