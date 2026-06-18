import React from 'react';

export default function ProductGrid({ products, onAddToCart, loading }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        <p>Loading Fresh Items...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        <span style={{ fontSize: '48px' }} role="img" aria-label="Warning">⚠️</span>
        <h3>No products found</h3>
        <p>We couldn't find any items matching your criteria.</p>
      </div>
    );
  }

  return (
    <section>
      <div className="section-header fade-in">
        <h2 className="section-title">Fresh Picks For You</h2>
      </div>

      <div className="products-grid">
        {products.map((product, index) => {
          const delay = (index % 12) * 0.05; // Cap delay at reasonable values
          const discountBadge = product.originalPrice && product.originalPrice > product.price ? (
            <span style={{ color: '#ef4444', fontSize: '12px', marginLeft: '8px', textDecoration: 'line-through' }}>
              ₹{product.originalPrice}
            </span>
          ) : null;

          return (
            <div 
              key={product.id || product._id || index} 
              className="product-card fade-in" 
              style={{ animationDelay: `${delay}s` }}
            >
              {product.badge && <div className="product-badge">{product.badge}</div>}
              <img src={product.image} className="product-image" alt={product.name} loading="lazy" />
              <div className="product-category">{product.category}</div>
              <h3 className="product-title">{product.name}</h3>
              <div className="product-rating">
                ⭐ {product.rating || '4.5'} ({product.reviews || '50'})
              </div>
              <div className="product-footer">
                <div className="product-price">
                  ₹{product.price} {discountBadge}
                </div>
                <button className="btn-add" onClick={() => onAddToCart(product)}>
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
