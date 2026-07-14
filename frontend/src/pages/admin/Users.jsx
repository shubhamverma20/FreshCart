import React, { useState } from 'react';
import { FiSearch, FiShield, FiUser } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const initialUsers = [
  { id: '1', name: 'Aarav Sharma', email: 'aarav@gmail.com', orders: 12, role: 'Admin', status: 'Active' },
  { id: '2', name: 'Priya Patel', email: 'priya@gmail.com', orders: 8, role: 'Customer', status: 'Active' },
  { id: '3', name: 'Shubham Verma', email: 'shubhamverma8299@gmail.com', orders: 4, role: 'Customer', status: 'Suspended' },
  { id: '4', name: 'Neha Singh', email: 'neha@gmail.com', orders: 2, role: 'Customer', status: 'Active' }
];

export default function Users() {
  const { showToast } = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        showToast(`User ${newStatus === 'Active' ? 'activated' : 'suspended'}.`, newStatus === 'Active' ? 'success' : 'warning');
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const toggleRole = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const newRole = u.role === 'Admin' ? 'Customer' : 'Admin';
        showToast(`User role updated to ${newRole}.`, "info");
        return { ...u, role: newRole };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-display font-extrabold text-lg text-slate-850 dark:text-white">User Directory</h3>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary text-xs font-semibold"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>
      </div>

      {/* Data Table / Responsive Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden text-left">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">User</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Orders</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Role</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        {u.role === 'Admin' ? <FiShield className="w-5 h-5 text-primary" /> : <FiUser className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{u.orders}</td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => toggleRole(u.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-colors ${
                        u.role === 'Admin' 
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 hover:bg-purple-100' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {u.role}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      u.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-red-50 text-red-600 dark:bg-red-950/30'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => toggleStatus(u.id)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm ${
                        u.status === 'Active' 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20' 
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20'
                      }`}
                    >
                      {u.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 text-sm font-semibold">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {filteredUsers.map(u => (
            <div key={u.id} className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  {u.role === 'Admin' ? <FiShield className="w-5 h-5 text-primary" /> : <FiUser className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{u.name}</h4>
                  <span className="text-xs text-slate-400 block">{u.email}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">{u.orders} Orders</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    u.status === 'Active' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {u.status}
                  </span>
                </div>
                <button 
                  onClick={() => toggleStatus(u.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold shadow-sm ${
                    u.status === 'Active' ? 'bg-red-100 text-red-600 dark:bg-red-950/30' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30'
                  }`}
                >
                  {u.status === 'Active' ? 'Suspend' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="py-10 text-center text-slate-400 text-sm font-semibold">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
