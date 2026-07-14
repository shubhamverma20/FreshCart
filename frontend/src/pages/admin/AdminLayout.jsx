import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  FiGrid, 
  FiPackage, 
  FiShoppingBag, 
  FiUsers, 
  FiArchive, 
  FiX, 
  FiMenu, 
  FiSun, 
  FiMoon,
  FiHome,
  FiSearch
} from 'react-icons/fi';

export default function AdminLayout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FiGrid, path: '/admin/overview' },
    { id: 'products', label: 'Products', icon: FiPackage, path: '/admin/products' },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag, path: '/admin/orders' },
    { id: 'users', label: 'Users', icon: FiUsers, path: '/admin/users' },
    { id: 'inventory', label: 'Inventory', icon: FiArchive, path: '/admin/inventory' }
  ];

  // Helper to get active page title based on route
  const getPageTitle = () => {
    const current = navItems.find(item => location.pathname.includes(item.path));
    return current ? current.label : 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* 1. Collapsible Admin Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 p-6 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Logo */}
        <div className="flex justify-between items-center mb-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
              <FiShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              FreshCart
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Menu Links */}
        <nav className="flex-1 space-y-1.5 text-left">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => 
                  `w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-emerald-500/20' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5" />
                {tab.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-3.5">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <span>Appearance Mode</span>
            {theme === 'dark' ? <FiSun className="w-4.5 h-4.5 text-amber-500" /> : <FiMoon className="w-4.5 h-4.5 text-slate-400" />}
          </button>
          <Link to="/" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-white transition-colors">
            <FiHome className="w-4 h-4" /> Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Main Panel */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        
        {/* Top Header */}
        <header className="h-20 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-all duration-300">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer">
              <FiMenu className="w-6.5 h-6.5" />
            </button>
            <h1 className="font-extrabold text-2xl text-slate-900 dark:text-white capitalize tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          {/* Optional Global Search */}
          <div className="relative group w-40 sm:w-64 hidden sm:block">
            <input 
              type="text" 
              placeholder="Search admin..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary text-xs font-semibold transition-colors"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>
        </header>

        {/* Inner Content Area via Outlet */}
        <main className="flex-1 p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
