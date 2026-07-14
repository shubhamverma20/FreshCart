import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiMapPin, FiBriefcase, FiHome } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const initialAddresses = [
  { id: 1, type: 'Home', name: 'Shubham Verma', phone: '9876543210', address: 'Flat 401, Green Meadows, Sector 15', pin: '400001' },
  { id: 2, type: 'Work', name: 'Shubham Verma', phone: '9876543210', address: 'Building 12, Tech Park, Andheri East', pin: '400099' }
];

export default function Addresses() {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState(initialAddresses);
  
  // Slide-over Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'Home',
    name: '',
    phone: '',
    address: '',
    pin: ''
  });

  const openModal = (addr = null) => {
    if (addr) {
      setEditingId(addr.id);
      setFormData(addr);
    } else {
      setEditingId(null);
      setFormData({ type: 'Home', name: '', phone: '', address: '', pin: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    showToast("Address deleted successfully.", "info");
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setAddresses(prev => prev.map(a => a.id === editingId ? { ...formData, id: editingId } : a));
      showToast("Address updated successfully.", "success");
    } else {
      setAddresses([...addresses, { ...formData, id: Date.now() }]);
      showToast("New address added.", "success");
    }
    closeModal();
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-display font-extrabold text-xl text-slate-850 dark:text-white">Saved Addresses</h2>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-transform hover:scale-105 shadow-md shadow-emerald-500/10 cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> Add Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="p-6 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 flex flex-col gap-4 relative hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${addr.type === 'Home' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : addr.type === 'Work' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {addr.type === 'Home' ? <FiHome className="w-4 h-4" /> : addr.type === 'Work' ? <FiBriefcase className="w-4 h-4" /> : <FiMapPin className="w-4 h-4" />}
                </div>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{addr.type}</span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => openModal(addr)}
                  className="text-slate-400 hover:text-primary p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer"
                  aria-label="Edit address"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(addr.id)}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                  aria-label="Delete address"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <strong className="text-sm font-bold text-slate-850 dark:text-slate-150 block">{addr.name}</strong>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{addr.address}</p>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>PIN: {addr.pin}</span>
                <span>Phone: {addr.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            
            {/* Side Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-display font-black text-xl text-slate-850 dark:text-white">
                  {editingId ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button onClick={closeModal} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors cursor-pointer">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="address-form" onSubmit={handleSave} className="space-y-5">
                  
                  {/* Address Type Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Save address as</label>
                    <div className="flex gap-3">
                      {['Home', 'Work', 'Other'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, type})}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${formData.type === type ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Recipient Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-850 dark:text-slate-200 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-850 dark:text-slate-200 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Flat / House No / Area / Street</label>
                    <textarea 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-850 dark:text-slate-200 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Pin Code</label>
                    <input 
                      type="text" 
                      value={formData.pin}
                      onChange={(e) => setFormData({...formData, pin: e.target.value})}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-slate-850 dark:text-slate-200 transition-colors"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="submit" 
                  form="address-form"
                  className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
