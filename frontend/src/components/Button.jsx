import React from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary', // primary, secondary (outline), ghost, danger, subtle
  size = 'md',        // sm, md, lg
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  // Styles based on variants
  const baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover focus:ring-emerald-500 shadow-[0_2px_4px_rgba(34,197,94,0.12),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(34,197,94,0.18),0_2px_4px_rgba(0,0,0,0.04)]",
    secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800/80 focus:ring-emerald-500 shadow-sm",
    outline: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800/80 focus:ring-emerald-500 shadow-sm", // Alias for secondary
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100 focus:ring-slate-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-[0_2px_4px_rgba(239,68,68,0.12)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.18)]",
    subtle: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 dark:bg-emerald-950/20 dark:text-emerald-450 dark:hover:bg-emerald-950/40 focus:ring-emerald-500"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5 rounded-xl",
    md: "px-4.5 py-2.5 text-sm gap-2 rounded-xl",
    lg: "px-6 py-3 text-base gap-2.5 rounded-xl"
  };

  // Ring offset for dark mode
  const ringOffset = "focus:ring-offset-white dark:focus:ring-offset-slate-950";

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={disabled || loading ? {} : { scale: 1.015, y: -0.5 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size]} ${ringOffset} ${className}`}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Left Icon (if loading is false) */}
      {!loading && leftIcon && <span className="flex items-center">{leftIcon}</span>}
      
      {/* Button Text */}
      <span className="font-medium">{children}</span>

      {/* Right Icon */}
      {!loading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </motion.button>
  );
}
