require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Database connection for Vercel serverless functions
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      bufferMaxEntries: 0
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

// CORS configuration for Vercel
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-frontend-domain.vercel.app',
        'https://assess-sight-frontend.vercel.app',
        /\.vercel\.app$/
      ] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database connection middleware for each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(503).json({ 
      message: 'Database connection unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbStates[dbStatus] || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    vercel: !!process.env.VERCEL
  });
});

// Mount routers
const scanRouter = require('./scan');
const historyRouter = require('./history');
const authRouter = require('./auth');

app.use('/api/scan', scanRouter);
app.use('/api/history', historyRouter);
app.use('/api/auth', authRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });
  
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl 
  });
});

// For Vercel serverless functions, export the app
// For local development, start the server
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
