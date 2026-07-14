import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { FiMoon, FiSun, FiGlobe, FiAlertTriangle, FiBell, FiSmartphone } from 'react-icons/fi';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [language, setLanguage] = useState('English');

  const handleDeleteAccount = () => {
    // In a real app, this would open a confirmation modal
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmed) {
      showToast("Account deletion request submitted.", "info");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display font-extrabold text-xl text-slate-850 dark:text-white">Account Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your preferences and configurations.</p>
      </div>

      {/* Preferences Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preferences</h3>
        
        {/* Dark Mode Toggle */}
        <div className="flex justify-between items-center p-5 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              {theme === 'dark' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </div>
            <div className="text-left flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Appearance</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Toggle dark or light mode</span>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 dark:bg-primary transition-colors cursor-pointer"
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex justify-between items-center p-5 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <FiGlobe className="w-5 h-5" />
            </div>
            <div className="text-left flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Language</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Preferred app language</span>
            </div>
          </div>
          <select 
            value={language}
            onChange={(e) => { setLanguage(e.target.value); showToast(`Language changed to ${e.target.value}`, "success"); }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-primary cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi (हिंदी)</option>
            <option value="Spanish">Spanish</option>
          </select>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notifications</h3>
        
        <div className="flex justify-between items-center p-5 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <FiBell className="w-5 h-5" />
            </div>
            <div className="text-left flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Email Notifications</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Order receipts and promotions</span>
            </div>
          </div>
          <button 
            onClick={() => setEmailNotifs(!emailNotifs)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${emailNotifs ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex justify-between items-center p-5 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <FiSmartphone className="w-5 h-5" />
            </div>
            <div className="text-left flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">SMS Alerts</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Get tracking updates on mobile</span>
            </div>
          </div>
          <button 
            onClick={() => setSmsNotifs(!smsNotifs)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${smsNotifs ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${smsNotifs ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Danger Zone</h3>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-red-200 dark:border-red-900/50 rounded-3xl bg-red-50 dark:bg-red-950/20 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-500">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-left flex flex-col">
              <span className="text-sm font-bold text-red-700 dark:text-red-400">Delete Account</span>
              <span className="text-xs text-red-600/80 dark:text-red-400/80">Permanently remove all your data</span>
            </div>
          </div>
          <button 
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
