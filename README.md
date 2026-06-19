# 🛒 FreshCart - Fresh Groceries Delivered Fast

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/status-Fullstack%20Complete-green)]()
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000.svg)](https://freshcart-grocery-delivery.vercel.app/)
[![Backend on Render](https://img.shields.io/badge/Backend-Render-46E3B7.svg)](https://freshcart-dewk.onrender.com)

**FreshCart** is a modern, full-stack grocery delivery web application designed to bring fresh groceries to your doorstep with a seamless shopping experience. Built with a stunning glassmorphism UI, smart state management, and a production-ready MERN stack architecture.

🔗 **Live Demo:** https://freshcart-grocery-delivery.vercel.app/  
📂 **Repository:** https://github.com/shubhamverma20/FreshCart

---

## ✨ Features

### 🎨 **Modern UI/UX**
- **Glassmorphism Design**: Elegant backdrop blur, semi-transparent surfaces, and soft shadows
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Fade-ins, hover effects, floating hero image, and animated delivery tracker
- **Smart Environment Detection**: Automatically switches between localhost and production API endpoints

### 🛍️ **Shopping Experience**
- **Dynamic Product Catalog**: Fetches fresh items from MongoDB via REST API
- **Interactive Shopping Cart**: Slide-out sidebar with real-time quantity updates & persistence
- **Streamlined Checkout**: Multi-step form with delivery address, Razorpay Payment Gateway, and COD
- **Order Success Flow**: Animated confirmation overlay with auto-cart clearing

### 📦 **Order Tracking & Admin**
- **Live Delivery Tracking**: Map with animated delivery marker, pulse effects, and timeline status
- **Admin Dashboard**: Sales stats, active orders, stock alerts, and delivery team overview
- **Order Management**: Real-time management of orders and product statuses

### 🔐 **Authentication & Security**
- **Firebase Auth**: Google, Facebook, and Phone Number (OTP) sign-in
- **JWT & MongoDB Sync**: Secure backend session management synced with Firebase
- **CORS Protection**: Environment-based origin validation for API security

---

## 🛠️ Tech Stack

| Layer        | Technologies |
|--------------|--------------|
| **Frontend** | React, Vite, Context API, CSS3 (Glassmorphism), Ionicons |
| **Backend**  | Node.js, Express.js, MongoDB, Mongoose |
| **Auth**     | Firebase Auth, JWT |
| **Payments** | Razorpay SDK |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## 📂 Project Structure

```
FreshCart/
├── backend/
│   ├── controllers/            # API logic (orders, products, auth)
│   ├── models/                 # Mongoose schemas (User, Product, Order)
│   ├── routes/                 # Express API routes
│   ├── services/               # Email and other third-party services
│   ├── server.js               # Express app, CORS, DB connection setup
│   └── package.json
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── context/            # Global state (AuthContext, CartContext)
│   │   ├── pages/              # Page views (Home, Checkout, Admin, etc.)
│   │   ├── firebase/           # Firebase initialization
│   │   ├── App.jsx             # Main routing logic
│   │   └── main.jsx            # React entry point
│   ├── index.html              # Vite HTML template
│   ├── vite.config.js          # Vite configuration
│   └── package.json
├── vercel.json                 # Vercel deployment rewrites
├── README.md
└── LICENSE
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Firebase Project setup
- Razorpay Test Account

### 1. Backend Setup
```bash
cd backend
npm install

# Create .env file with the required variables:
echo MONGO_URI=your_mongodb_uri > .env
echo JWT_SECRET=your_super_secret_key >> .env
echo PORT=1111 >> .env
echo CLIENT_URL=http://localhost:5173 >> .env
echo RAZORPAY_KEY_ID=your_razorpay_key_id >> .env
echo RAZORPAY_KEY_SECRET=your_razorpay_key_secret >> .env

npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create .env file for Vite API config:
echo VITE_API_BASE=http://localhost:1111 > .env

npm run dev
```

> 💡 The frontend automatically detects the environment and routes API calls to the defined `VITE_API_BASE` or falls back to production endpoints.

---

## 🚧 Development Status & Roadmap

| Module          | Status        | Notes                                  |
|-----------------|---------------|----------------------------------------|
| UI/UX Design    | ✅ Complete   | Fully implemented React components     |
| Frontend Logic  | ✅ Complete   | Context providers configured           |
| Backend API     | ✅ Complete   | REST endpoints and DB connected        |
| Auth Flow       | ✅ Complete   | Firebase integrated with Backend sync  |
| Payment Gateway | ✅ Complete   | Razorpay end-to-end integration added  |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Shubham Verma**  
🔗 GitHub: [@shubhamverma20](https://github.com/shubhamverma20)  
📧 Email: shubhamverma0299@gmail.com  

---

⭐ *If you found this project helpful or inspiring, consider giving it a star on GitHub!*