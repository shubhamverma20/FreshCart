import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartSidebar() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal, toggleCart } = useCart();
  const navigate = useNavigate();

  // Control body scroll when cart is open
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [cartOpen]);

  const handleCheckoutClick = () => {
    setCartOpen(false);
    navigate('/cart');
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`cart-overlay ${cartOpen ? 'open' : ''}`} 
        onClick={toggleCart}
      ></div>

      {/* Sidebar panel */}
      <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-cart" onClick={toggleCart}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              Your cart is empty.
              <br />
              Add some fresh groceries!
            </div>
          ) : (
            cart.map((item) => {
              const itemId = item.id || item._id;
              return (
                <div key={itemId} className="cart-item fade-in">
                  <img src={item.image} alt={item.name} loading="lazy" className="cart-item-img" />
                  <div className="cart-item-details">
                    <div className="cart-item-title">{item.name}</div>
                    <div className="cart-item-price">₹{item.price}</div>
                    <div className="cart-item-qty">
                      <button className="qty-btn" onClick={() => updateQuantity(itemId, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(itemId, 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-remove-btn" onClick={() => removeFromCart(itemId)}>
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total Amount</span>
              <span>₹{cartTotal}</span>
            </div>
            <button className="btn-checkout" onClick={handleCheckoutClick}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
