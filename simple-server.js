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

// Block access to environment files
app.use((req, res, next) => {
  if (req.path.match(/\.env/)) {
    return res.status(404).send('Not Found');
  }
  next();
});

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
    // Redirect to static HTML page for now
    res.redirect('/index.html');
  } catch (error) {
    logger.error('Error serving homepage:', error);
    res.status(500).send(`
      <html>
        <head>
          <title>FinClick.AI - خطأ مؤقت</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Arial', sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #000428 0%, #004e92 100%); color: white; min-height: 100vh; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #FFD700; font-size: 3rem; margin-bottom: 1rem; }
            h2 { color: #FFA500; margin-bottom: 2rem; }
            p { font-size: 1.2rem; margin-bottom: 1rem; }
            .error { background: rgba(255,0,0,0.1); padding: 1rem; border-radius: 10px; margin-top: 2rem; }
            .btn { background: linear-gradient(45deg, #FFD700, #FFA500); color: black; padding: 1rem 2rem; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 FinClick.AI</h1>
            <h2>المنصة قيد التحضير</h2>
            <p>نعمل على إصلاح مشكلة مؤقتة. سيتم تشغيل المنصة قريباً.</p>
            <a href="/test" class="btn">صفحة الاختبار</a>
            <a href="/health" class="btn">فحص الحالة</a>
            <div class="error">
              <strong>Technical Error:</strong> ${error.message}
            </div>
          </div>
        </body>
      </html>
    `);
  }
});

app.get('/dashboard', (req, res) => {
  try {
    // Redirect to static dashboard HTML page
    res.redirect('/dashboard.html');
  } catch (error) {
    logger.error('Error serving dashboard:', error);
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
  res.json({
    ok: true,
    ts: Date.now(),
    app: 'FinClick.AI',
    version: '1.0.0',
    node: process.version,
    env: process.env.NODE_ENV || 'development'
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>FinClick.AI - Test Page</title>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <h1>🚀 FinClick.AI</h1>
        <h2>منصة التحليل المالي الذكي</h2>
        <p>الخادم يعمل بشكل صحيح!</p>
        <p><strong>الوقت:</strong> ${new Date().toLocaleString('ar-SA')}</p>
        <p><strong>Node.js:</strong> ${process.version}</p>
        <p><strong>البيئة:</strong> ${process.env.NODE_ENV || 'development'}</p>
        <hr style="margin: 30px 0;">
        <a href="/" style="color: #fff; text-decoration: underline;">الصفحة الرئيسية</a> |
        <a href="/health" style="color: #fff; text-decoration: underline;">فحص الحالة</a>
      </body>
    </html>
  `);
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

// Export for Vercel
module.exports = app;

// Start server if not in Vercel environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    logger.info(`🚀 FinClick.AI Server running on port ${PORT}`);
    logger.info(`📱 Local: http://localhost:${PORT}`);
  });
}