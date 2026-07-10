import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-between w-16 h-8 p-1 rounded-full cursor-pointer bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 transition-colors duration-300 shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      aria-label="Toggle theme"
    >
      {/* Sliding background indicator */}
      <motion.div
        className="absolute w-6 h-6 rounded-full bg-white dark:bg-slate-950 shadow-md flex items-center justify-center z-10"
        layout
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 28
        }}
        animate={{
          x: isDark ? 30 : 0
        }}
      >
        {/* Animated Icon Inside Knob */}
        <motion.div
          key={theme}
          initial={{ rotate: -120, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 120, scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <FiMoon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          ) : (
            <FiSun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
          )}
        </motion.div>
      </motion.div>

      {/* Background Icons (Visible in inactive state) */}
      <div className="flex justify-between items-center w-full px-1.5 text-slate-400 dark:text-slate-500">
        <FiSun className="w-3.5 h-3.5" />
        <FiMoon className="w-3.5 h-3.5" />
      </div>
    </button>
  );
}
