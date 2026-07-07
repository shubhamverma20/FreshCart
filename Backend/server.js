const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
const server = http.createServer(app);

// Middleware
// Razorpay webhook must be parsed as raw bytes to verify HMAC signature
app.use('/api/webhook/razorpay', express.raw({ type: 'application/json' }));
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5500',
  'http://localhost:5501',      // Live Server Default
  'http://localhost:1111',      // Your custom backend port
  'http://localhost:5173',      // Vite React client
  'http://localhost:5174',      // Vite React client alternative
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501',      
  'http://127.0.0.1:1111',
  'http://127.0.0.1:5173',      // Vite React client loopback
  'http://127.0.0.1:5174',      // Vite React client alternative loopback
  'https://freshcart-grocery-delivery.vercel.app',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []) 
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost or 127.0.0.1 port for development, plus specific origins
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`); // Debugging mein help karega
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'] 
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Real-time Driver Tracking Simulation
io.on('connection', (socket) => {
  console.log(`📡 Client connected: ${socket.id}`);
  
  // Simulated route coordinates (Store to Home)
  const routeCoords = [
    [19.0760, 72.8777],
    [19.0765, 72.8785],
    [19.0772, 72.8790],
    [19.0780, 72.8800],
    [19.0790, 72.8810],
    [19.0800, 72.8820],
    [19.0810, 72.8830]
  ];
  
  let currentStep = 0;

  const interval = setInterval(() => {
    if (currentStep < routeCoords.length) {
      socket.emit('driverLocationUpdate', {
        lat: routeCoords[currentStep][0],
        lng: routeCoords[currentStep][1]
      });
      currentStep++;
    } else {
      currentStep = 0; // Loop simulation
    }
  }, 3000);

  socket.on('disconnect', () => {
    console.log(`📡 Client disconnected: ${socket.id}`);
    clearInterval(interval);
  });
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 FreshCart Backend is Running!',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      auth: '/api/auth'
    }
  });
});

const webhookRoutes = require('./routes/webhook');
app.use('/api/webhook', webhookRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is Running', timestamp: new Date() });
});

// DB Connect
async function connectDB() {
  try {
    // 🔥 Mongoose strictQuery warning hatane ke liye (optional but recommended for Mongoose 7+)
    mongoose.set('strictQuery', false); 
    await mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
})
.then(() => {
    console.log('✅ MongoDB connected');
    const { initCleanupJob } = require('./controllers/orderController');
    initCleanupJob();
    console.log('✅ Inventory cleanup job initialized');
})
.catch(err => {
    console.warn('❌ MongoDB connection failed! App will run with Mock Data Mode.', err.message);
});
  } catch (err) {
    console.error('❌ DB Error:', err.message);
    console.warn('⚠️ Server will continue to run without MongoDB connection.');
  }
}

const PORT = process.env.PORT || 1111;

server.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server & Socket.io listening on port ${PORT}`);
});
// Trigger nodemon restart