const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();

// --- Middleware ---

// 1. Parse JSON Requests
app.use(express.json());

// 2. Configurable CORS
// Yeh logic dev (localhost) aur prod (Verce/Render) dono ke liye chalega.
const devOrigins = [
  'http://localhost:5500', 
  'http://localhost:1111', 
  'http://localhost:3000', 
  'http://127.0.0.1:5500', 
  'http://127.0.0.1:1111'
];

const allowedOrigins = [
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []), // Production Domain
  ...devOrigins // Local Development Domains
].filter(Boolean); // Removes null/undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS Blocked: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    optionsSuccessStatus: 200,
    credentials: true
  })
);

// --- Routes ---

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health Check Route (Useful for uptime monitors)
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is Running', timestamp: new Date() });
});

// Database Connection Logic (Retries on failure)
function scheduleReconnect(retryCount = 0) {
  setTimeout(() => {
    connectDatabase();
  }, 10000); // Retry every 10 seconds
}

async function connectDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  if (!process.env.MONGO_URI) {
    console.warn('Warning: MONGO_URI not found in environment.');
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    scheduleReconnect();
  }
}

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  setupEventLogs();
  await connectDatabase();
});

function setupEventLogs() {
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB Error:', err);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB Disconnected. Retrying...');
  });
}