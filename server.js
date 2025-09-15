const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');
const path = require('path');
const dotenv = require('dotenv');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
const uploadRoutes = require('./routes/upload');
const paymentRoutes = require('./routes/payment');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const loggerMiddleware = require('./middleware/logger');

// Import services
const DatabaseService = require('./services/DatabaseService');
const RedisService = require('./services/RedisService');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Initialize i18next
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['ar', 'en'],
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json')
    },
    detection: {
      order: ['querystring', 'cookie', 'header'],
      caches: ['cookie']
    },
    interpolation: {
      escapeValue: false
    }
  });

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.gemini.com", "https://financialmodelingprep.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

app.use(limiter);
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ?
    ['https://finclick.ai', 'https://www.finclick.ai'] :
    ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// i18next middleware
app.use(i18nextMiddleware.handle(i18next));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'finclick-ai-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/finclick-ai'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Custom middleware
app.use(loggerMiddleware(logger));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', authMiddleware.authenticate, analysisRoutes);
app.use('/api/upload', authMiddleware.authenticate, uploadRoutes);
app.use('/api/payment', authMiddleware.authenticate, paymentRoutes);
app.use('/api/dashboard', authMiddleware.authenticate, dashboardRoutes);
app.use('/api/admin', authMiddleware.authenticateAdmin, adminRoutes);
app.use('/api', apiRoutes);

// Main application routes
app.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'FinClick.AI - Revolutionary Intelligent Financial Analysis Platform',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/dashboard', authMiddleware.authenticate, (req, res) => {
  res.render('pages/dashboard', {
    title: 'Dashboard - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/login', (req, res) => {
  res.render('pages/login', {
    title: 'Login - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/register', (req, res) => {
  res.render('pages/register', {
    title: 'Register - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/admin', authMiddleware.authenticateAdmin, (req, res) => {
  res.render('pages/admin', {
    title: 'Admin Panel - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

// Legal pages routes
app.get('/privacy', (req, res) => {
  res.render('pages/privacy', {
    title: 'Privacy Policy - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/terms', (req, res) => {
  res.render('pages/terms', {
    title: 'Terms of Use - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/security', (req, res) => {
  res.render('pages/security', {
    title: 'Security Policy - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/terms-of-use', (req, res) => {
  res.render('pages/terms-of-use', {
    title: 'Terms of Use - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/security-policy', (req, res) => {
  res.render('pages/security-policy', {
    title: 'Security Policy - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/compliance-policy', (req, res) => {
  res.render('pages/compliance-policy', {
    title: 'Compliance Policy - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/ip-policy', (req, res) => {
  res.render('pages/ip-policy', {
    title: 'Intellectual Property Policy - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/payment-policy', (req, res) => {
  res.render('pages/payment-policy', {
    title: 'Payment Policy - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/company-info', (req, res) => {
  res.render('pages/company-info', {
    title: 'Company Information - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/user-guide', (req, res) => {
  res.render('pages/user-guide', {
    title: 'User Guide - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

app.get('/other-policies', (req, res) => {
  res.render('pages/other-policies', {
    title: 'Other Policies - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).render('pages/404', {
    title: 'Page Not Found - FinClick.AI',
    user: req.user,
    language: req.language || 'en',
    t: req.t
  });
});

// Initialize services
async function initializeServices() {
  try {
    // Connect to MongoDB
    await DatabaseService.connect();
    logger.info('MongoDB connected successfully');

    // Connect to Redis
    await RedisService.connect();
    logger.info('Redis connected successfully');

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`FinClick.AI server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        DatabaseService.disconnect();
        RedisService.disconnect();
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start the application
initializeServices();

module.exports = app;