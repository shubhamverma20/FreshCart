const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();
const frontendPath = path.join(__dirname, '..', 'frontend');
const DB_RETRY_MS = Number(process.env.DB_RETRY_MS || 10000);
let isDbConnecting = false;

// Middleware
app.use(express.json());
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:1111',
    'http://127.0.0.1:1111'
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (Postman/cURL/server-to-server).
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true
    })
);
app.use(express.static(frontendPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'Pages', 'index.html'));
});

function scheduleReconnect() {
    setTimeout(() => {
        connectDatabase();
    }, DB_RETRY_MS);
}

function setupDbEventLogs() {
    mongoose.connection.on('connected', () => {
        console.log('MongoDB connection established');
    });

    mongoose.connection.on('disconnected', () => {
        console.warn(`MongoDB disconnected. Retrying in ${DB_RETRY_MS / 1000}s...`);
        scheduleReconnect();
    });

    mongoose.connection.on('error', (err) => {
        console.error(`MongoDB connection error: ${err.code || err.message}`);
    });
}

// Database connection is optional during local/dev runs.
// If Atlas DNS/SRV is blocked on the network, app still starts and retries.
async function connectDatabase() {
    if (isDbConnecting || mongoose.connection.readyState === 1) {
        return true;
    }

    if (!process.env.MONGO_URI) {
        console.warn('MONGO_URI is missing, starting without database connection');
        return false;
    }

    isDbConnecting = true;

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 7000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10
        });
        console.log('MongoDB Atlas connected');
        isDbConnecting = false;
        return true;
    } catch (err) {
        console.error('Database connection failed. Server is running without DB.');
        console.error(`Reason: ${err.code || err.message}`);
        console.warn(`Next DB retry in ${DB_RETRY_MS / 1000}s...`);
        isDbConnecting = false;
        scheduleReconnect();
        return false;
    }
}

// Basic Error Handling
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    setupDbEventLogs();
    await connectDatabase();
});