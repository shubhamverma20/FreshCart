// 🌍 Smart Environment Detection
// Automatically decide based on hostname whether we are on localhost or deployed (Vercel)
const IS_PRODUCTION = window.location.hostname.includes('localhost') || 
                      window.location.hostname.includes('127.0.0.1') ? false : true;

// 👉 INSTRUCTION: Yahan apna Render Backend URL daalein jo production me use hona hai
const PRODUCTION_API_URL = "https://freshcart-dewk.onrender.com"; 

// Decide API Base
const API_BASE = IS_PRODUCTION ? PRODUCTION_API_URL : 'http://localhost:1111';
console.log(`[System]: Detected ${IS_PRODUCTION ? 'Production Mode' : 'Development Mode'} -> Connecting to: ${API_BASE}`);

// --- State Management ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// --- DOM Elements Cache ---
const productsContainer = document.getElementById('productsContainer');
const cartCountEl = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalPriceEl = document.getElementById('cartTotalPrice');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');

// 🔥 Load Products from API
async function loadProducts() {
  showLoading(true);
  try {
    const response = await fetch(`${API_BASE}/api/products`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    productsContainer.innerHTML = `<div class="empty-state">⚠️ Failed to load products. Please refresh later.</div>`;
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  if (productsContainer) {
    productsContainer.innerHTML = show 
      ? '<div class="loading-grid"><p>Loading Fresh Items...</p></div>' 
      : '';
  }
}

// ✅ Asset Path Resolver (Handles Localhost & Production seamlessly)
function resolveImagePath(imagePath) {
  if (!imagePath) return '';
  
  // Ensure path starts with /
  let path = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // In Production (Vercel), assets are served from the root of the domain
  if (IS_PRODUCTION) return path;

  // In Localhost (Live Server):
  // Assuming assets folder is in the same root directory as index.html (frontend/)
  return path;
}

// --- Rendering Functions ---

function renderProducts() {
  if (!productsContainer) return;
  productsContainer.innerHTML = '';

  products.forEach((product, index) => {
    const delay = index * 0.1;
    const discountBadge = product.originalPrice && product.originalPrice > product.price 
      ? `<span style="color:#ef4444; font-size:12px; margin-left:8px; text-decoration:line-through;">₹${product.originalPrice}</span>` 
      : '';

    // Generate Product Card HTML
    const productCard = `
      <div class="product-card fade-in" style="animation-delay: ${delay}s">
        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
        <img src="${resolveImagePath(product.image)}" class="product-image" alt="${product.name}" loading="lazy">
        <div class="product-category">${product.category}</div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-rating">⭐ ${product.rating} (${product.reviews})</div>
        <div class="product-footer">
          <div class="product-price">₹${product.price} ${discountBadge}</div>
          <button class="btn-add" onclick="addToCart(${product.id})">+</button>
        </div>
      </div>
    `;
    productsContainer.insertAdjacentHTML('beforeend', productCard);
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
  openCartSidebar(); // Auto-open cart on add
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
  // Update Badge Count
  if (cartCountEl) {
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountEl.innerText = totalQty;
  }

  // Update Sidebar Content
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<div class="cart-empty">Your cart is empty.<br>Add some fresh groceries!</div>`;
    if (cartTotalPriceEl) cartTotalPriceEl.innerText = '₹0';
    return;
  }

  let html = '';
  let totalAmount = 0;
  
  cart.forEach(item => {
    totalAmount += item.price * item.quantity;
    html += `
      <div class="cart-item fade-in">
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

// --- UI Toggles ---

function toggleCart() {
  if (!cartSidebar || !cartOverlay) return;
  const isOpen = cartSidebar.classList.contains('open');
  
  if (isOpen) {
    closeCartSidebar();
  } else {
    openCartSidebar();
  }
}

function openCartSidebar() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = 'auto';
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartUI();
});