import React, { useState, useMemo } from 'react';
import { FiAlertTriangle, FiSearch, FiMinus, FiPlus } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const initialInventory = [
  { id: '1', name: "Fresh Organic Bananas", sku: "FOB-101", stock: 150, minStock: 20 },
  { id: '2', name: "Alphonso Mangoes (1kg)", sku: "ALM-102", stock: 45, minStock: 30 },
  { id: '3', name: "Brown Bread", sku: "BRD-201", stock: 12, minStock: 20 },
  { id: '4', name: "Amul Pure Milk (1L)", sku: "AML-301", stock: 0, minStock: 50 },
  { id: '5', name: "Britannia Bourbon", sku: "BRT-401", stock: 15, minStock: 30 },
];

export default function Inventory() {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState(initialInventory);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    return inventory.filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  const lowStockItems = useMemo(() => {
    return inventory.filter(i => i.stock <= i.minStock);
  }, [inventory]);

  const adjustStock = (id, amount) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stock + amount);
        return { ...item, stock: newStock };
      }
      return item;
    }));
  };

  const handleSaveAll = () => {
    showToast("Inventory levels synced successfully.", "success");
  };

  return (
    <div className="space-y-8">
      
      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-6 rounded-3xl text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-500">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-red-700 dark:text-red-400">Low Stock Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map(item => (
              <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate max-w-[150px]">{item.name}</div>
                  <div className="text-xs text-slate-500">SKU: {item.sku}</div>
                </div>
                <div className="text-right">
                  <div className={`font-extrabold text-lg ${item.stock === 0 ? 'text-red-600' : 'text-amber-500'}`}>
                    {item.stock}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Min: {item.minStock}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-display font-extrabold text-lg text-slate-850 dark:text-white">Stock Management</h3>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search product or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary text-xs font-semibold"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>
          <button onClick={handleSaveAll} className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md cursor-pointer transition-colors w-full sm:w-auto">
            Sync Changes
          </button>
        </div>
      </div>

      {/* Data Table / Responsive Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden text-left">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Product Details</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">SKU</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Min Stock</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Current Stock</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
              {filteredInventory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{item.sku}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{item.minStock}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      item.stock === 0 ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : item.stock <= item.minStock ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                    }`}>
                      {item.stock} Units
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
                      <button onClick={() => adjustStock(item.id, -1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 cursor-pointer">
                        <FiMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-slate-200">{item.stock}</span>
                      <button onClick={() => adjustStock(item.id, 1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 cursor-pointer">
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 text-sm font-semibold">No inventory items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {filteredInventory.map(item => (
            <div key={item.id} className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.name}</h4>
                  <span className="text-xs text-slate-500 font-mono mt-1 block">SKU: {item.sku}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  item.stock === 0 ? 'text-red-600 bg-red-50 dark:bg-red-950/20' : item.stock <= item.minStock ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20'
                }`}>
                  {item.stock} Units
                </span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs">
                <span className="font-semibold text-slate-500">Min: {item.minStock}</span>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <button onClick={() => adjustStock(item.id, -1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-bold text-slate-800 dark:text-slate-200">{item.stock}</span>
                  <button onClick={() => adjustStock(item.id, 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredInventory.length === 0 && (
            <div className="py-10 text-center text-slate-400 text-sm font-semibold">No inventory items found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
