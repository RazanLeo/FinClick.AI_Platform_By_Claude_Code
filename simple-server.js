const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const dotenv = require('dotenv');
const winston = require('winston');
const expressLayouts = require('express-ejs-layouts');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"]
    }
  }
}));

// Basic middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Basic routes
app.get('/', (req, res) => {
  try {
    res.render('pages/index', {
      title: 'FinClick.AI - منصة التحليل المالي الذكي',
      language: 'ar',
      user: null
    });
  } catch (error) {
    logger.error('Error rendering homepage:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: 'Internal server error'
    });
  }
});

app.get('/dashboard', (req, res) => {
  try {
    res.render('pages/dashboard', {
      title: 'لوحة التحكم - FinClick.AI',
      language: 'ar',
      user: {
        name: 'مستخدم تجريبي',
        email: 'demo@finclick.ai',
        subscription: 'premium'
      },
      t: function(key) {
        const translations = {
          'navigation.dashboard': 'لوحة التحكم',
          'navigation.new_analysis': 'تحليل جديد',
          'navigation.reports': 'التقارير',
          'navigation.history': 'السجلات',
          'navigation.settings': 'الإعدادات',
          'navigation.profile': 'الملف الشخصي',
          'dashboard.welcome': 'مرحباً',
          'dashboard.premium_user': 'مستخدم مميز',
          'dashboard.quick_stats': 'إحصائيات سريعة',
          'dashboard.analyses_completed': 'تحليل مكتمل',
          'dashboard.reports_generated': 'تقرير مُولد',
          'dashboard.accuracy_rate': 'معدل الدقة'
        };
        return translations[key] || key;
      }
    });
  } catch (error) {
    logger.error('Error rendering dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: 'Internal server error'
    });
  }
});

app.get('/admin', (req, res) => {
  try {
    res.render('pages/admin-dashboard', {
      title: 'لوحة تحكم المدير - FinClick.AI',
      language: 'ar',
      user: {
        name: 'Razan Ahmed',
        email: 'Razan@FinClick.AI',
        role: 'admin'
      },
      t: function(key) {
        const translations = {
          'admin.welcome': 'مرحباً بك في لوحة تحكم المدير',
          'admin.total_users': 'إجمالي المستخدمين',
          'admin.active_subscriptions': 'اشتراكات نشطة',
          'admin.monthly_revenue': 'الإيرادات الشهرية',
          'admin.system_health': 'صحة النظام'
        };
        return translations[key] || key;
      }
    });
  } catch (error) {
    logger.error('Error rendering admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: 'Internal server error'
    });
  }
});

app.get('/guest', (req, res) => {
  try {
    res.render('pages/guest-dashboard', {
      title: 'لوحة الضيوف - FinClick.AI',
      language: 'ar',
      user: {
        name: 'ضيف',
        email: 'Guest@FinClick.AI',
        role: 'guest'
      },
      t: function(key) {
        const translations = {
          'guest.welcome': 'مرحباً بك في FinClick.AI',
          'guest.demo_features': 'المميزات التجريبية',
          'guest.upgrade_now': 'ترقية الآن',
          'guest.free_tools': 'أدوات مجانية'
        };
        return translations[key] || key;
      }
    });
  } catch (error) {
    logger.error('Error rendering guest dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: 'Internal server error'
    });
  }
});

app.get('/free-tools', (req, res) => {
  try {
    res.render('pages/free-tools', {
      title: 'الأدوات المجانية - FinClick.AI',
      language: 'ar',
      user: null
    });
  } catch (error) {
    logger.error('Error rendering free tools page:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: 'Internal server error'
    });
  }
});

app.get('/about', (req, res) => {
  try {
    res.render('pages/about', {
      title: 'من نحن - FinClick.AI',
      language: 'ar',
      user: null
    });
  } catch (error) {
    logger.error('Error rendering about page:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: 'Internal server error'
    });
  }
});

app.get('/services', (req, res) => {
  try {
    res.render('pages/services', {
      title: 'خدماتنا - FinClick.AI',
      language: 'ar',
      user: null
    });
  } catch (error) {
    logger.error('Error rendering services page:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: 'Internal server error'
    });
  }
});

app.get('/privacy', (req, res) => {
  try {
    res.render('pages/privacy', {
      title: 'سياسة الخصوصية - FinClick.AI',
      language: 'ar',
      user: null
    });
  } catch (error) {
    logger.error('Error rendering privacy page:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: 'Internal server error'
    });
  }
});

app.get('/terms', (req, res) => {
  try {
    res.render('pages/terms', {
      title: 'شروط الاستخدام - FinClick.AI',
      language: 'ar',
      user: null
    });
  } catch (error) {
    logger.error('Error rendering terms page:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: 'Internal server error'
    });
  }
});

// API endpoint for testing
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'FinClick.AI API is working!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      analyses: 180,
      aiAgents: 7,
      languages: ['ar', 'en'],
      reportFormats: ['PDF', 'Excel', 'Word', 'PowerPoint']
    }
  });
});

// API endpoint for analysis types
app.get('/api/analysis-types', (req, res) => {
  res.json({
    success: true,
    data: {
      classical: {
        count: 106,
        categories: ['Liquidity Ratios', 'Leverage Ratios', 'Activity Ratios', 'Profitability Ratios', 'Market Value Ratios', 'Operational Efficiency']
      },
      intermediate: {
        count: 21,
        categories: ['Cash Flow Analysis', 'Return Analysis', 'Efficiency Analysis', 'Quality Analysis', 'Growth Analysis']
      },
      advanced: {
        count: 53,
        categories: ['Valuation Models', 'Risk Models', 'Derivatives Pricing', 'Fixed Income', 'Value Creation', 'Capital Structure', 'Corporate Finance']
      },
      total: 180
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).render('pages/404', {
    title: 'الصفحة غير موجودة - FinClick.AI',
    language: 'ar'
  });
});

// Error handler
app.use((error, req, res, next) => {
  logger.error('Application error:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = app;