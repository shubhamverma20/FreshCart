import React from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';

export default function QuantitySelector({ quantity, onIncrement, onDecrement, className = '' }) {
  return (
    <div className={`flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800/80 w-fit ${className}`}>
      <button 
        onClick={onDecrement}
        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
      >
        <FiMinus className="w-4 h-4" />
      </button>
      <span className="font-display font-extrabold text-base w-10 text-center text-slate-800 dark:text-slate-100">
        {quantity}
      </span>
      <button 
        onClick={onIncrement}
        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
      >
        <FiPlus className="w-4 h-4" />
      </button>
    </div>
  );
}
