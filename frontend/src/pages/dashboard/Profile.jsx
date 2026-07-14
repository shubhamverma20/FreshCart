import React, { useState } from 'react';
import { FiCamera } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock API delay
    setTimeout(() => {
      setLoading(false);
      showToast("Profile updated successfully!", "success");
    }, 800);
  };

  const handleAvatarClick = () => {
    showToast("Avatar upload is a mock feature.", "info");
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display font-extrabold text-xl text-slate-850 dark:text-white">Profile Details</h2>
      
      {/* Avatar Section */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white font-display font-extrabold text-4xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FiCamera className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">Profile Picture</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
            PNG, JPEG under 2MB. Click avatar to upload.
          </p>
        </div>
      </div>

      <form className="max-w-md space-y-5" onSubmit={handleUpdateProfile}>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-750 px-4 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-850 dark:text-slate-200 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Email Address (Read-Only)</label>
          <input 
            type="email" 
            value={user?.email || 'user@example.com'} 
            disabled
            className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Phone Number</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="+91 9876543210"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-750 px-4 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-850 dark:text-slate-200 transition-colors"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary-hover text-white py-4 px-8 rounded-2xl font-bold text-sm transition-all shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto mt-4"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
}
