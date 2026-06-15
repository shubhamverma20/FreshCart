import React, { useState } from 'react';
import CategorySection from './components/CategorySection';
import ProductGrid from './components/ProductGrid';

const CLOUDINARY_BASE = "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/";

const SAMPLE_PRODUCTS = [
  { id: 1, name: "Fresh Organic Bananas", category: "Fruits", price: 80, originalPrice: 100, image: CLOUDINARY_BASE + "bananas.png", rating: 4.8, reviews: 120, badge: "Bestseller" },
  { id: 2, name: "Farm Fresh Tomatoes", category: "Vegetables", price: 45, originalPrice: 60, image: CLOUDINARY_BASE + "tomatoes.png", rating: 4.5, reviews: 85, badge: "Fresh Arrival" },
  { id: 3, name: "Whole Wheat Bread", category: "Bakery", price: 55, originalPrice: 65, image: CLOUDINARY_BASE + "bread.png", rating: 4.7, reviews: 230, badge: null },
  { id: 4, name: "Amul Pure Milk (1L)", category: "Dairy & Eggs", price: 66, originalPrice: 66, image: CLOUDINARY_BASE + "milk.png", rating: 4.9, reviews: 500, badge: "High Demand" },
  { id: 5, name: "Organic Red Apples", category: "Fruits", price: 220, originalPrice: 250, image: CLOUDINARY_BASE + "apples.png", rating: 4.6, reviews: 156, badge: "Offer" },
  { id: 6, name: "Green Spinach Bunch", category: "Vegetables", price: 25, originalPrice: 35, image: CLOUDINARY_BASE + "spinach.png", rating: 4.3, reviews: 90, badge: null },
  { id: 7, name: "Free Range Eggs (6 Pcs)", category: "Dairy & Eggs", price: 60, originalPrice: 75, image: CLOUDINARY_BASE + "eggs.png", rating: 4.7, reviews: 310, badge: "Bestseller" },
  { id: 8, name: "Fresh Coriander Leaves", category: "Vegetables", price: 15, originalPrice: 25, image: CLOUDINARY_BASE + "spinach.png", rating: 4.4, reviews: 45, badge: null },
  { id: 9, name: "Dairy Milk Chocolate", category: "Snacks", price: 40, originalPrice: 50, image: CLOUDINARY_BASE + "chocolate.png.jpg", rating: 4.7, reviews: 200, badge: "Popular" },
  { id: 10, name: "Lays Classic Chips", category: "Snacks", price: 20, originalPrice: 25, image: CLOUDINARY_BASE + "lays%20chips.png.jpg", rating: 4.5, reviews: 150, badge: null },
  { id: 11, name: "Coca Cola (500ml)", category: "Beverages", price: 40, originalPrice: 45, image: CLOUDINARY_BASE + "cococola.png.jpg", rating: 4.6, reviews: 300, badge: "Trending" },
  { id: 12, name: "Kurkure Masala Munch", category: "Snacks", price: 20, originalPrice: 25, image: CLOUDINARY_BASE + "Kurkure.jpg", rating: 4.4, reviews: 112, badge: "New" },
  { id: 13, name: "Amul Cool", category: "Beverages", price: 30, originalPrice: 35, image: CLOUDINARY_BASE + "amul%20kool.jpg", rating: 4.5, reviews: 87, badge: null },
  { id: 14, name: "Lemon Juice", category: "Beverages", price: 20, originalPrice: 25, image: CLOUDINARY_BASE + "lemon%20juice.jpg", rating: 4.3, reviews: 76, badge: "Fresh" },
  { id: 15, name: "Amul Butter", category: "Dairy & Eggs", price: 25, originalPrice: 30, image: CLOUDINARY_BASE + "amul%20butter.jpg", rating: 4.7, reviews: 64, badge: null },
  { id: 16, name: "Maggi Noodles", category: "Snacks", price: 15, originalPrice: 20, image: CLOUDINARY_BASE + "Maggi.jpg", rating: 4.6, reviews: 211, badge: "Popular" },
  { id: 17, name: "Maaza Drink", category: "Beverages", price: 35, originalPrice: 40, image: CLOUDINARY_BASE + "Maaza.jpg", rating: 4.4, reviews: 102, badge: null },
  { id: 18, name: "Jems Pack", category: "Snacks", price: 90, originalPrice: 100, image: CLOUDINARY_BASE + "Jems.jpg", rating: 4.2, reviews: 80, badge: null },
  { id: 19, name: "Kinder Joy", category: "Snacks", price: 55, originalPrice: 60, image: CLOUDINARY_BASE + "Kinder%20joy.jpg", rating: 4.6, reviews: 98, badge: "Kids Favorite" },
  { id: 20, name: "Vanilla Ice Cream Cup", category: "Dairy & Eggs", price: 30, originalPrice: 35, image: CLOUDINARY_BASE + "icecream.jpg", rating: 4.5, reviews: 74, badge: null },
  { id: 21, name: "Fanta", category: "Beverages", price: 40, originalPrice: 45, image: CLOUDINARY_BASE + "Fanta.jpg", rating: 4.3, reviews: 66, badge: null },
  { id: 22, name: "Coca Cola Bottle", category: "Beverages", price: 45, originalPrice: 50, image: CLOUDINARY_BASE + "cococola.png.jpg", rating: 4.4, reviews: 91, badge: "Chilled" },
  { id: 23, name: "Child Beer Malt Drink", category: "Beverages", price: 160, originalPrice: 150, image: CLOUDINARY_BASE + "Child%20Beer.jpg", rating: 4.1, reviews: 38, badge: null },
  { id: 24, name: "Coca Cola Can Pack", category: "Beverages", price: 120, originalPrice: 140, image: CLOUDINARY_BASE + "Coca%20Cola%20Can%20Mixed%20Tray%20330ml%2024%20Pack.jpg", rating: 4.5, reviews: 57, badge: "Party Pack" },
  { id: 25, name: "Tiger Biscuit", category: "Snacks", price: 20, originalPrice: 15, image: CLOUDINARY_BASE + "Tiger%20Biscuit.jpg", rating: 4.1, reviews: 34, badge: null }
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);

  // Category Filtering Logic using array filter()
  const filteredProducts = selectedCategory
    ? SAMPLE_PRODUCTS.filter(product => product.category === selectedCategory)
    : SAMPLE_PRODUCTS;

  // Add to Cart handler
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    // Console logging / User interaction feedback
    console.log(`[App] Added "${product.name}" to cart.`);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Simple Header for Demonstration */}
        <header className="flex items-center justify-between border-b border-gray-200/60 pb-6 mb-8 select-none">
          <div className="flex items-center gap-2">
            <span className="text-3xl" role="img" aria-label="Logo">🥬</span>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">
              Fresh<span className="text-emerald-500">Cart</span>
            </h1>
          </div>
          
          {/* Cart Status Indicator */}
          <div className="relative p-2.5 rounded-full bg-white border border-gray-100 shadow-sm cursor-pointer hover:shadow transition">
            <span className="text-xl" role="img" aria-label="Cart">🛒</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                {totalCartCount}
              </span>
            )}
          </div>
        </header>

        {/* 1. Category Section */}
        <CategorySection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 2. Product Grid */}
        <ProductGrid
          products={filteredProducts}
          onAddToCart={handleAddToCart}
        />
        
      </div>
    </div>
  );
}
