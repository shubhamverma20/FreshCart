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
    <section>
      <div className="section-header fade-in">
        <h2 className="section-title">Shop by Category</h2>
        {selectedCategory && (
          <button 
            onClick={() => onSelectCategory(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Clear Filter &times;
          </button>
        )}
      </div>
      <div className="categories fade-in">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.id;
          return (
            <div
              key={category.id}
              className={`category-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(category.id)}
            >
              <div className="category-icon">{category.icon}</div>
              <div className="category-name">{category.name}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
