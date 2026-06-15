import React from 'react';

export default function ProductGrid({ products, onAddToCart }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-5xl mb-4" role="img" aria-label="No products">⚠️</span>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">No products found</h3>
        <p className="text-gray-500 text-sm">We couldn't find any items matching this category.</p>
      </div>
    );
  }

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Fresh Picks For You</h2>
        <span className="text-sm font-medium text-gray-500">
          Showing {products.length} {products.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
          >
            {/* Badge (Optional) */}
            {product.badge && (
              <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {product.badge}
              </span>
            )}

            {/* Product Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-50 border-b border-gray-50 flex items-center justify-center p-4">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="object-contain w-full h-full max-h-48 group-hover:scale-105 transition-transform duration-300 select-none"
              />
            </div>

            {/* Content Container */}
            <div className="p-5 flex flex-col flex-grow">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1 select-none">
                {product.category}
              </span>
              <h3 className="text-base font-bold text-gray-800 mb-2 leading-snug line-clamp-2 min-h-[3rem]">
                {product.name}
              </h3>
              
              {/* Rating (Optional) */}
              {product.rating && (
                <div className="flex items-center gap-1 text-sm text-yellow-500 mb-3 select-none">
                  <span>⭐ {product.rating}</span>
                  <span className="text-gray-400 text-xs">({product.reviews})</span>
                </div>
              )}

              {/* Card Footer */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold text-gray-900">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onAddToCart(product)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xl font-bold transition shadow-sm hover:shadow active:scale-95"
                  title="Add to Cart"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
