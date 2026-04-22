const express = require('express');
const router = express.Router();

// 🔥 FIX: Disable Caching agar chahiye toh yeh lines add kar do taaki har baar fresh data mile
router.get('/', (req, res) => {
    // Ye line browser ko rok ti hai ki wo purana data use kare
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json([
        {
            id: 1,
            name: "Fresh Organic Bananas",
            category: "Fruits",
            price: 80,
            originalPrice: 100,
            image: "/assets/images/bananas.png",
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
            image: "/assets/images/tomatoes.png",
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
            image: "/assets/images/bread.png",
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
            image: "/assets/images/milk.png",
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
            image: "/assets/images/apples.png",
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
            image: "/assets/images/spinach.png",
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
            image: "/assets/images/eggs.png",
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
            image: "/assets/images/spinach.png",
            rating: 4.4,
            reviews: 45,
            badge: null
        },

        // 🔥 NEW ITEMS

        {
            id: 9,
            name: "Dairy Milk Chocolate",
            category: "Snacks",
            price: 40,
            originalPrice: 50,
            image: "/assets/images/chocolate.png.jpg",
            rating: 4.7,
            reviews: 200,
            badge: "Popular"
        },
        {
            id: 10,
            name: "Lays Classic Chips",
            category: "Snacks",
            price: 20,
            originalPrice: 25,
            image: "/assets/images/lays chips.png.jpg",
            rating: 4.5,
            reviews: 150,
            badge: null
        },
        {
            id: 11,
            name: "Coca Cola (500ml)",
            category: "Beverages",
            price: 40,
            originalPrice: 45,
            rating: 4.6,
            reviews: 300,
            badge: "Trending"
        },
        {
            id: 12,
            name: "Kurkure Masala Munch",
            category: "Snacks",
            price: 20,
            originalPrice: 25,
            image: "/assets/images/Kurkure.jpg",
            rating: 4.4,
            reviews: 112,
            badge: "New"
        },
        {
            id: 13,
            name: "Amul Cool",
            category: "Beverages",
            price: 30,
            originalPrice: 35,
            image: "/assets/images/amul kool.jpg",
            rating: 4.5,
            reviews: 87,
            badge: null
        },
        {
            id: 14,
            name: "Lemon Juice",
            category: "Beverages",
            price: 20,
            originalPrice: 25,
            image: "/assets/images/lemon juice.jpg",
            rating: 4.3,
            reviews: 76,
            badge: "Fresh"
        },
        {
            id: 15,
            name: "Amul Butter",
            category: "Dairy & Eggs",
            price: 25,
            originalPrice: 30,
            image: "/assets/images/amul butter.jpg",
            rating: 4.7,
            reviews: 64,
            badge: null
        },
        {
            id: 16,
            name: "Maggi Noodles",
            category: "Snacks",
            price: 15,
            originalPrice: 20,
            image: "/assets/images/Maggi.jpg",
            rating: 4.6,
            reviews: 211,
            badge: "Popular"
        },
        {
            id: 17,
            name: "Maaza Drink",
            category: "Beverages",
            price: 35,
            originalPrice: 40,
            image: "/assets/images/Maaza.jpg",
            rating: 4.4,
            reviews: 102,
            badge: null
        },
        {
            id: 18,
            name: "Jems Pack",
            category: "Snacks",
            price: 90,
            originalPrice: 100,
            image: "/assets/images/Jems.jpg",
            rating: 4.2,
            reviews: 80,
            badge: null
        },
        {
            id: 19,
            name: "Kinder Joy",
            category: "Snacks",
            price: 55,
            originalPrice: 60,
            image: "/assets/images/Kinder joy.jpg",
            rating: 4.6,
            reviews: 98,
            badge: "Kids Favorite"
        },
        {
            id: 20,
            name: "Vanilla Ice Cream Cup",
            category: "Dairy & Eggs",
            price: 30,
            originalPrice: 35,
            image: "/assets/images/icecream.jpg",
            rating: 4.5,
            reviews: 74,
            badge: null
        },
        {
            id: 21,
            name: "Fanta",
            category: "Beverages",
            price: 40,
            originalPrice: 45,
            image: "/assets/images/Fanta.jpg",
            rating: 4.3,
            reviews: 66,
            badge: null
        },
        {
            id: 22,
            name: "Coca Cola Bottle",
            category: "Beverages",
            price: 45,
            originalPrice: 50,
            image: "/assets/images/cococola.png.jpg",
            rating: 4.4,
            reviews: 91,
            badge: "Chilled"
        },
        {
            id: 23,
            name: "Child Beer Malt Drink",
            category: "Beverages",
            price: 160,
            originalPrice: 150,
            image: "/assets/images/Child Beer.jpg",
            rating: 4.1,
            reviews: 38,
            badge: null
        },
        {
            id: 24,
            name: "Coca Cola Can Pack",
            category: "Beverages",
            price: 120,
            originalPrice: 140,
            image: "/assets/images/Coca Cola Can Mixed Tray 330ml 24 Pack.jpg",
            rating: 4.5,
            reviews: 57,
            badge: "Party Pack"
        },
        {
            id: 25,
            name: "Biscuit",
            category: "Snacks",
            price: 20,
            originalPrice: 15,
            image: "/assets/images/Tiger Biscuit.jpg",
            rating: 4.1,
            reviews: 34,
            badge: null
        }
    ]);
});

module.exports = router;