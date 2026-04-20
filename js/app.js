// Mock Database for Products
const products = [
    {
        id: 1,
        name: "Fresh Organic Bananas",
        category: "Fruits",
        price: 80,
        originalPrice: 100,
        image: "https://images.unsplash.com/photo-1571501478200-8f92bd37ce52?auto=format&fit=crop&q=80&w=400",
        rating: 4.8,
        reviews: 120,
        badge: "Bestseller"
    },
    {
        id: 2,
        name: "Farm Fresh Tomatoes",
        category: "Vegetables",
        price: 45,
        originalPrice: 60,
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400",
        rating: 4.5,
        reviews: 85,
        badge: "Fresh Arrival"
    },
    {
        id: 3,
        name: "Whole Wheat Bread",
        category: "Bakery",
        price: 55,
        originalPrice: 65,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400",
        rating: 4.7,
        reviews: 230,
        badge: null
    },
    {
        id: 4,
        name: "Amul Pure Milk (1L)",
        category: "Dairy & Eggs",
        price: 66,
        originalPrice: 66,
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400",
        rating: 4.9,
        reviews: 500,
        badge: "High Demand"
    },
    {
        id: 5,
        name: "Organic Red Apples",
        category: "Fruits",
        price: 220,
        originalPrice: 250,
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?auto=format&fit=crop&q=80&w=400",
        rating: 4.6,
        reviews: 156,
        badge: "Offer"
    },
    {
        id: 6,
        name: "Green Spinach Bunch",
        category: "Vegetables",
        price: 25,
        originalPrice: 35,
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=400",
        rating: 4.3,
        reviews: 90,
        badge: null
    },
    {
        id: 7,
        name: "Free Range Eggs (6 Pcs)",
        category: "Dairy & Eggs",
        price: 60,
        originalPrice: 75,
        image: "https://images.unsplash.com/photo-1582167371270-bc11cdd4620f?auto=format&fit=crop&q=80&w=400",
        rating: 4.7,
        reviews: 310,
        badge: "Bestseller"
    },
    {
        id: 8,
        name: "Fresh Coriander Leaves",
        category: "Vegetables",
        price: 15,
        originalPrice: 25,
        image: "https://images.unsplash.com/photo-1550081699-2cb8f36c53fb?auto=format&fit=crop&q=80&w=400",
        rating: 4.4,
        reviews: 45,
        badge: null
    }
];
// Shopping Cart State
let cart = JSON.parse(localStorage.getItem('cart')) || []

// DOM Elements
const productsContainer = document.getElementById('productsContainer');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');

// Initialize App
function init() {
    if (productsContainer) renderProducts();
    updateCartUI();
}

// Render Products to DOM
function renderProducts() {
    productsContainer.innerHTML = '';

    products.forEach((product, index) => {
        // Animation delay for staggered appearance
        const delay = index * 0.1;

        const badgeHTML = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';
        const oldPriceHTML = product.originalPrice > product.price ? `<span>₹${product.originalPrice}</span>` : '';

        const productHtml = `
            <div class="product-card fade-in" style="animation-delay: ${delay}s">
                ${badgeHTML}
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    <ion-icon name="star"></ion-icon>
                    ${product.rating} <span class="rating-count">(${product.reviews})</span>
                </div>
                <div class="product-footer">
                    <div class="product-price">₹${product.price} ${oldPriceHTML}</div>
                    <button class="btn-add" onclick="addToCart(${product.id})" title="Add to Cart">
                        <ion-icon name="add-outline"></ion-icon>
                    </button>
                </div>
            </div>
        `;
        productsContainer.innerHTML += productHtml;
    });
}

// Cart Functionality
function toggleCart() {
    cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('open');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();

    // Add satisfying pop animation to cart icon
    const cartIcon = document.querySelector('.cart-btn');
    cartIcon.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 200);

    // Provide visual feedback
    const btn = event.currentTarget;
    const originalIcon = btn.innerHTML;
    btn.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon>';
    btn.style.backgroundColor = 'var(--primary-color)';
    btn.style.color = 'white';

    setTimeout(() => {
        btn.innerHTML = originalIcon;
        btn.style.backgroundColor = 'var(--surface-color)';
        btn.style.color = 'var(--primary-color)';
    }, 1000);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Total Items
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.innerText = totalItems;

    // Render Items
    if (!cartItemsContainer) return; // If on a page without cart sidebar

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); margin-top: 50px;">
                <ion-icon name="basket-outline" style="font-size: 64px; opacity: 0.5;"></ion-icon>
                <p style="margin-top: 15px;">Your cart is empty.</p>
            </div>
        `;
    } else {
        cart.forEach(item => {
            cartItemsContainer.innerHTML += `
                <div class="cart-item fade-in">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">₹${item.price}</div>
                        <div class="cart-item-qty">
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="close-cart" style="font-size: 18px;" onclick="removeFromCart(${item.id})">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </div>
            `;
        });
    }

    // Total Price
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalPrice) cartTotalPrice.innerText = `₹${total}`;
}

// Run init on load
document.addEventListener('DOMContentLoaded', init);
