#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

class FinClickDocumentationGenerator {
    constructor() {
        this.doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            info: {
                Title: 'FinClick.AI - Complete System Documentation',
                Author: 'Razan Ahmed Tawfik',
                Subject: 'Revolutionary Financial Analysis Platform Documentation',
                Keywords: 'FinClick.AI, Financial Analysis, AI, Supabase, Node.js'
            }
        });

        this.outputPath = path.join(__dirname, '../documentation.pdf');
        this.stream = fs.createWriteStream(this.outputPath);
        this.doc.pipe(this.stream);

        this.currentPage = 1;
        this.fontSize = {
            title: 24,
            heading: 18,
            subheading: 14,
            body: 11,
            small: 9
        };

        this.colors = {
            primary: '#D4AF37', // Gold
            secondary: '#1F2937', // Dark Gray
            text: '#374151', // Gray
            accent: '#059669' // Green
        };
    }

    async generate() {
        console.log('🔄 Generating FinClick.AI Documentation PDF...');

        try {
            // Cover Page
            this.addCoverPage();

            // Table of Contents
            this.addTableOfContents();

            // System Architecture
            this.addSystemArchitecture();

            // Financial Analysis Lifecycle
            this.addAnalysisLifecycle();

            // Database Schema
            this.addDatabaseSchema();

            // Financial Analysis Types (180+)
            this.addAnalysisTypes();

            // Output Formats
            this.addOutputFormats();

            // Environment Configuration
            this.addEnvironmentConfig();

            // Development Setup
            this.addDevelopmentSetup();

            // Testing Guide
            this.addTestingGuide();

            // Deployment Guide
            this.addDeploymentGuide();

            // Security & Administration
            this.addSecurityAdmin();

            // Appendices
            this.addAppendices();

            // Finalize document
            this.doc.end();

            // Wait for stream to finish
            await new Promise((resolve) => {
                this.stream.on('finish', resolve);
            });

            console.log(`✅ Documentation generated successfully: ${this.outputPath}`);
            return this.outputPath;

        } catch (error) {
            console.error('❌ Error generating documentation:', error);
            throw error;
        }
    }

    addCoverPage() {
        // Logo placeholder
        this.doc.fontSize(this.fontSize.title)
            .fillColor(this.colors.primary)
            .text('FinClick.AI', { align: 'center' });

        this.doc.moveDown(0.5);

        this.doc.fontSize(this.fontSize.heading)
            .fillColor(this.colors.secondary)
            .text('منصة التحليل المالي الذكية والثورية', { align: 'center' });

        this.doc.fontSize(this.fontSize.subheading)
            .fillColor(this.colors.text)
            .text('Revolutionary Intelligent Financial Analysis Platform', { align: 'center' });

        this.doc.moveDown(2);

        // Key Features Box
        const featuresY = this.doc.y;
        this.doc.rect(50, featuresY, this.doc.page.width - 100, 200)
            .stroke(this.colors.primary);

        this.doc.y = featuresY + 20;
        this.doc.fontSize(this.fontSize.subheading)
            .fillColor(this.colors.primary)
            .text('المميزات الرئيسية | Key Features', { align: 'center' });

        this.doc.moveDown(1);
        this.doc.fontSize(this.fontSize.body)
            .fillColor(this.colors.text);

        const features = [
            '• 180+ نوع تحليل مالي | 180+ Financial Analysis Types',
            '• ذكاء اصطناعي متقدم | Advanced AI Integration',
            '• تقارير احترافية | Professional Reports',
            '• دعم ثنائي اللغة | Bilingual Support',
            '• نظام دفع PayTabs | PayTabs Payment System',
            '• أمان متقدم مع RLS | Advanced Security with RLS'
        ];

        features.forEach(feature => {
            this.doc.text(feature, { indent: 30 });
            this.doc.moveDown(0.3);
        });

        // Footer info
        this.doc.y = this.doc.page.height - 150;
        this.doc.fontSize(this.fontSize.small)
            .fillColor(this.colors.text)
            .text('المطور | Developer: Razan Ahmed Tawfik', { align: 'center' });
        this.doc.text('البريد الإلكتروني | Email: Razan@FinClick.AI', { align: 'center' });
        this.doc.text('التاريخ | Date: ' + new Date().toLocaleDateString('ar-SA'), { align: 'center' });
        this.doc.text('الإصدار | Version: 1.0.0', { align: 'center' });

        this.addPageBreak();
    }

    addTableOfContents() {
        this.addSectionHeader('فهرس المحتويات | Table of Contents');

        const contents = [
            { title: '1. هيكلية النظام | System Architecture', page: 3 },
            { title: '2. دورة حياة التحليل المالي | Analysis Lifecycle', page: 5 },
            { title: '3. مخطط قاعدة البيانات | Database Schema', page: 7 },
            { title: '4. أنواع التحليل المالي (180+) | Analysis Types', page: 10 },
            { title: '5. صيغ المخرجات | Output Formats', page: 15 },
            { title: '6. إعدادات البيئة | Environment Configuration', page: 17 },
            { title: '7. إعداد التطوير | Development Setup', page: 19 },
            { title: '8. دليل الاختبارات | Testing Guide', page: 21 },
            { title: '9. دليل النشر | Deployment Guide', page: 23 },
            { title: '10. الأمان والإدارة | Security & Administration', page: 25 },
            { title: '11. الملاحق | Appendices', page: 27 }
        ];

        this.doc.fontSize(this.fontSize.body);

        contents.forEach(item => {
            this.doc.fillColor(this.colors.text)
                .text(item.title, 70, this.doc.y, { width: 400, continued: true })
                .fillColor(this.colors.primary)
                .text(`${item.page}`, { align: 'right' });
            this.doc.moveDown(0.5);
        });

        this.addPageBreak();
    }

    addSystemArchitecture() {
        this.addSectionHeader('1. هيكلية النظام | System Architecture');

        // Frontend Architecture
        this.addSubHeader('الواجهة الأمامية | Frontend Architecture');

        const frontendComponents = [
            'EJS Templates - قوالب ديناميكية ثنائية اللغة',
            'Tailwind CSS - تنسيق متجاوب مع دعم RTL',
            'Chart.js - الرسوم البيانية التفاعلية',
            'Font Awesome - مكتبة الأيقونات الشاملة',
            'Vanilla JavaScript - تفاعلات العميل'
        ];

        this.addBulletList(frontendComponents);

        // Backend Architecture
        this.addSubHeader('الواجهة الخلفية | Backend Architecture');

        const backendComponents = [
            'Node.js 18+ - بيئة تشغيل JavaScript',
            'Express.js - إطار عمل الخادم',
            'JWT Authentication - نظام مصادقة آمن',
            'Bcrypt - تشفير كلمات المرور',
            'Multer - رفع ومعالجة الملفات',
            'Express Rate Limit - حماية من الإساءة'
        ];

        this.addBulletList(backendComponents);

        // Database Layer
        this.addSubHeader('طبقة قاعدة البيانات | Database Layer');

        const databaseComponents = [
            'Supabase PostgreSQL - قاعدة بيانات سحابية',
            'Row Level Security (RLS) - حماية على مستوى الصفوف',
            'Real-time subscriptions - اشتراكات فورية',
            'Automated backups - نسخ احتياطية تلقائية',
            'Connection pooling - تجميع الاتصالات'
        ];

        this.addBulletList(databaseComponents);

        // AI Services
        this.addSubHeader('خدمات الذكاء الاصطناعي | AI Services');

        const aiComponents = [
            'OpenAI GPT-4 - تحليل ذكي متقدم',
            'Google Gemini - رؤى إضافية وتحليل',
            'Tesseract.js - معالجة OCR للمستندات',
            'Natural Language Processing - معالجة اللغة',
            'Cost tracking - تتبع تكلفة الاستخدام'
        ];

        this.addBulletList(aiComponents);

        // External Integrations
        this.addSubHeader('التكاملات الخارجية | External Integrations');

        const integrations = [
            'PayTabs - نظام الدفع السعودي',
            'Financial Modeling Prep - بيانات السوق',
            'Alpha Vantage - بيانات الأسهم',
            'World Bank API - المؤشرات الاقتصادية',
            'SMTP Services - إرسال الإشعارات'
        ];

        this.addBulletList(integrations);

        this.addPageBreak();
    }

    addAnalysisLifecycle() {
        this.addSectionHeader('2. دورة حياة التحليل المالي | Financial Analysis Lifecycle');

        // Step 1: Document Upload
        this.addSubHeader('الخطوة 1: رفع المستندات | Step 1: Document Upload');

        const uploadSteps = [
            'المستخدم يرفع القوائم المالية (PDF, Excel, CSV)',
            'النظام يتحقق من صيغة وحجم الملف',
            'تشغيل OCR لاستخراج البيانات من الصور والـ PDF',
            'تحليل هيكل البيانات وتحديد نوع القوائم المالية',
            'حفظ الملف في النظام مع metadata مناسب'
        ];

        this.addNumberedList(uploadSteps);

        // Step 2: Data Processing
        this.addSubHeader('الخطوة 2: معالجة البيانات | Step 2: Data Processing');

        const processingSteps = [
            'تنظيف البيانات وإزالة الأخطاء',
            'تطبيع أسماء الحقول والعملات',
            'التحقق من اكتمال البيانات المطلوبة',
            'ربط البيانات بالمعايير القطاعية',
            'إعداد البيانات للتحليل'
        ];

        this.addNumberedList(processingSteps);

        // Step 3: Analysis Engine
        this.addSubHeader('الخطوة 3: محرك التحليل | Step 3: Analysis Engine');

        const analysisSteps = [
            'تشغيل 180+ نوع تحليل مالي',
            'حساب النسب والمؤشرات المالية',
            'مقارنة النتائج بالمعايير القطاعية',
            'تحليل الاتجاهات والتغيرات',
            'تطبيق خوارزميات الذكاء الاصطناعي'
        ];

        this.addNumberedList(analysisSteps);

        // Step 4: AI Enhancement
        this.addSubHeader('الخطوة 4: التعزيز بالذكاء الاصطناعي | Step 4: AI Enhancement');

        const aiSteps = [
            'تحليل النصوص والملاحظات في القوائم',
            'توليد رؤى وتوصيات ذكية',
            'تحديد المخاطر والفرص',
            'مقارنة بالشركات المماثلة',
            'إنتاج ملخص تنفيذي ذكي'
        ];

        this.addNumberedList(aiSteps);

        // Step 5: Report Generation
        this.addSubHeader('الخطوة 5: إنتاج التقارير | Step 5: Report Generation');

        const reportSteps = [
            'اختيار قالب التقرير المناسب',
            'إنتاج الرسوم البيانية والجداول',
            'تنسيق التقرير باللغة المطلوبة',
            'إضافة العلامة التجارية والتصميم',
            'حفظ وإرسال التقرير للمستخدم'
        ];

        this.addNumberedList(reportSteps);

        this.addPageBreak();
    }

    addDatabaseSchema() {
        this.addSectionHeader('3. مخطط قاعدة البيانات | Database Schema');

        // Core Tables
        this.addSubHeader('الجداول الأساسية | Core Tables');

        const coreTables = [
            {
                name: 'users',
                description: 'بيانات المستخدمين وحساباتهم',
                fields: [
                    'id (UUID) - المعرف الفريد',
                    'email (VARCHAR) - البريد الإلكتروني',
                    'password_hash (TEXT) - كلمة المرور المشفرة',
                    'first_name, last_name (VARCHAR) - الاسم',
                    'company_name (VARCHAR) - اسم الشركة',
                    'role (ENUM) - الدور (admin, premium, standard, guest)',
                    'subscription_type (ENUM) - نوع الاشتراك',
                    'subscription_status (ENUM) - حالة الاشتراك',
                    'created_at, updated_at (TIMESTAMP) - التواريخ'
                ]
            },
            {
                name: 'subscriptions',
                description: 'إدارة الاشتراكات والخطط',
                fields: [
                    'id (UUID) - المعرف الفريد',
                    'user_id (UUID) - ربط بالمستخدم',
                    'type (ENUM) - نوع الاشتراك',
                    'status (ENUM) - الحالة',
                    'start_date, end_date (TIMESTAMP) - فترة الاشتراك',
                    'amount (DECIMAL) - قيمة الاشتراك',
                    'currency (VARCHAR) - العملة'
                ]
            },
            {
                name: 'documents',
                description: 'الملفات المرفوعة والمستندات',
                fields: [
                    'id (UUID) - المعرف الفريد',
                    'user_id (UUID) - ربط بالمستخدم',
                    'filename (VARCHAR) - اسم الملف',
                    'original_name (VARCHAR) - الاسم الأصلي',
                    'file_path (TEXT) - مسار الملف',
                    'file_size (INTEGER) - حجم الملف',
                    'mime_type (VARCHAR) - نوع الملف',
                    'status (ENUM) - حالة المعالجة',
                    'extracted_data (JSONB) - البيانات المستخرجة'
                ]
            },
            {
                name: 'analyses',
                description: 'التحليلات المالية المنجزة',
                fields: [
                    'id (UUID) - المعرف الفريد',
                    'user_id (UUID) - ربط بالمستخدم',
                    'document_id (UUID) - ربط بالمستند',
                    'analysis_name (VARCHAR) - اسم التحليل',
                    'company_name (VARCHAR) - اسم الشركة',
                    'sector_id (UUID) - القطاع',
                    'legal_entity_id (UUID) - الكيان القانوني',
                    'analysis_period (VARCHAR) - فترة التحليل',
                    'selected_analysis_types (JSONB) - أنواع التحليل المختارة',
                    'status (ENUM) - حالة التحليل',
                    'financial_data (JSONB) - البيانات المالية',
                    'results_summary (JSONB) - ملخص النتائج'
                ]
            }
        ];

        coreTables.forEach(table => {
            this.doc.fontSize(this.fontSize.body)
                .fillColor(this.colors.primary)
                .text(`${table.name}`, { underline: true });

            this.doc.fillColor(this.colors.text)
                .text(table.description);

            this.doc.moveDown(0.3);
            table.fields.forEach(field => {
                this.doc.text(`  • ${field}`, { indent: 20 });
            });

            this.doc.moveDown(1);
        });

        // Reference Tables
        this.addSubHeader('الجداول المرجعية | Reference Tables');

        const refTables = [
            'analysis_types - أنواع التحليل المالي (180+ نوع)',
            'company_sectors - قطاعات الشركات',
            'legal_entities - الكيانات القانونية',
            'subscription_plans - خطط الاشتراك',
            'system_settings - إعدادات النظام'
        ];

        this.addBulletList(refTables);

        // Transaction Tables
        this.addSubHeader('جداول المعاملات | Transaction Tables');

        const transTables = [
            'payments - المدفوعات والفواتير',
            'analysis_results - نتائج التحليل التفصيلية',
            'reports - التقارير المُنتجة',
            'user_sessions - جلسات المستخدمين',
            'audit_log - سجل العمليات والتدقيق',
            'ai_agent_logs - سجلات الذكاء الاصطناعي',
            'market_data - بيانات السوق والمؤشرات'
        ];

        this.addBulletList(transTables);

        this.addPageBreak();
    }

    addAnalysisTypes() {
        this.addSectionHeader('4. أنواع التحليل المالي (180+) | Financial Analysis Types');

        // Classification Overview
        this.addSubHeader('التصنيف العام | General Classification');

        const classification = [
            'التحليل الأساسي الكلاسيكي (106 تحليل)',
            'التحليل التطبيقي المتوسط (21 تحليل)',
            'التحليل المتقدم والمعقد (53 تحليل)'
        ];

        this.addBulletList(classification);

        // Basic Classical Analysis
        this.addSubHeader('أ) التحليل الأساسي الكلاسيكي | Basic Classical Analysis (106)');

        this.doc.fontSize(this.fontSize.body)
            .fillColor(this.colors.text)
            .text('1. التحليل الهيكلي للقوائم المالية (13 نوع):');

        const structuralAnalysis = [
            'التحليل الرأسي والأفقي - حساب النسب والتغيرات',
            'تحليل الاتجاه - دراسة التطور عبر الزمن',
            'تحليل الأرقام القياسية - مقارنة بسنة أساس',
            'تحليل الحجم المشترك - النسب من الإجمالي'
        ];

        this.addBulletList(structuralAnalysis);

        this.doc.text('2. تحليل النسب المالية (75 نسبة):');

        // Liquidity Ratios
        this.doc.fontSize(this.fontSize.small)
            .fillColor(this.colors.accent)
            .text('   أ) نسب السيولة (10 نسب):');

        const liquidityRatios = [
            'نسبة التداول = الأصول المتداولة ÷ الخصوم المتداولة',
            'النسبة السريعة = (الأصول المتداولة - المخزون) ÷ الخصوم المتداولة',
            'نسبة النقد = النقد والاستثمارات السائلة ÷ الخصوم المتداولة',
            'رأس المال العامل = الأصول المتداولة - الخصوم المتداولة'
        ];

        this.addBulletList(liquidityRatios, true);

        // Profitability Ratios
        this.doc.fontSize(this.fontSize.small)
            .fillColor(this.colors.accent)
            .text('   ب) نسب الربحية (20 نسبة):');

        const profitabilityRatios = [
            'هامش الربح الإجمالي = الربح الإجمالي ÷ المبيعات × 100',
            'هامش الربح التشغيلي = الربح التشغيلي ÷ المبيعات × 100',
            'هامش صافي الربح = صافي الربح ÷ المبيعات × 100',
            'العائد على الأصول (ROA) = صافي الربح ÷ إجمالي الأصول × 100',
            'العائد على حقوق الملكية (ROE) = صافي الربح ÷ حقوق الملكية × 100'
        ];

        this.addBulletList(profitabilityRatios, true);

        // Leverage Ratios
        this.doc.fontSize(this.fontSize.small)
            .fillColor(this.colors.accent)
            .text('   ج) نسب المديونية (15 نسبة):');

        const leverageRatios = [
            'نسبة الدين إلى حقوق الملكية = إجمالي الديون ÷ حقوق الملكية',
            'نسبة تغطية الفوائد = الربح قبل الفوائد والضرائب ÷ مصروف الفوائد',
            'نسبة الدين = إجمالي الديون ÷ إجمالي الأصول × 100'
        ];

        this.addBulletList(leverageRatios, true);

        // Advanced Analysis
        this.addSubHeader('ج) التحليل المتقدم والمعقد | Advanced Complex Analysis (53)');

        this.doc.fontSize(this.fontSize.body)
            .fillColor(this.colors.text)
            .text('1. النمذجة والمحاكاة (11 نموذج):');

        const modelingAnalysis = [
            'تحليل مونت كارلو - محاكاة الاحتمالات',
            'النمذجة المالية المتقدمة - توقع الأداء',
            'تحليل السيناريوهات - دراسة الحالات المختلفة',
            'نمذجة المخاطر - قياس وتقييم المخاطر'
        ];

        this.addBulletList(modelingAnalysis);

        this.doc.text('2. التحليل الإحصائي والكمي (16 تحليل):');

        const statisticalAnalysis = [
            'نماذج ARIMA و GARCH - تحليل السلاسل الزمنية',
            'التحليل الطيفي - تحليل الترددات',
            'تحليل الانحدار المتعدد - العلاقات الخطية',
            'التحليل العاملي - تحديد العوامل المؤثرة'
        ];

        this.addBulletList(statisticalAnalysis);

        this.addPageBreak();

        // Implementation Logic
        this.addSubHeader('آلية التنفيذ والحساب | Implementation Logic');

        this.doc.fontSize(this.fontSize.body)
            .fillColor(this.colors.text)
            .text('كل نوع تحليل يتم تنفيذه عبر:');

        const implementationSteps = [
            'استخراج البيانات المطلوبة من القوائم المالية',
            'تطبيق المعادلة الرياضية المحددة',
            'التحقق من صحة النتائج وحدود القيم',
            'مقارنة النتائج بالمعايير القطاعية',
            'تفسير النتائج وتقديم التوصيات',
            'حفظ النتائج في قاعدة البيانات للمراجع المستقبلية'
        ];

        this.addNumberedList(implementationSteps);

        // Quality Control
        this.addSubHeader('ضمان الجودة | Quality Control');

        const qualitySteps = [
            'التحقق من اكتمال البيانات المطلوبة',
            'فحص القيم الشاذة والأخطاء المحتملة',
            'مراجعة منطق الحسابات والمعادلات',
            'اختبار النتائج مقابل الحالات المعروفة',
            'مراجعة التفسيرات والتوصيات'
        ];

        this.addBulletList(qualitySteps);

        this.addPageBreak();
    }

    addOutputFormats() {
        this.addSectionHeader('5. صيغ المخرجات | Output Formats');

        // Text Outputs
        this.addSubHeader('المخرجات النصية | Text Outputs');

        const textOutputs = [
            'تقارير تحليلية مفصلة باللغتين العربية والإنجليزية',
            'ملخصات تنفيذية للإدارة العليا',
            'توصيات استثمارية مبنية على البيانات',
            'تحليل المخاطر والفرص',
            'مقارنات قطاعية وتنافسية'
        ];

        this.addBulletList(textOutputs);

        // Charts and Visualizations
        this.addSubHeader('الرسوم البيانية والتصورات | Charts & Visualizations');

        const chartTypes = [
            'رسوم بيانية خطية لتتبع الاتجاهات',
            'رسوم بيانية دائرية للتوزيعات',
            'رسوم بيانية عمودية للمقارنات',
            'خرائط حرارية للمؤشرات المتعددة',
            'رسوم بيانية شعاعية للأداء الشامل'
        ];

        this.addBulletList(chartTypes);

        // PDF Reports
        this.addSubHeader('تقارير PDF | PDF Reports');

        const pdfFeatures = [
            'تصميم احترافي مع العلامة التجارية',
            'دعم الخطوط العربية والإنجليزية',
            'جداول مفصلة مع تنسيق متقدم',
            'رسوم بيانية عالية الدقة',
            'فهرسة تلقائية ونظام ترقيم'
        ];

        this.addBulletList(pdfFeatures);

        // Excel Workbooks
        this.addSubHeader('دفاتر Excel | Excel Workbooks');

        const excelFeatures = [
            'أوراق عمل متعددة للبيانات والتحليل',
            'جداول محورية تفاعلية',
            'رسوم بيانية قابلة للتعديل',
            'معادلات محفوظة للمراجعة',
            'تنسيق مشروط للقيم الهامة'
        ];

        this.addBulletList(excelFeatures);

        // PowerPoint Presentations
        this.addSubHeader('عروض PowerPoint | PowerPoint Presentations');

        const presentationFeatures = [
            'قوالب تصميم عصرية ومهنية',
            'شرائح ملخصة للنقاط الرئيسية',
            'رسوم بيانية مدمجة في الشرائح',
            'انتقالات وتأثيرات مناسبة للعرض',
            'ملاحظات المتحدث للإرشاد'
        ];

        this.addBulletList(presentationFeatures);

        // Word Documents
        this.addSubHeader('مستندات Word | Word Documents');

        const wordFeatures = [
            'تقارير مفصلة مع فهرسة تلقائية',
            'أنماط نصوص متسقة ومهنية',
            'جداول مدمجة مع البيانات',
            'مراجع وحواشي للمصادر',
            'إمكانية التحرير والتعديل اللاحق'
        ];

        this.addBulletList(wordFeatures);

        this.addPageBreak();
    }

    addEnvironmentConfig() {
        this.addSectionHeader('6. إعدادات البيئة | Environment Configuration');

        this.doc.fontSize(this.fontSize.body)
            .fillColor(this.colors.text)
            .text('ملف .env.example يحتوي على جميع المتغيرات المطلوبة لتشغيل النظام:');

        // Application Settings
        this.addSubHeader('إعدادات التطبيق | Application Settings');

        const appSettings = [
            'NODE_ENV - بيئة التشغيل (development/production)',
            'PORT - منفذ الخادم (افتراضي 3000)',
            'BASE_URL - الرابط الأساسي للمنصة',
            'ADMIN_EMAIL - بريد المدير الإلكتروني',
            'ADMIN_PASSWORD - كلمة مرور المدير'
        ];

        this.addBulletList(appSettings);

        // Database Configuration
        this.addSubHeader('إعدادات قاعدة البيانات | Database Configuration');

        const dbSettings = [
            'SUPABASE_URL - رابط مشروع Supabase',
            'SUPABASE_ANON_KEY - المفتاح العام',
            'SUPABASE_SERVICE_ROLE_KEY - مفتاح الخدمة (حساس)',
            'JWT_SECRET - مفتاح تشفير JWT (يجب إنشاؤه بقوة)',
            'SESSION_SECRET - مفتاح تشفير الجلسات'
        ];

        this.addBulletList(dbSettings);

        // AI Services
        this.addSubHeader('خدمات الذكاء الاصطناعي | AI Services');

        const aiSettings = [
            'OPENAI_API_KEY - مفتاح OpenAI للتحليل المتقدم',
            'GEMINI_API_KEY - مفتاح Google Gemini',
            'AI_MODEL_VERSION - إصدار النموذج المستخدم',
            'AI_MAX_TOKENS - الحد الأقصى للرموز المميزة',
            'AI_TEMPERATURE - مستوى الإبداع في الردود'
        ];

        this.addBulletList(aiSettings);

        // Payment Configuration
        this.addSubHeader('إعدادات الدفع | Payment Configuration');

        const paymentSettings = [
            'PAYTABS_PROFILE_ID - معرف الملف التجاري في PayTabs',
            'PAYTABS_SERVER_KEY - مفتاح الخادم (حساس جداً)',
            'PAYTABS_BASE_URL - رابط API الأساسي',
            'PAYTABS_CURRENCY - العملة (SAR)',
            'PAYTABS_CALLBACK_URL - رابط الإشعار',
            'PAYTABS_RETURN_URL - رابط العودة بعد الدفع'
        ];

        this.addBulletList(paymentSettings);

        // External APIs
        this.addSubHeader('APIs الخارجية | External APIs');

        const externalSettings = [
            'FINANCIAL_MODELING_PREP_API_KEY - بيانات السوق المالي',
            'ALPHA_VANTAGE_API_KEY - بيانات الأسهم والعملات',
            'WORLD_BANK_API_URL - المؤشرات الاقتصادية العالمية',
            'INVESTING_COM_API_KEY - بيانات إضافية للاستثمار',
            'SMTP_HOST, SMTP_USER, SMTP_PASS - إعدادات البريد الإلكتروني'
        ];

        this.addBulletList(externalSettings);

        // Security Note
        this.doc.fontSize(this.fontSize.subheading)
            .fillColor(this.colors.accent)
            .text('⚠️ ملاحظة أمنية هامة | Security Notice');

        this.doc.fontSize(this.fontSize.body)
            .fillColor(this.colors.text)
            .text('جميع المفاتيح والأسرار يجب حمايتها وعدم مشاركتها. استخدم أدوات إدارة الأسرار في بيئات الإنتاج ولا تضع المفاتيح الحقيقية في ملفات Git.');

        this.addPageBreak();
    }

    addDevelopmentSetup() {
        this.addSectionHeader('7. إعداد التطوير | Development Setup');

        // Prerequisites
        this.addSubHeader('المتطلبات الأساسية | Prerequisites');

        const prerequisites = [
            'Node.js 18.0 أو أحدث',
            'npm أو yarn لإدارة الحزم',
            'حساب Supabase مع مشروع جديد',
            'مفاتيح APIs للخدمات الخارجية',
            'محرر نصوص مثل VS Code'
        ];

        this.addBulletList(prerequisites);

        // Installation Steps
        this.addSubHeader('خطوات التثبيت | Installation Steps');

        const installSteps = [
            'git clone https://github.com/username/finclick-ai-platform.git',
            'cd finclick-ai-platform',
            'npm install',
            'cp .env.example .env',
            'تعديل ملف .env بالقيم الحقيقية',
            'node scripts/migrate.js up',
            'node scripts/migrate.js seed',
            'node scripts/setup-admin.js',
            'npm run dev'
        ];

        this.addNumberedList(installSteps);

        // Project Structure
        this.addSubHeader('هيكل المشروع | Project Structure');

        this.doc.fontSize(this.fontSize.small)
            .fillColor(this.colors.text)
            .text('المجلدات الرئيسية:');

        const projectStructure = [
            '/lib - المكتبات الأساسية (supabase, aiAgents, financialCalculations)',
            '/routes - مسارات API (auth, analysis, payment, reports)',
            '/middleware - وسائط المعالجة (auth, validation, upload)',
            '/views - قوالب EJS (layouts, pages)',
            '/database - مهاجرات وبذور قاعدة البيانات',
            '/tests - ملفات الاختبارات',
            '/scripts - سكريبتات المساعدة',
            '/public - الملفات الثابتة (صور، CSS، JS)'
        ];

        this.addBulletList(projectStructure, true);

        // Development Commands
        this.addSubHeader('أوامر التطوير | Development Commands');

        const devCommands = [
            'npm run dev - تشغيل الخادم في وضع التطوير',
            'npm test - تشغيل جميع الاختبارات',
            'npm run test:watch - تشغيل الاختبارات مع المراقبة',
            'npm run lint - فحص جودة الكود',
            'npm run lint:fix - إصلاح مشاكل الكود تلقائياً',
            'npm run typecheck - فحص الأنواع (إذا توفر TypeScript)',
            'node scripts/migrate.js status - حالة المهاجرات',
            'node scripts/health-check.js - فحص صحة النظام'
        ];

        this.addBulletList(devCommands);

        // Debug Configuration
        this.addSubHeader('إعدادات التصحيح | Debug Configuration');

        const debugConfig = [
            'LOG_LEVEL=debug - مستوى السجلات التفصيلي',
            'DEBUG=true - تفعيل وضع التصحيح',
            'VERBOSE_LOGS=true - سجلات مفصلة أكثر',
            'MOCK_EXTERNAL_APIS=true - محاكاة APIs الخارجية للاختبار'
        ];

        this.addBulletList(debugConfig);

        this.addPageBreak();
    }

    addTestingGuide() {
        this.addSectionHeader('8. دليل الاختبارات | Testing Guide');

        // Testing Framework
        this.addSubHeader('إطار الاختبارات | Testing Framework');

        const testingFramework = [
            'Jest - إطار الاختبارات الرئيسي',
            'Supertest - اختبار APIs و HTTP endpoints',
            'Playwright - اختبارات النهاية إلى النهاية',
            'Jest Coverage - تقارير تغطية الكود',
            'Setup/Teardown - إعداد وتنظيف بيئة الاختبار'
        ];

        this.addBulletList(testingFramework);

        // Unit Tests
        this.addSubHeader('اختبارات الوحدة | Unit Tests');

        this.doc.fontSize(this.fontSize.body)
            .fillColor(this.colors.text)
            .text('اختبارات لكل مكون على حدة:');

        const unitTests = [
            'lib/financialCalculations.test.js - اختبار العمليات الحسابية',
            'lib/aiAgents.test.js - اختبار وكلاء الذكاء الاصطناعي',
            'lib/reportGenerator.test.js - اختبار إنتاج التقارير',
            'middleware/auth.test.js - اختبار المصادقة',
            'middleware/validation.test.js - اختبار التحقق من البيانات'
        ];

        this.addBulletList(unitTests);

        // Integration Tests
        this.addSubHeader('اختبارات التكامل | Integration Tests');

        const integrationTests = [
            'routes/auth.test.js - اختبار نظام المصادقة',
            'routes/analysis.test.js - اختبار APIs التحليل',
            'routes/payment.test.js - اختبار نظام الدفع',
            'routes/reports.test.js - اختبار إنتاج التقارير',
            'database/integration.test.js - اختبار قاعدة البيانات'
        ];

        this.addBulletList(integrationTests);

        // E2E Tests
        this.addSubHeader('اختبارات النهاية إلى النهاية | End-to-End Tests');

        const e2eTests = [
            'user-registration.e2e.js - رحلة تسجيل المستخدم',
            'financial-analysis.e2e.js - رحلة التحليل الكاملة',
            'payment-flow.e2e.js - رحلة الدفع والاشتراك',
            'report-generation.e2e.js - إنتاج التقارير',
            'admin-dashboard.e2e.js - وظائف لوحة المدير'
        ];

        this.addBulletList(e2eTests);

        // Test Commands
        this.addSubHeader('أوامر الاختبارات | Test Commands');

        const testCommands = [
            'npm test - جميع الاختبارات',
            'npm run test:unit - اختبارات الوحدة فقط',
            'npm run test:integration - اختبارات التكامل فقط',
            'npm run test:e2e - اختبارات النهاية إلى النهاية',
            'npm run test:coverage - تقرير تغطية الكود',
            'npm run test:watch - مراقبة الملفات وإعادة الاختبار',
            'npm run test:debug - تشغيل الاختبارات في وضع التصحيح'
        ];

        this.addBulletList(testCommands);

        // Coverage Requirements
        this.addSubHeader('متطلبات التغطية | Coverage Requirements');

        const coverageRequirements = [
            'الخطوط (Lines): 70% كحد أدنى',
            'الدوال (Functions): 70% كحد أدنى',
            'الفروع (Branches): 70% كحد أدنى',
            'البيانات (Statements): 70% كحد أدنى'
        ];

        this.addBulletList(coverageRequirements);

        // Mock Services
        this.addSubHeader('محاكاة الخدمات | Mock Services');

        const mockServices = [
            'MockExternalDataService - محاكاة APIs الخارجية',
            'MockOpenAI - محاكاة خدمات الذكاء الاصطناعي',
            'MockPayTabs - محاكاة نظام الدفع',
            'TestDatabase - قاعدة بيانات للاختبار',
            'MockEmailService - محاكاة إرسال الإيميلات'
        ];

        this.addBulletList(mockServices);

        this.addPageBreak();
    }

    addDeploymentGuide() {
        this.addSectionHeader('9. دليل النشر | Deployment Guide');

        // GitHub Setup
        this.addSubHeader('إعداد GitHub | GitHub Setup');

        const githubSteps = [
            'إنشاء repository جديد على GitHub',
            'git init في مجلد المشروع',
            'git add . لإضافة جميع الملفات',
            'git commit -m "Initial commit"',
            'git remote add origin [URL]',
            'git push -u origin main'
        ];

        this.addNumberedList(githubSteps);

        // Vercel Deployment
        this.addSubHeader('نشر على Vercel | Vercel Deployment');

        const vercelSteps = [
            'الذهاب إلى https://vercel.com',
            'ربط الحساب مع GitHub',
            'Import Git Repository',
            'اختيار المشروع finclick-ai-platform',
            'إعداد Environment Variables',
            'النقر على Deploy',
            'انتظار اكتمال النشر',
            'الحصول على رابط المنصة'
        ];

        this.addNumberedList(vercelSteps);

        // Environment Variables for Production
        this.addSubHeader('متغيرات البيئة للإنتاج | Production Environment Variables');

        this.doc.fontSize(this.fontSize.small)
            .fillColor(this.colors.text)
            .text('يجب إضافة هذه المتغيرات في Vercel Dashboard:');

        const prodEnvVars = [
            'NODE_ENV=production',
            'BASE_URL=https://your-domain.vercel.app',
            'SUPABASE_URL=https://your-project.supabase.co',
            'SUPABASE_ANON_KEY=[your-anon-key]',
            'SUPABASE_SERVICE_ROLE_KEY=[your-service-key]',
            'JWT_SECRET=[strong-random-secret]',
            'OPENAI_API_KEY=[your-openai-key]',
            'PAYTABS_PROFILE_ID=[your-profile-id]',
            'PAYTABS_SERVER_KEY=[your-server-key]'
        ];

        this.addBulletList(prodEnvVars, true);

        // CI/CD Pipeline
        this.addSubHeader('خط الإنتاج المستمر | CI/CD Pipeline');

        this.doc.fontSize(this.fontSize.body)
            .fillColor(this.colors.text)
            .text('GitHub Actions يقوم بـ:');

        const cicdSteps = [
            'تشغيل الاختبارات عند كل push',
            'فحص الأمان والثغرات',
            'التحقق من جودة الكود',
            'بناء المشروع للإنتاج',
            'نشر تلقائي على Vercel',
            'فحص صحة الموقع بعد النشر',
            'إرسال إشعارات النتائج'
        ];

        this.addBulletList(cicdSteps);

        // Domain Configuration
        this.addSubHeader('إعداد النطاق | Domain Configuration');

        const domainSteps = [
            'شراء نطاق مخصص (مثل finclick.ai)',
            'إضافة النطاق في Vercel Dashboard',
            'تحديث DNS records عند مقدم النطاق',
            'تفعيل SSL certificate',
            'اختبار الوصول عبر النطاق الجديد',
            'تحديث BASE_URL في متغيرات البيئة'
        ];

        this.addNumberedList(domainSteps);

        // Monitoring and Maintenance
        this.addSubHeader('المراقبة والصيانة | Monitoring & Maintenance');

        const monitoring = [
            'مراقبة الأداء عبر Vercel Analytics',
            'مراقبة قاعدة البيانات عبر Supabase Dashboard',
            'تتبع الأخطاء والاستثناءات',
            'مراجعة استخدام APIs والتكاليف',
            'نسخ احتياطية دورية',
            'تحديثات الأمان والتبعيات'
        ];

        this.addBulletList(monitoring);

        this.addPageBreak();
    }

    addSecurityAdmin() {
        this.addSectionHeader('10. الأمان والإدارة | Security & Administration');

        // Security Features
        this.addSubHeader('مميزات الأمان | Security Features');

        const securityFeatures = [
            'Row Level Security (RLS) في قاعدة البيانات',
            'تشفير كلمات المرور باستخدام bcrypt',
            'JWT tokens مع انتهاء صلاحية',
            'Rate limiting لمنع الإساءة في الاستخدام',
            'تحقق من صحة جميع المدخلات',
            'حماية من XSS و CSRF attacks',
            'رؤوس HTTP أمنية (Security Headers)',
            'Audit logging لجميع العمليات الحساسة'
        ];

        this.addBulletList(securityFeatures);

        // RLS Policies
        this.addSubHeader('سياسات RLS | RLS Policies');

        this.doc.fontSize(this.fontSize.body)
            .fillColor(this.colors.text)
            .text('سياسات حماية البيانات على مستوى الصفوف:');

        const rlsPolicies = [
            'المستخدمون يرون بياناتهم فقط',
            'المديرون يرون جميع البيانات',
            'الوصول للتحليلات مقيد بالمالك',
            'التقارير محمية بمستوى التحليل',
            'سجل التدقيق للمديرين فقط',
            'الجداول المرجعية للقراءة العامة'
        ];

        this.addBulletList(rlsPolicies);

        // Admin Dashboard
        this.addSubHeader('لوحة تحكم المدير | Admin Dashboard');

        const adminFeatures = [
            'إحصائيات شاملة للمنصة',
            'إدارة المستخدمين والاشتراكات',
            'مراقبة الأنشطة والعمليات',
            'إدارة خطط الأسعار',
            'عرض وإدارة المدفوعات',
            'سجل العمليات والتدقيق',
            'إعدادات النظام والمميزات',
            'مراقبة صحة النظام والخوادم'
        ];

        this.addBulletList(adminFeatures);

        // User Roles and Permissions
        this.addSubHeader('الأدوار والصلاحيات | Roles & Permissions');

        this.doc.fontSize(this.fontSize.body)
            .fillColor(this.colors.text)
            .text('نظام الأدوار في المنصة:');

        const userRoles = [
            'admin - صلاحيات كاملة لإدارة النظام',
            'premium - وصول لجميع المميزات المدفوعة',
            'standard - وصول محدود حسب الاشتراك',
            'guest - وصول محدود للمميزات المجانية'
        ];

        this.addBulletList(userRoles);

        // Audit Logging
        this.addSubHeader('سجل التدقيق | Audit Logging');

        const auditEvents = [
            'تسجيل الدخول والخروج',
            'إنشاء وتعديل الحسابات',
            'العمليات المالية والمدفوعات',
            'إنشاء وحذف التحليلات',
            'تغيير إعدادات النظام',
            'الوصول للبيانات الحساسة'
        ];

        this.addBulletList(auditEvents);

        // Backup and Recovery
        this.addSubHeader('النسخ الاحتياطية والاستعادة | Backup & Recovery');

        const backupStrategy = [
            'نسخ احتياطية يومية من قاعدة البيانات',
            'نسخ احتياطية من الملفات المرفوعة',
            'اختبار دوري لعملية الاستعادة',
            'تشفير النسخ الاحتياطية',
            'احتفاظ بالنسخ لمدة 90 يوم',
            'خطة استعادة الخدمة في حالات الطوارئ'
        ];

        this.addBulletList(backupStrategy);

        // Compliance
        this.addSubHeader('الامتثال والمعايير | Compliance & Standards');

        const compliance = [
            'GDPR compliance للخصوصية',
            'PCI DSS للمدفوعات الآمنة',
            'ISO 27001 لأمان المعلومات',
            'SOC 2 للضوابط الأمنية',
            'معايير OWASP للأمان',
            'امتثال للقوانين السعودية'
        ];

        this.addBulletList(compliance);

        this.addPageBreak();
    }

    addAppendices() {
        this.addSectionHeader('11. الملاحق | Appendices');

        // API Endpoints
        this.addSubHeader('أ) نقاط API الرئيسية | Main API Endpoints');

        const apiEndpoints = [
            'POST /api/auth/register - تسجيل مستخدم جديد',
            'POST /api/auth/login - تسجيل الدخول',
            'GET /api/auth/profile - بيانات المستخدم',
            'POST /api/analysis/upload - رفع مستند للتحليل',
            'POST /api/analysis/create - إنشاء تحليل جديد',
            'GET /api/analysis/:id - بيانات التحليل',
            'POST /api/payment/create - إنشاء عملية دفع',
            'GET /api/reports/:id/pdf - تحميل تقرير PDF',
            'GET /api/admin/stats - إحصائيات المدير',
            'GET /api/health - فحص صحة النظام'
        ];

        this.addBulletList(apiEndpoints);

        // Configuration Files
        this.addSubHeader('ب) ملفات الإعداد الرئيسية | Main Configuration Files');

        const configFiles = [
            'package.json - تبعيات ومعلومات المشروع',
            'server.js - ملف الخادم الرئيسي',
            'vercel.json - إعدادات نشر Vercel',
            'jest.config.js - إعدادات الاختبارات',
            '.gitignore - ملفات مستبعدة من Git',
            'ecosystem.config.js - إعدادات PM2',
            'docker-compose.yml - إعداد الحاويات',
            'nginx.conf - إعدادات خادم الويب'
        ];

        this.addBulletList(configFiles);

        // Database Tables Summary
        this.addSubHeader('ج) ملخص جداول قاعدة البيانات | Database Tables Summary');

        this.doc.fontSize(this.fontSize.small)
            .fillColor(this.colors.text)
            .text('إجمالي الجداول: 15 جدول رئيسي');

        const tablesSummary = [
            'users (8 أعمدة) - بيانات المستخدمين',
            'subscriptions (9 أعمدة) - الاشتراكات',
            'documents (10 أعمدة) - الملفات المرفوعة',
            'analyses (15 أعمدة) - التحليلات المالية',
            'analysis_results (8 أعمدة) - نتائج التحليل',
            'reports (12 أعمدة) - التقارير المُنتجة',
            'payments (11 أعمدة) - المعاملات المالية',
            'analysis_types (12 أعمدة) - أنواع التحليل (180+ صف)',
            'company_sectors (6 أعمدة) - قطاعات الشركات',
            'legal_entities (6 أعمدة) - الكيانات القانونية',
            'subscription_plans (10 أعمدة) - خطط الاشتراك',
            'user_sessions (8 أعمدة) - جلسات المستخدمين',
            'audit_log (10 أعمدة) - سجل العمليات',
            'ai_agent_logs (9 أعمدة) - سجل الذكاء الاصطناعي',
            'market_data (8 أعمدة) - بيانات السوق'
        ];

        this.addBulletList(tablesSummary, true);

        // Support and Contact
        this.addSubHeader('د) الدعم والتواصل | Support & Contact');

        const contactInfo = [
            'المطور الرئيسي: رزان أحمد توفيق',
            'البريد الإلكتروني: Razan@FinClick.AI',
            'الهاتف: +966 544 827 213',
            'واتساب: +966 544 827 213',
            'الموقع: https://finclick.ai',
            'GitHub: https://github.com/finclick-ai/platform'
        ];

        this.addBulletList(contactInfo);

        // Version History
        this.addSubHeader('هـ) سجل الإصدارات | Version History');

        const versionHistory = [
            'v1.0.0 (يناير 2025) - الإصدار الأولي الكامل',
            '- تنفيذ كامل لجميع المميزات المطلوبة',
            '- 180+ نوع تحليل مالي مع المنطق الحقيقي',
            '- واجهة ثنائية اللغة مع دعم RTL',
            '- نظام دفع PayTabs متكامل',
            '- تقارير احترافية بجميع الصيغ',
            '- أمان متقدم مع RLS وتدقيق',
            '- جاهزية كاملة للإنتاج والنشر'
        ];

        this.addBulletList(versionHistory);

        // Footer
        this.doc.y = this.doc.page.height - 100;
        this.doc.fontSize(this.fontSize.small)
            .fillColor(this.colors.primary)
            .text('FinClick.AI - منصة التحليل المالي الذكية والثورية', { align: 'center' });

        this.doc.fillColor(this.colors.text)
            .text('تم إنشاء هذه الوثيقة تلقائياً من النظام', { align: 'center' });

        this.doc.text(`تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}`, { align: 'center' });
    }

    // Helper Methods
    addSectionHeader(title) {
        if (this.doc.y > this.doc.page.height - 150) {
            this.addPageBreak();
        }

        this.doc.fontSize(this.fontSize.heading)
            .fillColor(this.colors.primary)
            .text(title, { underline: true });
        this.doc.moveDown(1);
    }

    addSubHeader(title) {
        this.doc.fontSize(this.fontSize.subheading)
            .fillColor(this.colors.secondary)
            .text(title);
        this.doc.moveDown(0.5);
    }

    addBulletList(items, small = false) {
        const fontSize = small ? this.fontSize.small : this.fontSize.body;
        this.doc.fontSize(fontSize)
            .fillColor(this.colors.text);

        items.forEach(item => {
            this.doc.text(`• ${item}`, { indent: 20 });
            this.doc.moveDown(0.2);
        });

        this.doc.moveDown(0.5);
    }

    addNumberedList(items) {
        this.doc.fontSize(this.fontSize.body)
            .fillColor(this.colors.text);

        items.forEach((item, index) => {
            this.doc.text(`${index + 1}. ${item}`, { indent: 20 });
            this.doc.moveDown(0.3);
        });

        this.doc.moveDown(0.5);
    }

    addPageBreak() {
        this.doc.addPage();
        this.currentPage++;

        // Add page number footer
        this.doc.fontSize(this.fontSize.small)
            .fillColor(this.colors.text)
            .text(`صفحة ${this.currentPage}`,
                this.doc.page.width - 100,
                this.doc.page.height - 30,
                { align: 'right' });
    }
}

// Generate documentation if called directly
if (require.main === module) {
    const generator = new FinClickDocumentationGenerator();
    generator.generate()
        .then(filePath => {
            console.log('✅ Documentation generated successfully!');
            console.log(`📄 File location: ${filePath}`);
        })
        .catch(error => {
            console.error('❌ Failed to generate documentation:', error);
            process.exit(1);
        });
}

module.exports = FinClickDocumentationGenerator;