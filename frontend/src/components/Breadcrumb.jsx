import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

export default function Breadcrumb({ paths, className = '' }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold mb-6 flex-wrap ${className}`}>
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span className="text-slate-600 dark:text-slate-350 truncate max-w-[200px]">
                {path.label}
              </span>
            ) : (
              <Link to={path.to} className="text-slate-450 dark:text-slate-500 hover:text-primary transition-colors">
                {path.label}
              </Link>
            )}
            {!isLast && <FiChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 flex-shrink-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
