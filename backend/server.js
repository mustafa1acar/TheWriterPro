const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
console.log('Current working directory:', process.cwd());
console.log('.env file exists:', require('fs').existsSync('.env'));

require('dotenv').config();
//console.log('After dotenv config - MONGODB_URI:', process.env.MONGODB_URI);

const connectDB = require('./config/database');


// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const exerciseRoutes = require('./routes/exercises');
const progressRoutes = require('./routes/progress');
const assessmentRoutes = require('./routes/assessment');
const analysisRoutes = require('./routes/analysis');
const completedQuestionsRoutes = require('./routes/completedQuestions');
const ocrRoutes = require('./routes/ocr');

// Initialize Express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Connect to MongoDB
const initializeServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start server after database connection is established
    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, async () => {
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'https://thewriterpro.com'}`);
      
      // Ensure assessment data exists after server starts
      await ensureAssessmentData();
    });
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  }
};

// Initialize the server
initializeServer();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip analysis routes and assessment status endpoint
    const shouldSkip = req.path.startsWith('/api/analysis') || 
                      req.path === '/api/assessment/status';
    if (shouldSkip) {
      console.log(`🔄 Skipping rate limit for: ${req.path}`);
    }
    return shouldSkip;
  },
  handler: (req, res) => {
    console.log(`🚫 Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(15 * 60 / 60) // minutes
    });
  }
});

// More lenient rate limit for analysis endpoint
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 analysis requests per windowMs
  message: 'Too many analysis requests from this IP, please try again later.',
});

// Lenient rate limit for assessment routes (excluding status endpoint)
const assessmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 assessment requests per windowMs
  message: 'Too many assessment requests from this IP, please try again later.',
  skip: (req) => req.path === '/api/assessment/status' // Skip status endpoint
});

app.use('/api/', limiter);
app.use('/api/analysis', analysisLimiter);
app.use('/api/assessment', assessmentLimiter);

// CORS configuration
const corsOptions = {
      origin: process.env.FRONTEND_URL || 'https://thewriterpro.com',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// Compression middleware
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes (with /api prefix)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/completed-questions', completedQuestionsRoutes);
app.use('/api/ocr', ocrRoutes);

// API Routes (without /api prefix - for hosting platforms that strip it)

// Health check endpoint (with /api prefix)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'WriterPro API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint (without /api prefix)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'WriterPro API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to WriterPro API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      details: errors
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: `${field} already exists`
    });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Import assessment seeder
const { seedAssessment } = require('./seeders/assessmentSeeder');

// Function to ensure assessment data exists
const ensureAssessmentData = async () => {
  try {
    const Assessment = require('./models/Assessment');
    const existingAssessment = await Assessment.getLatestAssessment();
    
    if (!existingAssessment) {
      console.log('No active assessment found. Seeding assessment data...');
      await seedAssessment();
      console.log('Assessment data seeded successfully!');
    } else {
      console.log('Active assessment found in database');
    }
  } catch (error) {
    console.error('Error ensuring assessment data:', error);
  }
};



module.exports = app; 