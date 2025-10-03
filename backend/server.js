const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectToDatabase = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const imageRoutes = require('./routes/images');
const transformationRoutes = require('./routes/transformations');
const webhookRoutes = require('./routes/webhooks');
const transactionRoutes = require('./routes/transactions');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https:", "http:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, process.env.RENDER_EXTERNAL_URL]
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to database
connectToDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/transformations', transformationRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the public directory
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Imaginify API Server', 
      docs: '/api/health',
      frontend: process.env.FRONTEND_URL || 'http://localhost:5173'
    });
  });
}

// Error handling middleware
app.use(errorHandler);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Serving frontend from /public`);
  } else {
    console.log(`🌐 Frontend should be running on: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  }
});

module.exports = app;
