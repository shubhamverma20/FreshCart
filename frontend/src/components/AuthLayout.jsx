import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export default function AuthLayout({ children, title, subtitle }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* Left side: Form (Mobile Centered) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative p-6 sm:p-12 z-10">
        
        {/* Floating Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="absolute right-6 top-6 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-350 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all lg:hidden"
        >
          {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 group w-fit">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <FiShoppingBag className="w-6 h-6" />
            </div>
            <span className="font-display font-black text-2xl text-slate-800 dark:text-white tracking-tight">
              FreshCart
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-850 dark:text-white tracking-tight leading-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full"
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* Right side: Illustration (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative bg-emerald-50 dark:bg-slate-900 overflow-hidden items-center justify-center border-l border-slate-200/50 dark:border-slate-800/50">
        
        {/* Floating Theme Toggle Desktop */}
        <button 
          onClick={toggleTheme}
          className="absolute right-8 top-8 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-350 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all z-20"
        >
          {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>

        {/* Abstract shapes / Blobs */}
        <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-amber-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        
        {/* Mock Product / Illustration Image */}
        <div className="relative z-10 p-12 w-full max-w-lg">
          <div className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 rounded-[40px] p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" 
              alt="Fresh Groceries" 
              className="rounded-3xl w-full h-auto object-cover shadow-sm aspect-[4/3]"
            />
            <div className="mt-8 space-y-4">
              <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            </div>
            {/* Floating badge */}
            <div className="absolute -right-6 -top-6 bg-amber-500 text-white font-extrabold px-6 py-3 rounded-full shadow-xl transform rotate-12 flex flex-col items-center justify-center">
              <span className="text-sm">Delivery in</span>
              <span className="text-xl">12 Mins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
