import React from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary', // primary, accent, outline, ghost, subtle
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
  const baseStyle = "inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary-500 shadow-md shadow-primary-500/10 active:bg-primary-700",
    accent: "bg-accent text-white hover:bg-accent-hover focus:ring-accent-500 shadow-md shadow-accent-500/10 active:bg-accent-700",
    outline: "bg-transparent border border-slate-350 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/80 focus:ring-primary-500",
    ghost: "bg-transparent text-slate-650 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-slate-100 focus:ring-slate-500",
    subtle: "bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950/20 dark:text-primary-450 dark:hover:bg-primary-950/40 focus:ring-primary-500"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs gap-1.5 rounded-xl",
    md: "px-5 py-2.5 text-sm gap-2 rounded-xl",
    lg: "px-6 py-3.5 text-base gap-2.5 rounded-2xl"
  };

  // Ring offset for dark mode
  const ringOffset = "focus:ring-offset-white dark:focus:ring-offset-slate-950";

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={disabled || loading ? {} : { scale: 1.015, translateY: -1 }}
      whileTap={disabled || loading ? {} : { scale: 0.985, translateY: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${ringOffset} ${className}`}
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
      <span>{children}</span>

      {/* Right Icon */}
      {!loading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </motion.button>
  );
}
