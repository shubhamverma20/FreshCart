import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      // Products might use id or _id. Let's support both for compatibility
      const productId = product.id || product._id;
      const existingItem = prevCart.find(item => (item.id || item._id) === productId);
      
      if (existingItem) {
        return prevCart.map(item =>
          (item.id || item._id) === productId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setCartOpen(true); // Auto-open cart sidebar when adding items
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => (item.id || item._id) !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        const itemId = item.id || item._id;
        if (itemId === id) {
          const newQty = item.quantity + delta;
          return newQty <= 0 ? null : { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleCart = () => {
    setCartOpen(prev => !prev);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      cartOpen,
      setCartOpen,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      toggleCart,
      cartTotal, 
      cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
