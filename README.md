# 🛒 FreshCart - Fresh Groceries Delivered Fast

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/status-UI%20Complete%20%7C%20Backend%20In%20Progress-blue)]()
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
- **Dynamic Product Catalog**: Fetches fresh items from REST API with loading states
- **Interactive Shopping Cart**: Slide-out sidebar with real-time quantity updates & localStorage persistence
- **Streamlined Checkout**: Multi-step form with delivery address, multiple payment methods (UPI/Card/COD)
- **Order Success Flow**: Animated confirmation overlay with auto-cart clearing

### 📦 **Order Tracking & Admin**
- **Live Delivery Tracking**: Mock map with animated delivery marker, pulse effects, and timeline status
- **Admin Dashboard**: Sales stats, active orders, stock alerts, and delivery team overview
- **Order Management Table**: Filterable orders with status badges (Processing, Out for Delivery, Delivered)

### 🔐 **Authentication & Security**
- JWT-based login/signup flow
- Password hashing with `bcryptjs`
- CORS-protected backend with environment-based origin validation

---

## 🛠️ Tech Stack

| Layer        | Technologies |
|--------------|--------------|
| **Frontend** | HTML5, CSS3 (Glassmorphism), Vanilla JavaScript (ES6+), Ionicons |
| **Backend**  | Node.js, Express.js, MongoDB, Mongoose |
| **Auth**     | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`) |
| **State**    | `localStorage` + Custom Cart Context Pattern |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## 📂 Project Structure

```
FreshCart/
├── Backend/
│   ├── models/User.js          # Mongoose user schema
│   ├── routes/
│   │   ├── auth.js             # JWT signup/login routes
│   │   └── products.js         # Mock product API with cache control
│   ├── server.js               # Express app, CORS, DB connection
│   └── package.json
├── frontend/
│   ├── assets/images/          # Product & UI images
│   ├── css/style.css           # Global styles, glassmorphism, responsive breakpoints
│   ├── js/
│   │   ├── app.js              # Core logic: API fetch, cart management, UI rendering
│   │   └── CartContext.jsx     # React-style context pattern (standalone ready)
│   ├── index.html              # Homepage with hero, categories, products
│   ├── cart.html               # Checkout page with payment & summary
│   ├── delivery.html           # Live tracking with animated map & timeline
│   ├── admin.html              # Dashboard with stats & order table
│   └── login.html              # Auth page with social/OTP placeholders
├── .gitignore
├── LICENSE
├── README.md
└── vercel.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)
- npm or yarn

### 1. Backend Setup
```bash
cd Backend
npm install

# Create .env file
echo MONGO_URI=your_mongodb_uri > .env
echo JWT_SECRET=your_super_secret_key >> .env
echo PORT=5000 >> .env
echo CLIENT_URL=https://freshcart-grocery-delivery.vercel.app >> .env

npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
# No build step required. Open index.html directly or use Live Server:
npx live-server --port=5500
```

> 💡 The frontend automatically detects the environment and routes API calls to `localhost:1111` or your Render backend.

---

## 📡 API Endpoints

| Method | Endpoint         | Description                     |
|--------|------------------|---------------------------------|
| `POST` | `/api/auth/signup` | Register new user (JWT + bcrypt) |
| `POST` | `/api/auth/login`  | Authenticate & return JWT       |
| `GET`  | `/api/products`    | Fetch product catalog (no-cache)|
| `GET`  | `/api/health`      | Server status check             |

---

## 🚧 Development Status & Roadmap

| Module          | Status        | Notes                                  |
|-----------------|---------------|----------------------------------------|
| UI/UX Design    | ✅ Complete   | Glassmorphism, responsive, animations  |
| Frontend Logic  | ✅ Complete   | Cart, checkout, tracking, admin mock   |
| Backend API     | 🟡 In Progress| Routes ready, DB integration pending   |
| Auth Flow       | 🟡 In Progress| JWT structure ready, frontend binding  |
| Payment Gateway | 🔜 Upcoming   | Razorpay/Stripe integration planned    |
| Real DB Sync    | 🔜 Upcoming   | Replace mock products with MongoDB     |

> 📌 **Current Focus:** Connecting frontend to live MongoDB, finalizing auth flow, and adding payment processing.

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