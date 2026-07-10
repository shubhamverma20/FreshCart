import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Internal Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          let icon = <FiInfo className="w-5 h-5 text-blue-500" />;
          let bgColor = 'bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700';
          let textColor = 'text-slate-800 dark:text-slate-200';

          if (toast.type === 'success') {
            icon = <FiCheckCircle className="w-5 h-5 text-emerald-500" />;
            bgColor = 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50';
            textColor = 'text-emerald-800 dark:text-emerald-200';
          } else if (toast.type === 'error') {
            icon = <FiAlertTriangle className="w-5 h-5 text-red-500" />;
            bgColor = 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50';
            textColor = 'text-red-800 dark:text-red-200';
          } else if (toast.type === 'warning') {
            icon = <FiAlertTriangle className="w-5 h-5 text-amber-500" />;
            bgColor = 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50';
            textColor = 'text-amber-800 dark:text-amber-200';
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md ${bgColor} ${textColor}`}
            >
              <div className="flex-shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 text-sm font-semibold pr-2 leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg"
              >
                <FiX className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
