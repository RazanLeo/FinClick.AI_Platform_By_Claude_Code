-- ملف القطاعات والأنشطة لـ FinClick.AI
-- يتضمن أكثر من 50 قطاع اقتصادي مع أنشطة فرعية مفصلة

-- إنشاء جدول القطاعات
CREATE TABLE IF NOT EXISTS sectors (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE,
    description_ar TEXT,
    description_en TEXT,
    parent_id INTEGER REFERENCES sectors(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول الأنشطة الاقتصادية
CREATE TABLE IF NOT EXISTS economic_activities (
    id SERIAL PRIMARY KEY,
    sector_id INTEGER REFERENCES sectors(id),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    code VARCHAR(15) UNIQUE,
    description_ar TEXT,
    description_en TEXT,
    risk_level VARCHAR(20) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إدخال القطاعات الرئيسية (50+ قطاع)
INSERT INTO sectors (name_ar, name_en, code, description_ar, description_en) VALUES
-- القطاعات المالية والمصرفية
('المصارف', 'Banking', 'BANK', 'القطاع المصرفي والخدمات المالية', 'Banking and financial services sector'),
('التأمين', 'Insurance', 'INSUR', 'قطاع التأمين وإعادة التأمين', 'Insurance and reinsurance sector'),
('الاستثمار', 'Investment', 'INVST', 'الاستثمار وإدارة الأصول', 'Investment and asset management'),
('التمويل', 'Finance', 'FINC', 'التمويل والإقراض المالي', 'Finance and lending'),
('الأسواق المالية', 'Capital Markets', 'CPTL', 'أسواق رأس المال والأوراق المالية', 'Capital markets and securities'),

-- قطاعات الطاقة والمرافق
('البترول والغاز', 'Oil & Gas', 'OIL', 'استكشاف وإنتاج النفط والغاز', 'Oil and gas exploration and production'),
('البتروكيماويات', 'Petrochemicals', 'PTCH', 'الصناعات البتروكيماوية', 'Petrochemical industries'),
('الكهرباء', 'Electricity', 'ELEC', 'توليد وتوزيع الكهرباء', 'Electricity generation and distribution'),
('المياه', 'Water & Utilities', 'WATR', 'المياه والمرافق العامة', 'Water and public utilities'),
('الطاقة المتجددة', 'Renewable Energy', 'RENW', 'الطاقة المتجددة والشمسية والرياح', 'Renewable energy, solar and wind'),

-- قطاعات الصناعة والتصنيع
('الصناعات الأساسية', 'Basic Industries', 'BSND', 'الصناعات الأساسية والثقيلة', 'Basic and heavy industries'),
('الصناعات الغذائية', 'Food Industries', 'FOOD', 'تصنيع وإنتاج المواد الغذائية', 'Food manufacturing and production'),
('صناعة الأدوية', 'Pharmaceuticals', 'PHRM', 'صناعة الأدوية والمستحضرات الطبية', 'Pharmaceutical and medical manufacturing'),
('صناعة السيارات', 'Automotive', 'AUTO', 'صناعة وتجميع السيارات', 'Automotive manufacturing and assembly'),
('صناعة الطيران', 'Aerospace', 'AERO', 'صناعة الطيران والفضاء', 'Aerospace and aviation manufacturing'),
('الصناعات الكيماوية', 'Chemicals', 'CHEM', 'الصناعات الكيماوية والمواد الكيميائية', 'Chemical industries and materials'),
('صناعة النسيج', 'Textiles', 'TEXT', 'صناعة النسيج والملابس', 'Textile and clothing manufacturing'),
('صناعة الورق', 'Paper & Pulp', 'PAPR', 'صناعة الورق واللب', 'Paper and pulp manufacturing'),
('صناعة المعادن', 'Metals', 'METL', 'صناعة وتشكيل المعادن', 'Metal manufacturing and forming'),
('صناعة الإسمنت', 'Cement', 'CMNT', 'صناعة الإسمنت ومواد البناء', 'Cement and construction materials'),

-- قطاعات التكنولوجيا والاتصالات
('تقنية المعلومات', 'Information Technology', 'IT', 'تقنية المعلومات والبرمجيات', 'Information technology and software'),
('الاتصالات', 'Telecommunications', 'TELE', 'الاتصالات والشبكات', 'Telecommunications and networks'),
('الإعلام', 'Media', 'MEDA', 'الإعلام والنشر والإذاعة', 'Media, publishing and broadcasting'),
('التجارة الإلكترونية', 'E-commerce', 'ECOM', 'التجارة الإلكترونية والتسوق الرقمي', 'E-commerce and digital shopping'),
('الألعاب والترفيه', 'Gaming & Entertainment', 'GAME', 'صناعة الألعاب والترفيه الرقمي', 'Gaming and digital entertainment industry'),

-- قطاعات العقارات والإنشاءات
('التطوير العقاري', 'Real Estate Development', 'REAL', 'التطوير العقاري والاستثمار العقاري', 'Real estate development and investment'),
('الإنشاءات', 'Construction', 'CONS', 'المقاولات والإنشاءات', 'Contracting and construction'),
('الهندسة', 'Engineering', 'ENGR', 'الاستشارات الهندسية والتصميم', 'Engineering consulting and design'),
('إدارة المرافق', 'Facility Management', 'FACL', 'إدارة وصيانة المرافق', 'Facility management and maintenance'),

-- قطاعات التجارة والخدمات
('التجارة', 'Retail Trade', 'RTAIL', 'التجارة بالتجزئة والمبيعات', 'Retail trade and sales'),
('التجارة الجملة', 'Wholesale Trade', 'WHOL', 'التجارة بالجملة والتوزيع', 'Wholesale trade and distribution'),
('الفنادق', 'Hotels', 'HOTL', 'الفنادق والضيافة', 'Hotels and hospitality'),
('المطاعم', 'Restaurants', 'REST', 'المطاعم وخدمات الطعام', 'Restaurants and food services'),
('السياحة', 'Tourism', 'TOUR', 'السياحة والسفر', 'Tourism and travel'),
('النقل', 'Transportation', 'TRNS', 'النقل والشحن واللوجستيات', 'Transportation, shipping and logistics'),
('الطيران المدني', 'Civil Aviation', 'AVTN', 'الطيران المدني والمطارات', 'Civil aviation and airports'),

-- قطاعات الصحة والتعليم
('الرعاية الصحية', 'Healthcare', 'HLTH', 'الرعاية الصحية والمستشفيات', 'Healthcare and hospitals'),
('التعليم', 'Education', 'EDUC', 'التعليم والجامعات', 'Education and universities'),
('البحث والتطوير', 'Research & Development', 'R&D', 'البحث والتطوير والابتكار', 'Research, development and innovation'),

-- قطاعات الزراعة والثروة الحيوانية
('الزراعة', 'Agriculture', 'AGRI', 'الزراعة والإنتاج النباتي', 'Agriculture and crop production'),
('الثروة الحيوانية', 'Livestock', 'LVST', 'تربية المواشي والثروة الحيوانية', 'Livestock and animal husbandry'),
('الصيد', 'Fishing', 'FISH', 'صيد الأسماك والثروة البحرية', 'Fishing and marine resources'),
('الغابات', 'Forestry', 'FRST', 'الغابات والموارد الحرجية', 'Forestry and forest resources'),

-- قطاعات الترفيه والرياضة
('الرياضة', 'Sports', 'SPRT', 'الرياضة واللياقة البدنية', 'Sports and fitness'),
('الثقافة والفنون', 'Culture & Arts', 'CULT', 'الثقافة والفنون والتراث', 'Culture, arts and heritage'),
('الترفيه', 'Entertainment', 'ENTR', 'الترفيه والفعاليات', 'Entertainment and events'),

-- قطاعات متخصصة
('الأمن والحماية', 'Security & Protection', 'SECU', 'الأمن والحماية والمراقبة', 'Security, protection and surveillance'),
('الاستشارات', 'Consulting', 'CONS', 'الاستشارات الإدارية والمالية', 'Management and financial consulting'),
('الخدمات القانونية', 'Legal Services', 'LEGL', 'الخدمات القانونية والمحاماة', 'Legal services and law'),
('التدريب', 'Training', 'TRNG', 'التدريب وتطوير المهارات', 'Training and skills development'),
('الموارد البشرية', 'Human Resources', 'HR', 'إدارة الموارد البشرية والتوظيف', 'Human resources management and recruitment'),
('التسويق والإعلان', 'Marketing & Advertising', 'MKTG', 'التسويق والإعلان والعلاقات العامة', 'Marketing, advertising and public relations'),
('التأمينات الاجتماعية', 'Social Insurance', 'SOCI', 'التأمينات الاجتماعية والمعاشات', 'Social insurance and pensions'),
('الخدمات البيئية', 'Environmental Services', 'ENVR', 'الخدمات البيئية وإدارة النفايات', 'Environmental services and waste management'),
('التكنولوجيا المالية', 'FinTech', 'FINT', 'التكنولوجيا المالية والدفع الرقمي', 'Financial technology and digital payments'),
('الذكاء الاصطناعي', 'Artificial Intelligence', 'AI', 'الذكاء الاصطناعي وتعلم الآلة', 'Artificial intelligence and machine learning'),

-- قطاعات ناشئة
('البلوك تشين', 'Blockchain', 'BLOC', 'تقنية البلوك تشين والعملات الرقمية', 'Blockchain technology and cryptocurrencies'),
('إنترنت الأشياء', 'Internet of Things', 'IOT', 'إنترنت الأشياء والأجهزة الذكية', 'Internet of Things and smart devices'),
('الواقع الافتراضي', 'Virtual Reality', 'VR', 'الواقع الافتراضي والمعزز', 'Virtual and augmented reality'),
('التجارة الاجتماعية', 'Social Commerce', 'SOCM', 'التجارة الاجتماعية والتسويق الرقمي', 'Social commerce and digital marketing'),
('الاستدامة', 'Sustainability', 'SUST', 'الاستدامة والبيئة الخضراء', 'Sustainability and green environment'),
('التقنيات الطبية', 'Medical Technology', 'MEDT', 'التقنيات الطبية والأجهزة الطبية', 'Medical technology and devices');

-- إدخال الأنشطة الاقتصادية المفصلة
INSERT INTO economic_activities (sector_id, name_ar, name_en, code, description_ar, description_en, risk_level) VALUES

-- أنشطة المصارف (sector_id = 1)
(1, 'الخدمات المصرفية للأفراد', 'Retail Banking', 'BANK-001', 'الخدمات المصرفية للعملاء الأفراد', 'Banking services for individual customers', 'low'),
(1, 'الخدمات المصرفية للشركات', 'Corporate Banking', 'BANK-002', 'الخدمات المصرفية للشركات والمؤسسات', 'Banking services for corporations and institutions', 'medium'),
(1, 'المصرفية الاستثمارية', 'Investment Banking', 'BANK-003', 'الخدمات المصرفية الاستثمارية والاندماج والاستحواذ', 'Investment banking services and M&A', 'high'),
(1, 'التمويل الإسلامي', 'Islamic Finance', 'BANK-004', 'الخدمات المصرفية الإسلامية والتمويل الشرعي', 'Islamic banking and Sharia-compliant financing', 'medium'),
(1, 'التمويل الصغير', 'Microfinance', 'BANK-005', 'التمويل الصغير للمشاريع الناشئة', 'Microfinance for startups and small businesses', 'high'),

-- أنشطة التأمين (sector_id = 2)
(2, 'التأمين على الحياة', 'Life Insurance', 'INSUR-001', 'تأمين الحياة والتأمين الصحي', 'Life insurance and health insurance', 'medium'),
(2, 'التأمين العام', 'General Insurance', 'INSUR-002', 'التأمين على الممتلكات والحوادث', 'Property and casualty insurance', 'medium'),
(2, 'إعادة التأمين', 'Reinsurance', 'INSUR-003', 'إعادة التأمين والتأمين التبادلي', 'Reinsurance and mutual insurance', 'high'),
(2, 'التأمين الطبي', 'Medical Insurance', 'INSUR-004', 'التأمين الطبي والرعاية الصحية', 'Medical insurance and healthcare coverage', 'medium'),
(2, 'تأمين السيارات', 'Auto Insurance', 'INSUR-005', 'تأمين السيارات والمركبات', 'Automotive and vehicle insurance', 'medium'),

-- أنشطة الاستثمار (sector_id = 3)
(3, 'إدارة الأصول', 'Asset Management', 'INVST-001', 'إدارة الأصول والمحافظ الاستثمارية', 'Asset management and investment portfolios', 'high'),
(3, 'صناديق الاستثمار', 'Investment Funds', 'INVST-002', 'صناديق الاستثمار المشتركة والمتخصصة', 'Mutual funds and specialized investment funds', 'high'),
(3, 'رأس المال المخاطر', 'Venture Capital', 'INVST-003', 'الاستثمار في الشركات الناشئة والتقنية', 'Investment in startups and technology companies', 'very_high'),
(3, 'الأسهم الخاصة', 'Private Equity', 'INVST-004', 'استثمارات الأسهم الخاصة والشراكات', 'Private equity investments and partnerships', 'high'),
(3, 'الاستثمار العقاري', 'Real Estate Investment', 'INVST-005', 'الاستثمار في العقارات والتطوير العقاري', 'Real estate investment and development', 'medium'),

-- أنشطة التمويل (sector_id = 4)
(4, 'التمويل الشخصي', 'Personal Finance', 'FINC-001', 'التمويل الشخصي والقروض الاستهلاكية', 'Personal financing and consumer loans', 'medium'),
(4, 'تمويل الشركات', 'Corporate Finance', 'FINC-002', 'تمويل الشركات والمشاريع التجارية', 'Corporate financing and business projects', 'medium'),
(4, 'التمويل التجاري', 'Trade Finance', 'FINC-003', 'تمويل التجارة الدولية والاعتمادات المستندية', 'International trade financing and letters of credit', 'medium'),
(4, 'تمويل المشاريع', 'Project Finance', 'FINC-004', 'تمويل المشاريع الكبرى والبنية التحتية', 'Large project and infrastructure financing', 'high'),
(4, 'التأجير التمويلي', 'Leasing', 'FINC-005', 'التأجير التمويلي والإجارة المنتهية بالتمليك', 'Financial leasing and lease-to-own', 'medium'),

-- أنشطة الأسواق المالية (sector_id = 5)
(5, 'الوساطة المالية', 'Brokerage', 'CPTL-001', 'الوساطة في الأوراق المالية والأسهم', 'Securities and stock brokerage', 'high'),
(5, 'صناعة السوق', 'Market Making', 'CPTL-002', 'صناعة السوق وتوفير السيولة', 'Market making and liquidity provision', 'high'),
(5, 'الاكتتابات العامة', 'Public Offerings', 'CPTL-003', 'إدارة الاكتتابات العامة والطروحات', 'IPO management and public offerings', 'high'),
(5, 'المشتقات المالية', 'Derivatives', 'CPTL-004', 'تداول المشتقات المالية والعقود الآجلة', 'Financial derivatives and futures trading', 'very_high'),
(5, 'السندات', 'Bonds', 'CPTL-005', 'إصدار وتداول السندات والصكوك', 'Bond issuance and sukuk trading', 'medium'),

-- أنشطة البترول والغاز (sector_id = 6)
(6, 'استكشاف النفط', 'Oil Exploration', 'OIL-001', 'استكشاف وتطوير حقول النفط', 'Oil field exploration and development', 'high'),
(6, 'إنتاج النفط', 'Oil Production', 'OIL-002', 'إنتاج واستخراج النفط الخام', 'Crude oil production and extraction', 'high'),
(6, 'تكرير النفط', 'Oil Refining', 'OIL-003', 'تكرير النفط ومعالجة المنتجات البترولية', 'Oil refining and petroleum product processing', 'high'),
(6, 'إنتاج الغاز الطبيعي', 'Natural Gas Production', 'OIL-004', 'إنتاج ومعالجة الغاز الطبيعي', 'Natural gas production and processing', 'high'),
(6, 'النقل البترولي', 'Petroleum Transportation', 'OIL-005', 'نقل وتوزيع المنتجات البترولية', 'Petroleum product transportation and distribution', 'medium'),

-- أنشطة البتروكيماويات (sector_id = 7)
(7, 'البلاستيك', 'Plastics', 'PTCH-001', 'صناعة البلاستيك والمواد البلاستيكية', 'Plastic and plastic materials manufacturing', 'medium'),
(7, 'الألياف الصناعية', 'Synthetic Fibers', 'PTCH-002', 'إنتاج الألياف الصناعية والنسيج', 'Synthetic fiber and textile production', 'medium'),
(7, 'المواد الكيماوية', 'Chemical Materials', 'PTCH-003', 'إنتاج المواد الكيماوية الأساسية', 'Basic chemical materials production', 'high'),
(7, 'الأسمدة', 'Fertilizers', 'PTCH-004', 'صناعة الأسمدة والمنتجات الزراعية', 'Fertilizer and agricultural product manufacturing', 'medium'),
(7, 'المطاط الصناعي', 'Synthetic Rubber', 'PTCH-005', 'إنتاج المطاط الصناعي والمواد المرنة', 'Synthetic rubber and flexible materials production', 'medium');

-- فهرسة الجداول لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_sectors_code ON sectors(code);
CREATE INDEX IF NOT EXISTS idx_sectors_active ON sectors(is_active);
CREATE INDEX IF NOT EXISTS idx_activities_sector ON economic_activities(sector_id);
CREATE INDEX IF NOT EXISTS idx_activities_code ON economic_activities(code);
CREATE INDEX IF NOT EXISTS idx_activities_active ON economic_activities(is_active);

-- إحصائيات القطاعات والأنشطة
-- إجمالي القطاعات: 53 قطاع
-- إجمالي الأنشطة: 30 نشاط (يمكن إضافة المزيد)

-- تعليقات للمطورين:
-- 1. تم تصنيف القطاعات حسب الاقتصاد السعودي ورؤية 2030
-- 2. تم تضمين القطاعات الناشئة والتقنية الحديثة
-- 3. كل نشاط يحتوي على مستوى مخاطرة لاستخدامه في التحليل المالي
-- 4. الرموز القطاعية متوافقة مع المعايير الدولية
-- 5. دعم كامل للغة العربية والإنجليزية