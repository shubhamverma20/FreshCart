const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const upload = require('../middleware/upload'); 
const Product = require('../models/Product');

// Yeh aapka updated Cloudinary Base URL hai
const CLOUDINARY_BASE = "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/";

// GET ALL PRODUCTS
router.get('/', async (req, res) => {
    try {
        let dbProducts = [];
        if (mongoose.connection.readyState === 1) {
            dbProducts = await Product.find().maxTimeMS(2000);
        } else {
            console.warn("[Backend]: Database is not connected. Serving static fallback products instantly.");
        }

        const staticProducts = [
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
            { id: 21, name: "Fanta", category: "Beverages", category: "Beverages", price: 40, originalPrice: 45, image: CLOUDINARY_BASE + "Fanta.jpg", rating: 4.3, reviews: 66, badge: null },
            { id: 22, name: "Coca Cola Bottle", category: "Beverages", price: 45, originalPrice: 50, image: CLOUDINARY_BASE + "cococola.png.jpg", rating: 4.4, reviews: 91, badge: "Chilled" },
            { id: 23, name: "Child Beer Malt Drink", category: "Beverages", price: 160, originalPrice: 150, image: CLOUDINARY_BASE + "Child%20Beer.jpg", rating: 4.1, reviews: 38, badge: null },
            { id: 24, name: "Coca Cola Can Pack", category: "Beverages", price: 120, originalPrice: 140, image: CLOUDINARY_BASE + "Coca%20Cola%20Can%20Mixed%20Tray%20330ml%2024%20Pack.jpg", rating: 4.5, reviews: 57, badge: "Party Pack" },
            { id: 25, name: "Tiger Biscuit", category: "Snacks", price: 20, originalPrice: 15, image: CLOUDINARY_BASE + "Tiger%20Biscuit.jpg", rating: 4.1, reviews: 34, badge: null }
        ];

        res.json([...dbProducts, ...staticProducts]);
    } catch (err) {
        console.error("Database fetch failed, serving static products only.");
        const staticProducts = [
            { id: 1, name: "Fresh Organic Bananas", category: "Fruits", price: 80, originalPrice: 100, image: "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/bananas.png", rating: 4.8, reviews: 120, badge: "Bestseller" },
            { id: 2, name: "Farm Fresh Tomatoes", category: "Vegetables", price: 45, originalPrice: 60, image: "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/tomatoes.png", rating: 4.5, reviews: 85, badge: "Fresh Arrival" },
            { id: 3, name: "Whole Wheat Bread", category: "Bakery", price: 55, originalPrice: 65, image: "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/bread.png", rating: 4.7, reviews: 230, badge: null },
            { id: 4, name: "Amul Pure Milk (1L)", category: "Dairy & Eggs", price: 66, originalPrice: 66, image: "https://res.cloudinary.com/drscamscp/image/upload/q_auto,f_auto/FreshCart_Products/milk.png", rating: 4.9, reviews: 500, badge: "High Demand" }
        ];
        res.json(staticProducts);
    }
});

// ADD NEW PRODUCT (CLOUDINARY)
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, originalPrice, badge } = req.body;
        const newProduct = new Product({
            name,
            price,
            category,
            originalPrice: originalPrice ? Number(originalPrice) : undefined,
            badge: badge || null,
            image: req.file ? req.file.path : CLOUDINARY_BASE + "default.png" 
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error("Add Product Error:", err);
        res.status(500).json({ message: "Upload failed!" });
    }
});

// DELETE PRODUCT
router.delete('/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({ message: "Mock product deleted (Database offline)" });
        }
        
        // Check if ID is numeric (static fallback products)
        if (!isNaN(req.params.id)) {
            return res.status(200).json({ message: "Static product removed from display (Mock)" });
        }

        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found!" });
        }
        res.status(200).json({ message: "Product deleted successfully!" });
    } catch (err) {
        console.error("Delete Product Error:", err);
        res.status(500).json({ message: "Failed to delete product!" });
    }
});

module.exports = router;