const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();

// Middleware
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5500',
  'http://localhost:5501',      // Live Server Default
  'http://localhost:1111',      // Your custom backend port
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501',      // 🔥 THIS WAS MISSING - Fixed this
  'http://127.0.0.1:1111',
  'https://freshcart-grocery-delivery.vercel.app',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []) 
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`); // Debugging mein help karega
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'] // 👈 Yeh line add kar dijiye
}));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is Running', timestamp: new Date() });
});

// DB Connect
async function connectDB() {
  try {
    // 🔥 Mongoose strictQuery warning hatane ke liye (optional but recommended for Mongoose 7+)
    mongoose.set('strictQuery', false); 
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ DB Error:', err.message);
    process.exit(1); // 👈 Yeh line add karni hai taaki Render app ko restart kar sake
  }
}

const PORT = process.env.PORT || 1111;

app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server listening on port ${PORT}`);
});