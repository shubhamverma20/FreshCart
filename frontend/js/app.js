// 🌍 Configuration
// Automatic Detection: 
// Agar domain localhost hai to Backend 1111 use karo.
// Agar Vercel/Production hai, to NEECHE LIKHAI GAYI Apni Render URL daalo.
const IS_PRODUCTION = !window.location.hostname.includes('localhost');

// 👉 INSTRUCTION: Jab frontend ko Vercel pe deploy karo, to niche "YOUR_RENDER_URL" ko apna Render link se replace karo.
const PRODUCTION_API_URL = "https://freshcart-dewk.onrender.com";

const API_BASE = IS_PRODUCTION ? PRODUCTION_API_URL : 'http://localhost:1111';

console.log(`[System]: Using API Base -> ${API_BASE}`);

// Cart State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// DOM Elements
const productsContainer = document.getElementById('productsContainer');
const cartCountEl = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalPriceEl = document.getElementById('cartTotalPrice');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');

// 🔥 Fetch Products
async function loadProducts() {
  showLoading(true);
  try {
    const response = await fetch(`${API_BASE}/api/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    alert("Failed to load groceries. Please check your internet connection.");
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  if (productsContainer) {
    productsContainer.innerHTML = show 
      ? '<p class="loading">Loading fresh items...</p>' 
      : '';
  }
}

// Helper: Resolve Image Path
function resolveImagePath(imagePath) {
  if (!imagePath) return 'https://via.placeholder.com/150'; // Fallback
  
  // Since Frontend and Assets are hosted together (on Vercel in prod),
  // we don't need to prepend the Backend URL anymore.
  return imagePath;
}

// --- Rendering Functions ---

function renderProducts() {
  if (!productsContainer) return;
  productsContainer.innerHTML = '';

  products.forEach((product, index) => {
    const discountBadge = product.originalPrice > product.price 
      ? `<span style="color:#ef4444; font-size:12px; margin-left:8px; text-decoration:line-through;">₹${product.originalPrice}</span>` 
      : '';
    
    const html = `
      <div class="product-card fade-in" style="animation-delay: ${index * 0.05}s">
        <div class="product-badge">${product.badge || ''}</div>
        <img src="${resolveImagePath(product.image)}" alt="${product.name}" loading="lazy">
        <div class="product-category">${product.category}</div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-rating">⭐ ${product.rating} (${product.reviews})</div>
        <div class="product-footer">
          <div class="product-price">₹${product.price} ${discountBadge}</div>
          <button class="btn-add" onclick="addToCart(${product.id})">+</button>
        </div>
      </div>
    `;
    productsContainer.insertAdjacentHTML('beforeend', html);
  });
}

// --- Cart Functions ---

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartUI();
  
  // Visual feedback
  if(cartSidebar.classList.contains('open')) updateCartUI(); // Refresh sidebar if open
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
}

function updateQuantity(id, delta) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(id);
  } else {
    saveCart();
    updateCartUI();
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  // Badge Count
  if (cartCountEl) {
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountEl.innerText = totalQty;
  }

  // Sidebar Items
  if (cartItemsContainer) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `<div class="cart-empty">Your cart is empty.<br>Add some fresh groceries!</div>`;
      if (cartTotalPriceEl) cartTotalPriceEl.innerText = '₹0';
      return;
    }

    let totalAmount = 0;
    let html = '';
    
    cart.forEach(item => {
      totalAmount += item.price * item.quantity;
      html += `
        <div class="cart-item">
          <img src="${resolveImagePath(item.image)}" alt="${item.name}">
          <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">₹${item.price}</div>
            <div class="cart-item-qty">
              <button onclick="updateQuantity(${item.id}, -1)">-</button>
              <span>${item.quantity}</span>
              <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
          </div>
          <button class="cart-remove-btn" onclick="removeFromCart(${item.id})">✕</button>
        </div>
      `;
    });

    cartItemsContainer.innerHTML = html;
    if (cartTotalPriceEl) cartTotalPriceEl.innerText = `₹${totalAmount}`;
  }
}

// --- Event Listeners ---

if (cartSidebar && cartOverlay) {
  cartSidebar.addEventListener('transitionend', () => {
    if (!cartSidebar.classList.contains('open')) {
      cartOverlay.classList.remove('open');
      document.body.style.overflow = 'auto';
    }
  });
}

window.toggleCart = function() {
  const isOpen = cartSidebar.classList.contains('open');
  if (isOpen) {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = 'auto';
  } else {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartUI();
});