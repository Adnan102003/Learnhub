const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Sanitize data (prevent NoSQL injection)
app.use(mongoSanitize());

// Enable CORS
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001'
  ],
  credentials: true
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/courses/:courseId/lessons', require('./routes/lessons'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));

// File upload routes
const { uploadImage, uploadVideo, uploadDocument } = require('./middleware/upload');

app.post('/api/upload/image', uploadImage.single('image'), (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        url: req.file.path,
        public_id: req.file.filename
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

app.post('/api/upload/video', uploadVideo.single('video'), (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        url: req.file.path,
        public_id: req.file.filename,
        duration: req.file.duration
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

app.post('/api/upload/document', uploadDocument.single('document'), (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        url: req.file.path,
        public_id: req.file.filename,
        name: req.file.originalname
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'LearnHub API v1.0 - Complete E-Learning Platform',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      enrollments: '/api/enrollments',
      progress: '/api/progress',
      quizzes: '/api/quizzes',
      reviews: '/api/reviews',
      notes: '/api/notes',
      certificates: '/api/certificates',
      analytics: '/api/analytics',
      admin: '/api/admin',
      upload: '/api/upload',
      docs: 'Coming soon'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV
  });
});

// API documentation route placeholder
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    note: 'Full documentation coming soon. Use Postman collection for now.',
    postman: 'Import the LearnHub_Postman_Collection.json file'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    requestedUrl: req.originalUrl
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║          🚀 LearnHub API Server v1.0              ║
║          Complete E-Learning Platform             ║
║                                                    ║
║   Environment: ${process.env.NODE_ENV ? process.env.NODE_ENV.padEnd(10) : 'development'}                           ║
║   Port: ${PORT}                                      ║
║   URL: http://localhost:${PORT}                     ║
║   Health: http://localhost:${PORT}/health           ║
║                                                    ║
║   📚 Modules Active:                               ║
║   ✅ Module 1: Authentication & Users             ║
║   ✅ Module 2: Course Management                  ║
║   ✅ Module 3: Video Player & Progress            ║
║   ✅ Module 4: Quiz & Assessments                 ║
║   ✅ Module 5: Enrollments & Student Portal       ║
║   ✅ Module 6: Analytics & Reports                ║
║   ✅ Module 7: Admin Panel                        ║
║                                                    ║
╚════════════════════════════════════════════════════╝
  `.cyan.bold);
  
  console.log(`📝 To seed database with test data, run: npm run seed`.yellow);
  console.log(`📮 API Documentation: http://localhost:${PORT}/api/docs`.green);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`.red.bold);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});