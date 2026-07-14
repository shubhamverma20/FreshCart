import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { FiUser, FiPackage, FiHeart, FiMapPin, FiSettings, FiLogOut, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully.", "info");
    navigate('/');
  };

  const navItems = [
    { id: 'orders', label: 'My Orders', icon: FiPackage, path: '/dashboard/orders' },
    { id: 'wishlist', label: 'Wishlist', icon: FiHeart, path: '/dashboard/wishlist' },
    { id: 'addresses', label: 'Saved Addresses', icon: FiMapPin, path: '/dashboard/addresses' },
    { id: 'profile', label: 'Profile Details', icon: FiUser, path: '/dashboard/profile' },
    { id: 'settings', label: 'Account Settings', icon: FiSettings, path: '/dashboard/settings' }
  ];

  return (
    <main className="main-content container px-4 sm:px-6 lg:px-8 text-left pb-16 lg:pb-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-450 dark:text-slate-500 mb-6 lg:mb-8 mt-4 lg:mt-0">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <FiChevronRight className="w-3 h-3" />
        <span className="text-slate-600 dark:text-slate-350">My Account</span>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 lg:gap-8">
        
        {/* Left Sidebar Menu / Mobile Horizontal Scroll */}
        <aside className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm h-fit">
          
          {/* User Profile Summary - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800/80 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-3">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <h3 className="font-extrabold text-lg text-slate-850 dark:text-white leading-tight">
              {user?.name || 'User'}
            </h3>
            <span className="text-xs font-semibold text-slate-400 mt-1">{user?.email}</span>
            {user?.provider && (
              <span className="mt-2.5 text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-full">
                Logged in via {user.provider}
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible hide-scrollbar snap-x snap-mandatory py-2 lg:py-0 px-2 lg:px-0 space-x-2 lg:space-x-0 lg:space-y-1">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={({ isActive }) => 
                    `flex items-center gap-2 lg:gap-3 px-4 py-2.5 lg:py-3.5 rounded-xl lg:rounded-2xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap snap-center flex-shrink-0 lg:w-full ${
                      isActive 
                        ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 lg:w-4.5 lg:h-4.5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                      {tab.label}
                    </>
                  )}
                </NavLink>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 lg:gap-3 px-4 py-2.5 lg:py-3.5 rounded-xl lg:rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer whitespace-nowrap snap-center flex-shrink-0 lg:w-full lg:mt-4"
            >
              <FiLogOut className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
              Logout
            </button>
          </nav>
        </aside>

        {/* Right Dashboard Area (Outlet for nested routes) */}
        <section className="lg:col-span-3">
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 p-5 sm:p-8 rounded-2xl lg:rounded-[32px] shadow-soft-md min-h-[480px]">
            <Outlet />
          </div>
        </section>

      </div>
    </main>
  );
}
