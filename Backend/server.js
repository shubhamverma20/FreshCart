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
  process.env.CLIENT_URL, 
  'http://localhost:5500',
  'http://localhost:1111'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ DB Error:', err.message);
  }
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server listening on port ${PORT}`);
});