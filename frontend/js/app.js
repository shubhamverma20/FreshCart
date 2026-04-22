// Backend URL
// If page is opened via Live Server (5500 etc.), use backend at 1111.
const BASE_URL = window.location.port === '1111'
  ? window.location.origin
  : 'http://localhost:1111';

function resolveImagePath(imagePath) {
  if (!imagePath) return '';

  // Always load API-provided assets from backend origin.
  // This keeps images working on both backend-hosted and Live Server pages.
  if (imagePath.startsWith('/assets/')) return `${BASE_URL}${imagePath}`;

  return imagePath;
}

// Products data (empty initially)
let products = [];

// Cart state
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const productsContainer = document.getElementById('productsContainer');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');

// 🔥 Fetch products from backend
function loadProducts() {
  fetch(`${BASE_URL}/api/products`)
    .then(res => res.json())
    .then(data => {
      products = data;
      renderProducts();
    })
    .catch(err => console.log("Error:", err));
}

function toggleCart() {
  if (!cartSidebar || !cartOverlay) return;
  cartSidebar.classList.toggle('open');
  cartOverlay.classList.toggle('open');
}

// Initialize App
function init() {
  loadProducts();   // 👈 backend call
  updateCartUI();
}

// Render Products
function renderProducts() {
  if (!productsContainer) return;

  productsContainer.innerHTML = '';

  products.forEach((product, index) => {
    const delay = index * 0.1;

    const badgeHTML = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';
    const oldPriceHTML = product.originalPrice > product.price ? `<span>₹${product.originalPrice}</span>` : '';

    const productHtml = `
      <div class="product-card fade-in" style="animation-delay: ${delay}s">
        ${badgeHTML}
        <img src="${resolveImagePath(product.image)}" class="product-image" alt="${product.name}">
        <div class="product-category">${product.category}</div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-rating">
          ⭐ ${product.rating} (${product.reviews})
        </div>
        <div class="product-footer">
          <div class="product-price">₹${product.price} ${oldPriceHTML}</div>
          <button class="btn-add" onclick="addToCart(${product.id})" aria-label="Add ${product.name} to cart">+</button>
        </div>
      </div>
    `;

    productsContainer.innerHTML += productHtml;
  });
}

// Cart Functions
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateQuantity(productId, delta) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
    updateCartUI();
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.innerText = totalItems;

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty. Add fresh items to continue.</div>';
  } else {
    cartItemsContainer.innerHTML = '';
  }

  cart.forEach((item) => {
    cartItemsContainer.innerHTML += `
      <div class="cart-item">
        <img src="${resolveImagePath(item.image)}" class="cart-item-img" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">₹${item.price}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            <button class="cart-remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
          </div>
        </div>
      </div>
    `;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (cartTotalPrice) cartTotalPrice.innerText = `₹${total}`;
}

// Init app
document.addEventListener('DOMContentLoaded', init);