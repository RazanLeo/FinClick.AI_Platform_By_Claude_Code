# FinClick.AI - Complete System Documentation
## التوثيق الشامل لمنصة FinClick.AI

![FinClick.AI Logo](./public/images/logo.png)

**Version:** 1.0.0
**Date:** January 23, 2025
**Developer:** Razan Ahmed Tawfik
**Email:** razantaofek@gmail.com

---

## Table of Contents | جدول المحتويات

1. [Project Overview | نظرة عامة على المشروع](#project-overview)
2. [System Architecture | معمارية النظام](#system-architecture)
3. [Project Structure | هيكل المشروع](#project-structure)
4. [Financial Analysis Lifecycle | دورة حياة التحليل المالي](#financial-analysis-lifecycle)
5. [Database Schema | مخطط قاعدة البيانات](#database-schema)
6. [180+ Financial Analysis Types | أنواع التحليل المالي](#financial-analysis-types)
7. [Pages and UI Elements | الصفحات وعناصر الواجهة](#pages-and-ui-elements)
8. [Admin Dashboard | لوحة تحكم المدير](#admin-dashboard)
9. [Payment System | نظام الدفع](#payment-system)
10. [AI Integration | تكامل الذكاء الاصطناعي](#ai-integration)
11. [Environment Setup | إعداد البيئة](#environment-setup)
12. [Local Development | التطوير المحلي](#local-development)
13. [Deployment | النشر](#deployment)
14. [Security & RLS | الأمان والحماية](#security-rls)
15. [Testing | الاختبارات](#testing)

---

## Project Overview | نظرة عامة على المشروع

### English
FinClick.AI is a revolutionary SaaS financial analysis platform that combines the power of AI with deep financial expertise. It provides 180+ types of financial analysis with real mathematical calculations, professional report generation, and comprehensive business intelligence tools.

### العربية
FinClick.AI هي منصة SaaS ثورية للتحليل المالي تجمع بين قوة الذكاء الاصطناعي والخبرة المالية العميقة. توفر أكثر من 180 نوع تحليل مالي مع حسابات رياضية حقيقية، وإنتاج تقارير احترافية، وأدوات ذكاء أعمال شاملة.

### Key Features | المميزات الرئيسية

- **180+ Financial Analysis Types** | 180+ نوع تحليل مالي
- **AI-Powered Analysis** | تحليل مدعوم بالذكاء الاصطناعي
- **Multi-format Reports** | تقارير متعددة الصيغ (PDF, Excel, Word, PowerPoint)
- **Bilingual Support** | دعم ثنائي اللغة (العربية/الإنجليزية)
- **PayTabs Integration** | تكامل مع PayTabs للدفع الإلكتروني
- **Real-time Analysis** | تحليل فوري في الوقت الفعلي
- **Advanced Security** | أمان متقدم مع RLS
- **Admin Dashboard** | لوحة تحكم إدارية شاملة

---

## System Architecture | معمارية النظام

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (EJS + JS)    │◄──►│  (Node.js +     │◄──►│   (Supabase     │
│                 │    │   Express)      │    │   PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI/UX Layer   │    │   API Layer     │    │   Storage       │
│ - 13 EJS Pages  │    │ - 4 Route Files │    │ - 15+ Tables    │
│ - RTL/LTR       │    │ - Middleware    │    │ - RLS Policies  │
│ - Responsive    │    │ - Auth & Rate   │    │ - Audit Logs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ External APIs   │    │   AI Services   │    │   File Storage  │
│ - OpenAI GPT-4  │    │ - Document OCR  │    │ - Reports       │
│ - Google Gemini │    │ - Analysis AI   │    │ - Uploads       │
│ - PayTabs       │    │ - Report Gen    │    │ - Charts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack | المجموعة التقنية

**Frontend | الواجهة الأمامية:**
- EJS Template Engine
- Bootstrap 5 with RTL Support
- Chart.js for Data Visualization
- jQuery for Dynamic Interactions
- Font Awesome Icons

**Backend | الواجهة الخلفية:**
- Node.js + Express.js
- JWT Authentication
- BCrypt Password Encryption
- Multer File Upload
- Winston Logging

**Database | قاعدة البيانات:**
- Supabase PostgreSQL
- Row Level Security (RLS)
- Real-time Subscriptions
- Automated Backups

**AI Services | خدمات الذكاء الاصطناعي:**
- OpenAI GPT-4
- Google Gemini
- Tesseract.js OCR
- Custom Analysis Algorithms

---

## Project Structure | هيكل المشروع

```
FinClick.AI/
├── 📁 .github/workflows/
│   └── deploy.yml                  # CI/CD Pipeline
│
├── 📁 config/
│   ├── database.js                 # Database Configuration
│   └── passport.js                 # Authentication Strategy
│
├── 📁 database/
│   ├── 📁 migrations/
│   │   ├── 001_initial_schema.sql  # Database Schema
│   │   └── 002_rls_security.sql    # Security Policies
│   └── 📁 seeds/
│       └── 001_analysis_types.sql  # Analysis Types Data
│
├── 📁 lib/
│   ├── supabase.js                 # Supabase Client
│   ├── financialCalculations.js   # 180+ Analysis Types (1230+ lines)
│   ├── aiAgents.js                 # AI Processing Engine
│   ├── analysisEngine.js           # Main Analysis Logic
│   ├── documentProcessor.js        # OCR & File Processing
│   ├── externalDataService.js      # External API Integration
│   └── reportGenerator.js          # Multi-format Report Generation
│
├── 📁 middleware/
│   ├── auth.js                     # Authentication Middleware
│   └── errorHandler.js             # Error Handling
│
├── 📁 models/
│   ├── User.js                     # User Model
│   ├── Company.js                  # Company Model
│   └── Analysis.js                 # Analysis Model
│
├── 📁 routes/
│   ├── auth.js                     # Authentication Routes
│   ├── analysis.js                 # Analysis Routes
│   ├── payment.js                  # PayTabs Integration
│   └── reports.js                  # Report Management
│
├── 📁 services/
│   ├── DatabaseService.js          # Database Operations
│   └── RedisService.js             # Caching Service
│
├── 📁 views/
│   ├── 📁 layouts/
│   │   └── main.ejs               # Main Layout Template
│   └── 📁 pages/
│       ├── index.ejs              # Homepage
│       ├── dashboard.ejs          # User Dashboard
│       ├── new-analysis.ejs       # Analysis Creation
│       ├── login.ejs              # Login Page
│       ├── register.ejs           # Registration
│       ├── admin.ejs              # Admin Dashboard
│       ├── pricing.ejs            # Subscription Plans
│       ├── about.ejs              # About Us
│       ├── contact.ejs            # Contact Form
│       ├── analysis-types.ejs     # 180+ Analysis Types
│       ├── free-tools.ejs         # Free Financial Tools
│       ├── privacy.ejs            # Privacy Policy
│       └── terms.ejs              # Terms of Service
│
├── 📁 public/
│   ├── 📁 css/
│   │   ├── main.css               # Main Stylesheet
│   │   └── rtl.css                # RTL Support
│   └── 📁 images/
│       └── logo.png               # Company Logo
│
├── 📁 scripts/
│   ├── generate-documentation.js   # Documentation Generator
│   ├── health-check.js            # System Health Check
│   ├── migrate.js                 # Database Migration
│   └── setup-admin.js             # Admin Setup
│
├── 📁 tests/
│   ├── setup.js                   # Test Configuration
│   ├── analysis.test.js           # Analysis Testing
│   └── payment.test.js            # Payment Testing
│
├── 📄 .env.example                # Environment Variables Template
├── 📄 .gitignore                  # Git Ignore Rules
├── 📄 package.json                # Node.js Dependencies
├── 📄 server.js                   # Main Server File
├── 📄 vercel.json                 # Vercel Configuration
├── 📄 ecosystem.config.js         # PM2 Configuration
├── 📄 jest.config.js              # Testing Configuration
├── 📄 README.md                   # Project Documentation
├── 📄 DEPLOYMENT.md               # Deployment Guide
├── 📄 build_log.txt               # Build Process Log
└── 📄 DOCUMENTATION.md            # This File
```

---

## Financial Analysis Lifecycle | دورة حياة التحليل المالي

### 1. Document Upload | رفع الوثائق
```
User uploads financial documents → OCR Processing → Data Extraction → Validation
المستخدم يرفع الوثائق المالية → معالجة OCR → استخراج البيانات → التحقق
```

### 2. Analysis Selection | اختيار التحليل
```
Choose Analysis Type → Select Parameters → Configure Options → Validate Input
اختيار نوع التحليل → تحديد المعايير → تكوين الخيارات → التحقق من الإدخال
```

### 3. Financial Calculations | الحسابات المالية
```
Apply 180+ Analysis Types → Real Mathematical Calculations → Industry Benchmarking → AI Insights
تطبيق 180+ نوع تحليل → حسابات رياضية حقيقية → مقارنة بالصناعة → رؤى ذكية
```

### 4. Report Generation | إنتاج التقارير
```
Generate Results → Create Visualizations → Multi-format Export → Professional Layout
توليد النتائج → إنشاء المخططات → تصدير متعدد الصيغ → تخطيط احترافي
```

### 5. Output Delivery | تسليم المخرجات
```
PDF Reports → Excel Spreadsheets → Word Documents → PowerPoint Presentations
تقارير PDF → جداول Excel → مستندات Word → عروض PowerPoint
```

---

## Database Schema | مخطط قاعدة البيانات

### Core Tables | الجداول الأساسية

#### Users Table | جدول المستخدمين
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) DEFAULT 'individual',
    subscription_id UUID REFERENCES subscriptions(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Companies Table | جدول الشركات
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    country VARCHAR(100),
    employees_count INTEGER,
    annual_revenue DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Analyses Table | جدول التحاليل
```sql
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    document_id UUID REFERENCES documents(id),
    analysis_type VARCHAR(100) NOT NULL,
    input_data JSONB NOT NULL,
    results JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Documents Table | جدول الوثائق
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    ocr_status VARCHAR(50) DEFAULT 'pending',
    extracted_data JSONB,
    upload_date TIMESTAMP DEFAULT NOW()
);
```

#### Reports Table | جدول التقارير
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analyses(id),
    format VARCHAR(50) NOT NULL,
    language VARCHAR(10) DEFAULT 'ar',
    file_path VARCHAR(500),
    generation_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'generating'
);
```

### Security Tables | جداول الأمان

#### Audit Logs | سجلات المراجعة
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 180+ Financial Analysis Types | أنواع التحليل المالي

### Basic Analysis (106 types) | التحليل الأساسي

#### 1. Liquidity Ratios | نسب السيولة (15 types)
- **Current Ratio** | نسبة السيولة الحالية
  ```javascript
  currentRatio = currentAssets / currentLiabilities
  ```
- **Quick Ratio** | نسبة السيولة السريعة
  ```javascript
  quickRatio = (currentAssets - inventory) / currentLiabilities
  ```
- **Cash Ratio** | نسبة السيولة النقدية
  ```javascript
  cashRatio = (cash + marketableSecurities) / currentLiabilities
  ```

#### 2. Profitability Ratios | نسب الربحية (25 types)
- **Gross Profit Margin** | هامش الربح الإجمالي
  ```javascript
  grossProfitMargin = (revenue - cogs) / revenue * 100
  ```
- **Net Profit Margin** | هامش الربح الصافي
  ```javascript
  netProfitMargin = netIncome / revenue * 100
  ```
- **Return on Assets (ROA)** | العائد على الأصول
  ```javascript
  roa = netIncome / totalAssets * 100
  ```

#### 3. Activity Ratios | نسب النشاط (20 types)
- **Inventory Turnover** | معدل دوران المخزون
  ```javascript
  inventoryTurnover = cogs / averageInventory
  ```
- **Asset Turnover** | معدل دوران الأصول
  ```javascript
  assetTurnover = revenue / totalAssets
  ```

#### 4. Leverage Ratios | نسب الرافعة المالية (18 types)
- **Debt-to-Equity Ratio** | نسبة الدين إلى حقوق الملكية
  ```javascript
  debtToEquity = totalDebt / totalEquity
  ```
- **Interest Coverage Ratio** | نسبة تغطية الفوائد
  ```javascript
  interestCoverage = ebit / interestExpense
  ```

#### 5. Market Ratios | نسب السوق (18 types)
- **Price-to-Earnings Ratio** | نسبة السعر إلى الربح
  ```javascript
  peRatio = marketPricePerShare / earningsPerShare
  ```

### Intermediate Analysis (21 types) | التحليل المتوسط

#### 1. Cash Flow Analysis | تحليل التدفقات النقدية
- **Free Cash Flow to Equity (FCFE)** | التدفق النقدي الحر لحقوق الملكية
  ```javascript
  fcfe = netIncome + depreciation - capex - changeInWorkingCapital + netBorrowing
  ```
- **Free Cash Flow to Firm (FCFF)** | التدفق النقدي الحر للشركة
  ```javascript
  fcff = ebit * (1 - taxRate) + depreciation - capex - changeInWorkingCapital
  ```

#### 2. Value Creation Analysis | تحليل خلق القيمة
- **Return on Invested Capital (ROIC)** | العائد على رأس المال المستثمر
  ```javascript
  roic = nopat / investedCapital * 100
  ```

### Advanced Analysis (53 types) | التحليل المتقدم

#### 1. Valuation Models | نماذج التقييم
- **Discounted Cash Flow (DCF)** | نموذج التدفق النقدي المخصوم
  ```javascript
  dcf = Σ(cashFlow / (1 + discountRate)^year) + terminalValue
  ```
- **Capital Asset Pricing Model (CAPM)** | نموذج تسعير الأصول الرأسمالية
  ```javascript
  requiredReturn = riskFreeRate + beta * (marketReturn - riskFreeRate)
  ```

#### 2. Risk Analysis | تحليل المخاطر
- **Value at Risk (VaR)** | القيمة المعرضة للمخاطر
- **Monte Carlo Simulation** | محاكاة مونت كارلو
- **Stress Testing** | اختبارات الضغط

#### 3. Option Pricing | تسعير الخيارات
- **Black-Scholes Model** | نموذج بلاك شولز
- **Binomial Option Pricing** | نموذج الخيارات الثنائي

---

## Pages and UI Elements | الصفحات وعناصر الواجهة

### 1. Homepage (index.ejs) | الصفحة الرئيسية

#### Header | الرأس
- Logo and Navigation
- Language Toggle (AR/EN)
- User Authentication Links

#### Hero Section | قسم البطل
- Main Headline: "منصة التحليل المالي الذكية والثورية"
- Call-to-Action Buttons
- Key Statistics

#### Features Section | قسم المميزات
- 180+ Analysis Types
- AI-Powered Insights
- Multi-format Reports
- Real-time Processing

#### Free Tools Section | قسم الأدوات المجانية
1. **Economic Calendar** | التقويم الاقتصادي
2. **Financial News** | الأخبار المالية
3. **Financial Calculators** | الحاسبات المالية
4. **Market Sentiment** | مؤشر المزاج العام
5. **AI Financial Bot** | بوت GPT المالي المجاني

#### Testimonials | آراء العملاء
- Customer Reviews
- Success Stories
- Industry Endorsements

#### Pricing Section | قسم الأسعار
- Monthly: 5,000 SAR
- Annual: 54,000 SAR (10% discount)
- Feature Comparisons

#### Footer | التذييل
- Quick Links
- Contact Information
- Social Media Links
- Legal Pages

### 2. Dashboard (dashboard.ejs) | لوحة التحكم

#### Overview Cards | بطاقات النظرة العامة
- Total Analyses
- Recent Reports
- Account Status
- Usage Statistics

#### Recent Activity | النشاط الأخير
- Latest Analyses
- Generated Reports
- System Notifications

#### Quick Actions | الإجراءات السريعة
- New Analysis
- Upload Document
- Generate Report
- View History

### 3. Analysis Creation (new-analysis.ejs) | إنشاء تحليل جديد

#### Step 1: Document Upload | رفع الوثائق
- Drag & Drop Interface
- File Type Validation
- OCR Processing Status

#### Step 2: Analysis Type Selection | اختيار نوع التحليل
- **Dropdown Menus | القوائم المنسدلة:**
  - Industries (20+ sectors)
  - Business Activities (50+ activities)
  - Legal Entity Types
  - Comparison Levels
  - Analysis Years (1-10 years)

#### Step 3: Parameters Configuration | تكوين المعايير
- Custom Benchmarks
- Industry Standards
- Regional Adjustments

#### Step 4: Processing | المعالجة
- Real-time Progress
- AI Analysis Status
- Calculation Progress

### 4. Login Page (login.ejs) | صفحة تسجيل الدخول

#### Demo Accounts | الحسابات التجريبية
- **Admin Account:**
  - Email: Razan@FinClick.AI
  - Password: RazanFinClickAI@056300

- **Guest Account:**
  - Email: Guest@FinClick.AI
  - Password: GuestFinClickAI@123321

---

## Admin Dashboard | لوحة تحكم المدير

### System Overview | نظرة عامة على النظام
- **User Statistics** | إحصائيات المستخدمين
- **Analysis Volume** | حجم التحاليل
- **Revenue Tracking** | تتبع الإيرادات
- **System Health** | صحة النظام

### User Management | إدارة المستخدمين
- **User List** | قائمة المستخدمين
- **Subscription Management** | إدارة الاشتراكات
- **Access Control** | التحكم في الوصول
- **User Activity Logs** | سجلات نشاط المستخدمين

### Content Management | إدارة المحتوى
- **Analysis Types Configuration** | تكوين أنواع التحليل
- **Report Templates** | قوالب التقارير
- **System Messages** | رسائل النظام
- **Maintenance Mode** | وضع الصيانة

### Financial Management | الإدارة المالية
- **Payment Tracking** | تتبع المدفوعات
- **Subscription Analytics** | تحليلات الاشتراكات
- **Revenue Reports** | تقارير الإيرادات
- **PayTabs Integration** | تكامل PayTabs

### System Administration | إدارة النظام
- **Database Backup** | نسخ احتياطية لقاعدة البيانات
- **Performance Monitoring** | مراقبة الأداء
- **Error Tracking** | تتبع الأخطاء
- **Security Logs** | سجلات الأمان

---

## Payment System | نظام الدفع

### PayTabs Integration | تكامل PayTabs

#### Supported Payment Methods | طرق الدفع المدعومة
- **MADA** | نظام المدفوعات السعودي
- **Visa** | فيزا
- **Mastercard** | ماستركارد
- **Apple Pay** | آبل باي
- **Bank Transfers** | التحويلات البنكية

#### Subscription Plans | خطط الاشتراك

##### Monthly Plan | الخطة الشهرية
- **Price:** 5,000 SAR/month
- **Features:** Full access to all analysis types
- **Reports:** Unlimited generation
- **Support:** Priority support

##### Annual Plan | الخطة السنوية
- **Price:** 54,000 SAR/year (10% discount)
- **Savings:** 6,000 SAR annually
- **Features:** All monthly features
- **Bonus:** Extended storage

#### Payment Flow | تدفق الدفع
```
1. Plan Selection → 2. PayTabs Redirect → 3. Payment Processing → 4. Confirmation → 5. Account Activation
```

---

## AI Integration | تكامل الذكاء الاصطناعي

### OpenAI GPT-4 Integration | تكامل OpenAI GPT-4

#### Document Analysis | تحليل الوثائق
- **OCR Processing** | معالجة OCR
- **Data Extraction** | استخراج البيانات
- **Pattern Recognition** | التعرف على الأنماط
- **Anomaly Detection** | اكتشاف الشذوذ

#### Financial Insights | الرؤى المالية
- **Trend Analysis** | تحليل الاتجاهات
- **Risk Assessment** | تقييم المخاطر
- **Performance Benchmarking** | مقارنة الأداء
- **Strategic Recommendations** | التوصيات الاستراتيجية

### Google Gemini Integration | تكامل Google Gemini

#### Advanced Analytics | التحليلات المتقدمة
- **Multi-modal Analysis** | التحليل متعدد الوسائط
- **Complex Reasoning** | التفكير المعقد
- **Contextual Understanding** | الفهم السياقي
- **Predictive Modeling** | النمذجة التنبؤية

#### Report Enhancement | تحسين التقارير
- **Natural Language Generation** | توليد اللغة الطبيعية
- **Visual Storytelling** | السرد البصري
- **Interactive Insights** | الرؤى التفاعلية
- **Executive Summaries** | الملخصات التنفيذية

---

## Environment Setup | إعداد البيئة

### Required Environment Variables | متغيرات البيئة المطلوبة

```bash
# Database Configuration (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT & Security
JWT_SECRET=your-jwt-secret-key-here
ENCRYPTION_KEY=your-encryption-key-32-characters

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key

# Financial Data APIs
FINANCIAL_MODELING_PREP_API_KEY=your-fmp-api-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key

# Payment Gateway (PayTabs)
PAYTABS_PROFILE_ID=your-paytabs-profile-id
PAYTABS_SERVER_KEY=your-paytabs-server-key
PAYTABS_BASE_URL=https://secure-global.paytabs.com

# Application Settings
NODE_ENV=production
PORT=3000
BASE_URL=https://finclick-ai.vercel.app
```

### Dependencies Installation | تثبيت التبعيات

```bash
npm install express ejs supabase bcryptjs jsonwebtoken
npm install multer sharp winston helmet cors
npm install openai google-generative-ai tesseract.js
npm install pdfkit exceljs docx pptxgenjs
npm install jest supertest playwright
```

---

## Local Development | التطوير المحلي

### Getting Started | البداية

1. **Clone Repository | استنساخ المستودع**
   ```bash
   git clone https://github.com/YOUR_USERNAME/finclick-ai-platform.git
   cd finclick-ai-platform
   ```

2. **Install Dependencies | تثبيت التبعيات**
   ```bash
   npm install
   ```

3. **Environment Setup | إعداد البيئة**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Database Setup | إعداد قاعدة البيانات**
   ```bash
   # Run migrations
   npm run migrate

   # Seed database
   npm run seed
   ```

5. **Start Development Server | تشغيل خادم التطوير**
   ```bash
   npm run dev
   ```

6. **Access Application | الوصول للتطبيق**
   ```
   http://localhost:3000
   ```

### Development Commands | أوامر التطوير

```bash
npm run dev          # Start development server
npm run test         # Run tests
npm run lint         # Code linting
npm run build        # Build for production
npm run start        # Start production server
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
npm run health       # Health check
```

---

## Deployment | النشر

### Vercel Deployment | نشر Vercel

#### Prerequisites | المتطلبات الأساسية
1. GitHub Repository
2. Vercel Account
3. Supabase Database
4. API Keys (OpenAI, Gemini, PayTabs)

#### Deployment Steps | خطوات النشر

1. **GitHub Setup | إعداد GitHub**
   ```bash
   git init
   git add .
   git commit -m "🚀 Initial commit: FinClick.AI Platform"
   git remote add origin https://github.com/YOUR_USERNAME/finclick-ai-platform.git
   git push -u origin main
   ```

2. **Vercel Configuration | تكوين Vercel**
   - Connect GitHub Repository
   - Set Project Name: `finclick-ai`
   - Framework: `Other`
   - Build Command: `npm run build`
   - Output Directory: `public`
   - Install Command: `npm ci`

3. **Environment Variables | متغيرات البيئة**
   Add all required environment variables in Vercel dashboard

4. **Custom Domain (Optional) | النطاق المخصص**
   - Add custom domain: `finclick.ai`
   - Configure DNS settings
   - Enable HTTPS

#### CI/CD Pipeline | خط الإنتاج

The project includes automated GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  test:
    # Run tests and security checks
  deploy:
    # Deploy to Vercel
  health-check:
    # Verify deployment health
```

---

## Security & RLS | الأمان والحماية

### Row Level Security (RLS) | أمان مستوى الصف

#### User Data Isolation | عزل بيانات المستخدمين
```sql
-- Users can only access their own data
CREATE POLICY user_isolation ON analyses
FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Admin access to all data
CREATE POLICY admin_access ON analyses
FOR ALL TO authenticated
USING (is_admin(auth.uid()));
```

#### Security Functions | دوال الأمان
```sql
-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate user access to resource
CREATE OR REPLACE FUNCTION validate_user_access(
  resource_user_id UUID,
  requesting_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN resource_user_id = requesting_user_id
    OR is_admin(requesting_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Authentication Security | أمان المصادقة

#### JWT Implementation | تطبيق JWT
- **Access Tokens:** 15 minutes expiry
- **Refresh Tokens:** 7 days expiry
- **Secure Storage:** httpOnly cookies
- **CSRF Protection:** SameSite cookies

#### Password Security | أمان كلمات المرور
- **BCrypt Hashing:** 12 rounds
- **Password Policy:** Min 8 characters, complexity rules
- **Rate Limiting:** 5 attempts per minute
- **Account Lockout:** After 10 failed attempts

### Data Protection | حماية البيانات

#### Encryption | التشفير
- **At Rest:** AES-256 encryption for sensitive data
- **In Transit:** TLS 1.3 for all communications
- **Database:** Native PostgreSQL encryption
- **Files:** Encrypted file storage

#### Audit Logging | تسجيل المراجعة
```sql
-- Automatic audit trail for sensitive operations
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, resource_type,
    resource_id, details, ip_address
  ) VALUES (
    auth.uid(), TG_OP, TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    row_to_json(NEW), current_setting('request.headers')::json->>'x-forwarded-for'
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Testing | الاختبارات

### Test Structure | هيكل الاختبارات

#### Unit Tests | اختبارات الوحدة
```javascript
// tests/analysis.test.js
describe('Financial Calculations', () => {
  test('Current Ratio Calculation', () => {
    const result = calculateCurrentRatio({
      current_assets: 100000,
      current_liabilities: 50000
    });
    expect(result.value).toBe(2.0);
    expect(result.interpretation).toBe('excellent');
  });
});
```

#### Integration Tests | اختبارات التكامل
```javascript
// tests/payment.test.js
describe('PayTabs Integration', () => {
  test('Subscription Creation', async () => {
    const response = await request(app)
      .post('/api/payments/create-subscription')
      .send({ plan: 'monthly' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.paymentUrl).toBeDefined();
  });
});
```

#### End-to-End Tests | الاختبارات الشاملة
```javascript
// tests/e2e/analysis-flow.test.js
describe('Complete Analysis Flow', () => {
  test('Document Upload to Report Generation', async () => {
    // Upload document
    // Select analysis type
    // Process analysis
    // Generate report
    // Download report
  });
});
```

### Test Commands | أوامر الاختبار

```bash
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Coverage report
npm run test:watch        # Watch mode
```

### Test Coverage Goals | أهداف تغطية الاختبارات

- **Statements:** 90%+
- **Branches:** 85%+
- **Functions:** 95%+
- **Lines:** 90%+

---

## Performance & Optimization | الأداء والتحسين

### Database Optimization | تحسين قاعدة البيانات

#### Indexing Strategy | استراتيجية الفهرسة
```sql
-- Compound index for common queries
CREATE INDEX idx_analyses_user_type_status
ON analyses(user_id, analysis_type, status);

-- Partial index for active subscriptions
CREATE INDEX idx_users_active_subscription
ON users(subscription_id)
WHERE subscription_id IS NOT NULL;
```

#### Query Optimization | تحسين الاستعلامات
- **Prepared Statements** | البيانات المحضرة
- **Connection Pooling** | تجميع الاتصالات
- **Query Caching** | تخزين الاستعلامات مؤقتاً
- **Result Pagination** | ترقيم النتائج

### Application Performance | أداء التطبيق

#### Caching Strategy | استراتيجية التخزين المؤقت
- **Redis Caching** | تخزين Redis المؤقت
- **Static Asset Caching** | تخزين الأصول الثابتة
- **API Response Caching** | تخزين استجابات API
- **Database Query Caching** | تخزين استعلامات قاعدة البيانات

#### Load Balancing | توزيع الأحمال
- **Horizontal Scaling** | التوسع الأفقي
- **Microservices Architecture** | معمارية الخدمات المصغرة
- **CDN Integration** | تكامل شبكة توزيع المحتوى
- **Auto Scaling** | التوسع التلقائي

---

## Monitoring & Analytics | المراقبة والتحليلات

### System Monitoring | مراقبة النظام

#### Health Checks | فحوصات الصحة
```javascript
// scripts/health-check.js
const healthCheck = {
  database: async () => {
    // Check database connectivity
  },
  redis: async () => {
    // Check Redis connectivity
  },
  apis: async () => {
    // Check external API availability
  },
  storage: async () => {
    // Check file storage access
  }
};
```

#### Performance Metrics | مقاييس الأداء
- **Response Time** | زمن الاستجابة
- **Throughput** | الإنتاجية
- **Error Rate** | معدل الأخطاء
- **Resource Utilization** | استخدام الموارد

### Business Analytics | تحليلات الأعمال

#### User Behavior | سلوك المستخدمين
- **Page Views** | مشاهدات الصفحات
- **User Sessions** | جلسات المستخدمين
- **Feature Usage** | استخدام المميزات
- **Conversion Rates** | معدلات التحويل

#### Revenue Analytics | تحليلات الإيرادات
- **Subscription Metrics** | مقاييس الاشتراكات
- **Churn Analysis** | تحليل معدل التسرب
- **Lifetime Value** | القيمة مدى الحياة
- **Revenue Forecasting** | التنبؤ بالإيرادات

---

## API Documentation | توثيق API

### Authentication Endpoints | نقاط المصادقة

#### POST /api/auth/login
```javascript
// Request
{
  "email": "user@example.com",
  "password": "userpassword"
}

// Response
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### POST /api/auth/register
```javascript
// Request
{
  "email": "user@example.com",
  "password": "userpassword",
  "full_name": "User Name",
  "user_type": "individual"
}

// Response
{
  "success": true,
  "message": "Registration successful",
  "user_id": "generated_user_id"
}
```

### Analysis Endpoints | نقاط التحليل

#### POST /api/analysis/create
```javascript
// Request
{
  "document_id": "doc_id",
  "analysis_type": "current_ratio",
  "parameters": {
    "current_assets": 100000,
    "current_liabilities": 50000
  }
}

// Response
{
  "success": true,
  "analysis_id": "analysis_id",
  "results": {
    "value": 2.0,
    "interpretation": "excellent",
    "benchmarks": {...}
  }
}
```

#### GET /api/analysis/types
```javascript
// Response
{
  "success": true,
  "data": {
    "basic": [
      {
        "id": "current_ratio",
        "name_ar": "نسبة السيولة الحالية",
        "name_en": "Current Ratio",
        "category": "liquidity"
      }
    ],
    "intermediate": [...],
    "advanced": [...]
  }
}
```

### Report Endpoints | نقاط التقارير

#### POST /api/reports/generate
```javascript
// Request
{
  "analysis_id": "analysis_id",
  "format": "pdf",
  "language": "ar"
}

// Response
{
  "success": true,
  "report_id": "report_id",
  "download_url": "/api/reports/download/report_id"
}
```

---

## Troubleshooting | استكشاف الأخطاء

### Common Issues | المشاكل الشائعة

#### Database Connection Issues | مشاكل اتصال قاعدة البيانات
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test database connection
npm run health:database
```

#### API Key Issues | مشاكل مفاتيح API
```bash
# Verify OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Test Gemini API
npm run test:gemini
```

#### File Upload Issues | مشاكل رفع الملفات
```bash
# Check upload directory permissions
ls -la uploads/
chmod 755 uploads/

# Verify file size limits
grep MAX_FILE_SIZE .env
```

### Error Codes | رموز الأخطاء

| Code | Description | Solution |
|------|-------------|----------|
| E001 | Database Connection Failed | Check Supabase credentials |
| E002 | Authentication Failed | Verify JWT secret |
| E003 | File Upload Failed | Check file permissions |
| E004 | API Rate Limit Exceeded | Implement backoff strategy |
| E005 | Analysis Engine Error | Check input parameters |

---

## Support & Maintenance | الدعم والصيانة

### Contact Information | معلومات الاتصال

**Developer:** Razan Ahmed Tawfik
**Email:** razantaofek@gmail.com
**Platform:** https://finclick-ai.vercel.app

### Support Channels | قنوات الدعم

- **Email Support:** 24/7 technical support
- **Documentation:** Comprehensive user guides
- **Video Tutorials:** Step-by-step walkthroughs
- **Community Forum:** User discussions

### Maintenance Schedule | جدول الصيانة

- **Security Updates:** Monthly
- **Feature Updates:** Quarterly
- **Database Backups:** Daily
- **Performance Monitoring:** Continuous

### Service Level Agreement (SLA) | اتفاقية مستوى الخدمة

- **Uptime:** 99.9% availability
- **Response Time:** < 2 seconds average
- **Issue Resolution:** 24 hours maximum
- **Data Recovery:** < 1 hour RTO

---

## Future Roadmap | خارطة الطريق المستقبلية

### Phase 1: Core Enhancement | تحسين الأساسيات
- Mobile Application Development
- Advanced AI Models Integration
- Real-time Collaboration Features
- Enhanced Visualization Tools

### Phase 2: Market Expansion | توسيع السوق
- Multi-currency Support
- Regional Compliance (GCC)
- White-label Solutions
- API for Third-party Integration

### Phase 3: Advanced Analytics | التحليلات المتقدمة
- Machine Learning Predictions
- Blockchain Integration
- ESG Analysis Module
- Regulatory Compliance Automation

---

## Conclusion | الخاتمة

FinClick.AI represents a complete, production-ready SaaS platform for financial analysis. With 180+ analysis types, AI-powered insights, and comprehensive reporting capabilities, it's designed to serve both individual users and enterprise clients in the Saudi Arabian and broader Middle Eastern markets.

The platform combines cutting-edge technology with deep financial expertise to deliver accurate, actionable insights that drive business success. From document upload to professional report generation, every aspect has been carefully designed and implemented to provide exceptional user experience and business value.

---

*This documentation is comprehensive and covers all aspects of the FinClick.AI platform. For additional support or questions, please contact the development team.*

**© 2025 FinClick.AI - All Rights Reserved**