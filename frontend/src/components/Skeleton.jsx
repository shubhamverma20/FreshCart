import React from 'react';
import { motion } from 'framer-motion';

// Generic Skeleton Component
export default function Skeleton({ 
  className = '', 
  width, 
  height, 
  variant = 'rectangular', // text, circular, rectangular, rounded
  ...props 
}) {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-2xl',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <motion.div
      className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800 ${variantClasses[variant]} ${className}`}
      style={style}
      animate={{
        opacity: [0.55, 0.9, 0.55]
      }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...props}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          repeat: Infinity,
          duration: 1.6,
          ease: "linear"
        }}
      />
    </motion.div>
  );
}

// ProductCardSkeleton Loader
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-soft flex flex-col gap-3.5 text-left">
      {/* Image Skeleton */}
      <Skeleton variant="rounded" className="w-full h-44" />
      
      {/* Brand/Tag */}
      <Skeleton variant="text" className="w-20 h-4" />
      
      {/* Product Title */}
      <div className="flex flex-col gap-1.5">
        <Skeleton variant="text" className="w-full h-5" />
        <Skeleton variant="text" className="w-3/4 h-5" />
      </div>
      
      {/* Size / Weight */}
      <Skeleton variant="text" className="w-16 h-3.5" />
      
      {/* Footer (Price + Add button) */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50 dark:border-slate-800/50">
        <div className="flex flex-col gap-1">
          <Skeleton variant="text" className="w-12 h-5" />
        </div>
        <Skeleton variant="circular" className="w-10 h-10" />
      </div>
    </div>
  );
};

// CategorySkeleton Loader
export const CategorySkeleton = () => {
  return (
    <div className="flex flex-col items-center gap-3 p-4 min-w-[110px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
      <Skeleton variant="circular" className="w-14 h-14" />
      <Skeleton variant="text" className="w-16 h-4" />
    </div>
  );
};

// ProductDetailSkeleton Loader
export const ProductDetailSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 py-6">
      {/* Left Gallery Skeleton */}
      <div className="flex flex-col gap-4">
        <Skeleton variant="rounded" className="w-full aspect-square" />
        <div className="grid grid-cols-4 gap-3">
          <Skeleton variant="rounded" className="aspect-square w-full" />
          <Skeleton variant="rounded" className="aspect-square w-full" />
          <Skeleton variant="rounded" className="aspect-square w-full" />
          <Skeleton variant="rounded" className="aspect-square w-full" />
        </div>
      </div>

      {/* Right Info Skeleton */}
      <div className="flex flex-col gap-5 text-left">
        <Skeleton variant="text" className="h-4 w-28" />
        <Skeleton variant="text" className="h-10 w-3/4" />
        <Skeleton variant="text" className="h-5 w-40" />
        <Skeleton variant="text" className="h-8 w-24" />
        <Skeleton variant="text" className="h-24 w-full" />
        <div className="flex gap-4 mt-4">
          <Skeleton variant="rounded" className="h-12 w-32" />
          <Skeleton variant="rounded" className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
};

// OrderCardSkeleton Loader
export const OrderCardSkeleton = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-soft flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="w-32 h-5" />
        <Skeleton variant="rounded" className="w-20 h-5" />
      </div>
      <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800"></div>
      <div className="flex gap-3 items-center">
        <Skeleton variant="rounded" className="w-12 h-12" />
        <div className="flex-1 flex flex-col gap-1.5">
          <Skeleton variant="text" className="w-1/2 h-4" />
          <Skeleton variant="text" className="w-24 h-3" />
        </div>
      </div>
    </div>
  );
};
