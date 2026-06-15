import React from 'react';

const CATEGORIES = [
  { id: 'Vegetables', name: 'Vegetables', icon: '🥬' },
  { id: 'Fruits', name: 'Fruits', icon: '🍎' },
  { id: 'Dairy & Eggs', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'Bakery', name: 'Bakery', icon: '🍞' },
  { id: 'Meat', name: 'Meat', icon: '🥩' },
  { id: 'Beverages', name: 'Beverages', icon: '🧃' },
  { id: 'Snacks', name: 'Snacks', icon: '🍫' }
];

export default function CategorySection({ selectedCategory, onSelectCategory }) {
  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Shop by Category</h2>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition"
          >
            Clear Filter &times;
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
                  : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
              }`}
            >
              <span className="text-4xl mb-3 filter drop-shadow-sm select-none" role="img" aria-label={category.name}>
                {category.icon}
              </span>
              <span className="text-sm font-medium text-center leading-tight">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
