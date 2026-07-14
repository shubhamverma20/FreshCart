import React, { useState, useMemo } from 'react';
import { FiSearch, FiPackage } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const initialOrders = [
  { id: 'ORD-1001', customer: 'Aarav Sharma', items: 3, total: 450, date: '2026-07-10', status: 'Pending' },
  { id: 'ORD-1002', customer: 'Priya Patel', items: 1, total: 120, date: '2026-07-09', status: 'Processing' },
  { id: 'ORD-1003', customer: 'Shubham Verma', items: 5, total: 1850, date: '2026-07-08', status: 'Delivered' },
  { id: 'ORD-1004', customer: 'Neha Singh', items: 2, total: 320, date: '2026-07-08', status: 'Out for Delivery' },
  { id: 'ORD-1005', customer: 'Rahul Kumar', items: 1, total: 80, date: '2026-07-05', status: 'Cancelled' }
];

export default function Orders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const statuses = ['All', 'Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    if (statusFilter !== 'All') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        o.customer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    showToast(`Order #${id} status updated to ${newStatus}`, "success");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 dark:bg-amber-950/30';
      case 'Processing': return 'bg-blue-50 text-blue-600 dark:bg-blue-950/30';
      case 'Out for Delivery': return 'bg-purple-50 text-purple-600 dark:bg-purple-950/30';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30';
      case 'Cancelled': return 'bg-red-50 text-red-600 dark:bg-red-950/30';
      default: return 'bg-slate-50 text-slate-600 dark:bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full xl:w-64">
          <input 
            type="text" 
            placeholder="Search Order ID or Customer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary text-xs font-semibold"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === s 
                  ? 'bg-primary text-white shadow-md shadow-emerald-500/20' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table / Responsive Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden text-left">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Order ID</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Date</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Customer</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Total</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
              {filteredOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">{o.id}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                    {new Date(o.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-6 text-slate-800 dark:text-slate-200">{o.customer}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-800 dark:text-slate-200">₹{o.total}</div>
                    <div className="text-xs text-slate-500">{o.items} items</div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border-none outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 ${getStatusColor(o.status)}`}
                    >
                      {statuses.filter(s => s !== 'All').map(s => (
                        <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 text-sm font-semibold">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {filteredOrders.map(o => (
            <div key={o.id} className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{o.id}</h4>
                  <span className="text-xs text-slate-500">{new Date(o.date).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <div className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100">₹{o.total}</div>
                  <div className="text-xs text-slate-500">{o.items} items</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{o.customer}</span>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase border-none outline-none appearance-none cursor-pointer ${getStatusColor(o.status)}`}
                >
                  {statuses.filter(s => s !== 'All').map(s => (
                    <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="py-10 text-center text-slate-400 text-sm font-semibold">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
