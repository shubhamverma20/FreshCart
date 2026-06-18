import React, { useState, useEffect } from 'react';
import CategorySection from '../components/CategorySection';
import ProductGrid from '../components/ProductGrid';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Home({ searchQuery }) {
  const { addToCart } = useCart();
  const { apiBase } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiBase]);

  // Filter products by selected category AND search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory 
      ? product.category.toLowerCase() === selectedCategory.toLowerCase() 
      : true;
      
    const matchesSearch = searchQuery 
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="main-content container">
      {/* Hero Section */}
      <section className="hero fade-in">
        <div className="hero-content">
          <h1>
            Fresh Groceries, <br />
            <span style={{ color: 'var(--primary-color)' }}>Delivered Fast.</span>
          </h1>
          <p>
            Get everything you need from nearby stores in minutes. Fresh vegetables, fruits, dairy, and daily essentials.
          </p>
          <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
            Shop Now
          </button>
        </div>
        <div className="hero-image">
          <img
            src="https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/hero.png"
            style={{ borderRadius: '20px' }}
            alt="Fresh Groceries Collection"
            loading="lazy"
          />
        </div>
      </section>

      {/* Category Section */}
      <CategorySection
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Product Grid */}
      <ProductGrid
        products={filteredProducts}
        onAddToCart={addToCart}
        loading={loading}
      />
    </main>
  );
}
