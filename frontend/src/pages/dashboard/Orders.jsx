import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiBox } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const mockOrders = [
  {
    id: 'ORD-9824X',
    date: '2026-07-10T10:30:00Z',
    status: 'Delivered',
    total: 315,
    items: [
      { name: 'Fresh Organic Bananas', qty: 1, price: 80, img: 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?auto=format&fit=crop&q=80&w=150' },
      { name: 'Amul Pure Milk (1L)', qty: 2, price: 66, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=150' },
      { name: 'Brown Bread', qty: 1, price: 40, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=150' },
      { name: 'Eggs (6 pcs)', qty: 1, price: 63, img: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&q=80&w=150' }
    ]
  },
  {
    id: 'ORD-7512Y',
    date: '2026-07-08T18:15:00Z',
    status: 'In Transit',
    total: 1250,
    items: [
      { name: 'Alphonso Mangoes (1kg)', qty: 2, price: 500, img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=150' },
      { name: 'Greek Yogurt', qty: 1, price: 250, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=150' }
    ]
  },
  {
    id: 'ORD-4439Z',
    date: '2026-07-01T09:00:00Z',
    status: 'Cancelled',
    total: 140,
    items: [
      { name: 'Coca Cola Can', qty: 4, price: 35, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=150' }
    ]
  }
];

export default function Orders() {
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState(mockOrders[0].id);

  const toggleOrder = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50';
      case 'In Transit': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50';
      case 'Cancelled': return 'text-red-600 dark:text-red-450 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display font-extrabold text-xl text-slate-850 dark:text-white">Order History</h2>
      
      {mockOrders.length === 0 ? (
        <div className="text-center py-16">
          <FiBox className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-150">No orders placed yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xs mx-auto mb-6">
            Explore our fresh collections and make your first purchase!
          </p>
          <button onClick={() => navigate('/products')} className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-8 py-3.5 rounded-full transition-transform hover:scale-105 shadow-lg shadow-emerald-500/20">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {mockOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            
            return (
              <div 
                key={order.id} 
                className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Header (Clickable) */}
                <div 
                  onClick={() => toggleOrder(order.id)}
                  className="p-5 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <FiBox className="w-6 h-6" />
                    </div>
                    <div>
                      <strong className="text-sm font-extrabold text-slate-800 dark:text-slate-200 block">#{order.id}</strong>
                      <span className="text-xs font-semibold text-slate-400">
                        {new Date(order.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <span className="text-xs font-semibold text-slate-400 block mb-0.5">Total</span>
                      <strong className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100">₹{order.total}</strong>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${getStatusColor(order.status)} flex items-center gap-1.5`}>
                      {order.status === 'In Transit' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                      {order.status === 'Delivered' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                      {order.status}
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-slate-100 dark:bg-slate-800 text-primary' : ''}`}>
                      <FiChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Expandable Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="p-5 space-y-4">
                        {/* Mobile Total (only shows when expanded on small screens) */}
                        <div className="sm:hidden flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-semibold text-slate-500">Order Total</span>
                          <strong className="font-display font-extrabold text-lg text-slate-800 dark:text-slate-100">₹{order.total}</strong>
                        </div>

                        {/* Items List */}
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Itemized Bill</h4>
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center">
                              <img src={item.img} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-slate-100 dark:border-slate-800" />
                              <div className="flex-1">
                                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.name}</h5>
                                <span className="text-xs font-semibold text-slate-400">Qty: {item.qty}</span>
                              </div>
                              <div className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                                ₹{item.price * item.qty}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reorder / Track Action */}
                        <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                          {order.status === 'In Transit' ? (
                            <button onClick={() => navigate(`/delivery?orderId=${order.id}`)} className="bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-primary-hover transition-colors shadow-sm">
                              Track Order
                            </button>
                          ) : (
                            <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-6 py-2.5 rounded-xl transition-colors">
                              Reorder Items
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
