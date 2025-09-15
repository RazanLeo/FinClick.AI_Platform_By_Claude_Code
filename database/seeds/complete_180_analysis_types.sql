-- Complete 180 Financial Analysis Types for FinClick.AI
-- Classification: Classical Foundational (106), Applied Intermediate (21), Advanced (53)

DROP TABLE IF EXISTS analysis_types;

CREATE TABLE analysis_types (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Classical', 'Intermediate', 'Advanced')),
    subcategory VARCHAR(100),
    formula TEXT,
    calculation_logic JSONB,
    required_fields JSONB,
    output_format JSONB,
    industry_specific BOOLEAN DEFAULT FALSE,
    complexity_level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CLASSICAL FOUNDATIONAL ANALYSIS (106 ANALYSES)
-- =====================================================

INSERT INTO analysis_types (name_en, name_ar, description_en, description_ar, category, subcategory, formula, calculation_logic, required_fields, output_format) VALUES

-- LIQUIDITY ANALYSIS (18 analyses)
('Current Ratio', 'نسبة التداول', 'Ability to pay short-term obligations', 'قدرة الشركة على سداد الالتزامات قصيرة الأجل', 'Classical', 'Liquidity Ratios', 'Current Assets / Current Liabilities', '{"interpretation": {"excellent": "> 2.5", "good": "1.5-2.5", "average": "1.0-1.5", "poor": "< 1.0"}}', '["current_assets", "current_liabilities"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Quick Ratio', 'النسبة السريعة', 'Immediate liquidity without inventory', 'السيولة الفورية بدون المخزون', 'Classical', 'Liquidity Ratios', '(Current Assets - Inventory) / Current Liabilities', '{"interpretation": {"excellent": "> 1.5", "good": "1.0-1.5", "average": "0.7-1.0", "poor": "< 0.7"}}', '["current_assets", "inventory", "current_liabilities"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Cash Ratio', 'نسبة النقد', 'Cash and equivalents to current liabilities', 'النقد ومعادلاته إلى الخصوم المتداولة', 'Classical', 'Liquidity Ratios', '(Cash + Cash Equivalents) / Current Liabilities', '{"interpretation": {"excellent": "> 0.5", "good": "0.3-0.5", "average": "0.1-0.3", "poor": "< 0.1"}}', '["cash", "cash_equivalents", "current_liabilities"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Working Capital', 'رأس المال العامل', 'Current assets minus current liabilities', 'الأصول المتداولة ناقص الخصوم المتداولة', 'Classical', 'Liquidity Ratios', 'Current Assets - Current Liabilities', '{"interpretation": {"positive": "good", "negative": "concerning"}}', '["current_assets", "current_liabilities"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Net Working Capital Ratio', 'نسبة صافي رأس المال العامل', 'Working capital to total assets', 'رأس المال العامل إلى إجمالي الأصول', 'Classical', 'Liquidity Ratios', 'Working Capital / Total Assets', '{"interpretation": {"excellent": "> 0.2", "good": "0.1-0.2", "average": "0-0.1", "poor": "< 0"}}', '["working_capital", "total_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Operating Cash Flow Ratio', 'نسبة التدفق النقدي التشغيلي', 'Operating cash flow to current liabilities', 'التدفق النقدي التشغيلي إلى الخصوم المتداولة', 'Classical', 'Liquidity Ratios', 'Operating Cash Flow / Current Liabilities', '{"interpretation": {"excellent": "> 0.4", "good": "0.25-0.4", "average": "0.15-0.25", "poor": "< 0.15"}}', '["operating_cash_flow", "current_liabilities"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Defensive Interval Ratio', 'نسبة الفترة الدفاعية', 'Days company can operate without financing', 'أيام تشغيل الشركة بدون تمويل إضافي', 'Classical', 'Liquidity Ratios', '(Cash + Short-term Investments + Receivables) / Daily Operating Expenses', '{"interpretation": {"excellent": "> 100", "good": "60-100", "average": "30-60", "poor": "< 30"}}', '["cash", "short_term_investments", "accounts_receivable", "daily_operating_expenses"]', '{"type": "days", "unit": "days", "decimal_places": 0}'),

('Acid Test Ratio', 'نسبة الاختبار الحمضي', 'Same as quick ratio', 'مثل النسبة السريعة', 'Classical', 'Liquidity Ratios', '(Cash + Short-term Investments + Receivables) / Current Liabilities', '{"interpretation": {"excellent": "> 1.5", "good": "1.0-1.5", "average": "0.7-1.0", "poor": "< 0.7"}}', '["cash", "short_term_investments", "accounts_receivable", "current_liabilities"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Cash Coverage Ratio', 'نسبة التغطية النقدية', 'Cash available for current liabilities', 'النقد المتاح للخصوم المتداولة', 'Classical', 'Liquidity Ratios', '(Cash + Short-term Investments) / Current Liabilities', '{"interpretation": {"excellent": "> 0.4", "good": "0.2-0.4", "average": "0.1-0.2", "poor": "< 0.1"}}', '["cash", "short_term_investments", "current_liabilities"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Liquidity Index', 'مؤشر السيولة', 'Weighted average of liquid assets', 'المتوسط المرجح للأصول السائلة', 'Classical', 'Liquidity Ratios', 'Weighted Average of Liquid Assets / Current Liabilities', '{"interpretation": {"excellent": "> 1.5", "good": "1.2-1.5", "average": "1.0-1.2", "poor": "< 1.0"}}', '["cash", "short_term_investments", "accounts_receivable", "inventory", "current_liabilities"]', '{"type": "ratio", "unit": "index", "decimal_places": 2}'),

('Super Quick Ratio', 'النسبة السريعة الفائقة', 'Cash and equivalents only', 'النقد ومعادلاته فقط', 'Classical', 'Liquidity Ratios', '(Cash + Cash Equivalents) / Current Liabilities', '{"interpretation": {"excellent": "> 0.3", "good": "0.2-0.3", "average": "0.1-0.2", "poor": "< 0.1"}}', '["cash", "cash_equivalents", "current_liabilities"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Basic Liquidity Ratio', 'نسبة السيولة الأساسية', 'Quick assets to total assets', 'الأصول السريعة إلى إجمالي الأصول', 'Classical', 'Liquidity Ratios', '(Cash + Short-term Investments + Receivables) / Total Assets', '{"interpretation": {"excellent": "> 0.3", "good": "0.2-0.3", "average": "0.1-0.2", "poor": "< 0.1"}}', '["cash", "short_term_investments", "accounts_receivable", "total_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Immediate Liquidity Ratio', 'نسبة السيولة الفورية', 'Cash to current liabilities', 'النقد إلى الخصوم المتداولة', 'Classical', 'Liquidity Ratios', 'Cash / Current Liabilities', '{"interpretation": {"excellent": "> 0.2", "good": "0.1-0.2", "average": "0.05-0.1", "poor": "< 0.05"}}', '["cash", "current_liabilities"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Liquidity Buffer Ratio', 'نسبة الاحتياطي للسيولة', 'Excess liquid assets ratio', 'نسبة الأصول السائلة الزائدة', 'Classical', 'Liquidity Ratios', '(Liquid Assets - Minimum Required) / Total Assets', '{"interpretation": {"excellent": "> 0.15", "good": "0.1-0.15", "average": "0.05-0.1", "poor": "< 0.05"}}', '["liquid_assets", "minimum_required_liquidity", "total_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Days Cash on Hand', 'أيام النقد المتاح', 'Days company can operate with available cash', 'أيام تشغيل الشركة بالنقد المتاح', 'Classical', 'Liquidity Ratios', 'Cash / Daily Operating Expenses', '{"interpretation": {"excellent": "> 60", "good": "30-60", "average": "15-30", "poor": "< 15"}}', '["cash", "daily_operating_expenses"]', '{"type": "days", "unit": "days", "decimal_places": 0}'),

('Net Liquid Balance', 'صافي الرصيد السائل', 'Liquid assets minus short-term debt', 'الأصول السائلة ناقص الدين قصير الأجل', 'Classical', 'Liquidity Ratios', 'Liquid Assets - Short-term Debt', '{"interpretation": {"positive": "good", "negative": "concerning"}}', '["liquid_assets", "short_term_debt"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Cash to Total Assets', 'النقد إلى إجمالي الأصول', 'Cash percentage of total assets', 'نسبة النقد من إجمالي الأصول', 'Classical', 'Liquidity Ratios', 'Cash / Total Assets', '{"interpretation": {"high": "> 0.1", "moderate": "0.05-0.1", "low": "< 0.05"}}', '["cash", "total_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Liquid Asset Ratio', 'نسبة الأصول السائلة', 'All liquid assets to current liabilities', 'جميع الأصول السائلة إلى الخصوم المتداولة', 'Classical', 'Liquidity Ratios', '(Cash + Marketable Securities + Receivables) / Current Liabilities', '{"interpretation": {"excellent": "> 1.2", "good": "0.8-1.2", "average": "0.5-0.8", "poor": "< 0.5"}}', '["cash", "marketable_securities", "accounts_receivable", "current_liabilities"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

-- LEVERAGE ANALYSIS (20 analyses)
('Debt-to-Equity Ratio', 'نسبة الدين إلى حقوق الملكية', 'Total debt to shareholders equity', 'إجمالي الدين إلى حقوق المساهمين', 'Classical', 'Leverage Ratios', 'Total Debt / Total Equity', '{"interpretation": {"low": "< 0.3", "moderate": "0.3-0.6", "high": "0.6-1.0", "very_high": "> 1.0"}}', '["total_debt", "total_equity"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Debt Ratio', 'نسبة الدين', 'Total debt to total assets', 'إجمالي الدين إلى إجمالي الأصول', 'Classical', 'Leverage Ratios', 'Total Debt / Total Assets', '{"interpretation": {"low": "< 0.3", "moderate": "0.3-0.5", "high": "0.5-0.7", "very_high": "> 0.7"}}', '["total_debt", "total_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Equity Ratio', 'نسبة حقوق الملكية', 'Shareholders equity to total assets', 'حقوق المساهمين إلى إجمالي الأصول', 'Classical', 'Leverage Ratios', 'Total Equity / Total Assets', '{"interpretation": {"excellent": "> 0.7", "good": "0.5-0.7", "average": "0.3-0.5", "poor": "< 0.3"}}', '["total_equity", "total_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Long-term Debt to Equity', 'الدين طويل الأجل إلى حقوق الملكية', 'Long-term debt to equity ratio', 'نسبة الدين طويل الأجل إلى حقوق الملكية', 'Classical', 'Leverage Ratios', 'Long-term Debt / Total Equity', '{"interpretation": {"low": "< 0.3", "moderate": "0.3-0.6", "high": "> 0.6"}}', '["long_term_debt", "total_equity"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Debt-to-Capital Ratio', 'نسبة الدين إلى رأس المال', 'Total debt to total capital', 'إجمالي الدين إلى إجمالي رأس المال', 'Classical', 'Leverage Ratios', 'Total Debt / (Total Debt + Total Equity)', '{"interpretation": {"low": "< 0.3", "moderate": "0.3-0.5", "high": "> 0.5"}}', '["total_debt", "total_equity"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Interest Coverage Ratio', 'نسبة تغطية الفوائد', 'EBIT to interest expense', 'الأرباح قبل الفوائد والضرائب إلى مصاريف الفوائد', 'Classical', 'Leverage Ratios', 'EBIT / Interest Expense', '{"interpretation": {"excellent": "> 8", "good": "4-8", "average": "2-4", "poor": "< 2"}}', '["ebit", "interest_expense"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Times Interest Earned', 'عدد مرات كسب الفوائد', 'Same as interest coverage ratio', 'مثل نسبة تغطية الفوائد', 'Classical', 'Leverage Ratios', 'EBIT / Interest Expense', '{"interpretation": {"excellent": "> 8", "good": "4-8", "average": "2-4", "poor": "< 2"}}', '["ebit", "interest_expense"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('EBITDA Coverage Ratio', 'نسبة تغطية الأرباح قبل الفوائد والضرائب والاستهلاك', 'EBITDA to interest payments', 'الأرباح قبل الفوائد والضرائب والاستهلاك إلى مدفوعات الفوائد', 'Classical', 'Leverage Ratios', 'EBITDA / Interest Expense', '{"interpretation": {"excellent": "> 10", "good": "5-10", "average": "2-5", "poor": "< 2"}}', '["ebitda", "interest_expense"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Fixed Charge Coverage', 'تغطية الرسوم الثابتة', 'Earnings to fixed charges', 'الأرباح إلى الرسوم الثابتة', 'Classical', 'Leverage Ratios', '(EBIT + Fixed Charges) / (Interest + Fixed Charges)', '{"interpretation": {"excellent": "> 5", "good": "2.5-5", "average": "1.5-2.5", "poor": "< 1.5"}}', '["ebit", "fixed_charges", "interest_expense"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Debt Service Coverage', 'تغطية خدمة الدين', 'Operating income to debt service', 'الدخل التشغيلي إلى خدمة الدين', 'Classical', 'Leverage Ratios', 'Operating Income / (Principal + Interest Payments)', '{"interpretation": {"strong": "> 2", "adequate": "1.5-2", "weak": "< 1.5"}}', '["operating_income", "principal_payments", "interest_payments"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Total Capitalization Ratio', 'نسبة الرسملة الإجمالية', 'Long-term debt to total capital', 'الدين طويل الأجل إلى إجمالي رأس المال', 'Classical', 'Leverage Ratios', 'Long-term Debt / (Long-term Debt + Equity)', '{"interpretation": {"low": "< 0.3", "moderate": "0.3-0.5", "high": "> 0.5"}}', '["long_term_debt", "total_equity"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Financial Leverage', 'الرافعة المالية', 'Total assets to equity multiplier', 'مضاعف إجمالي الأصول إلى حقوق الملكية', 'Classical', 'Leverage Ratios', 'Total Assets / Total Equity', '{"interpretation": {"conservative": "< 2", "moderate": "2-4", "aggressive": "> 4"}}', '["total_assets", "total_equity"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Equity Multiplier', 'مضاعف حقوق الملكية', 'Assets to equity ratio', 'نسبة الأصول إلى حقوق الملكية', 'Classical', 'Leverage Ratios', 'Total Assets / Shareholders Equity', '{"interpretation": {"low": "< 2", "moderate": "2-3", "high": "> 3"}}', '["total_assets", "total_equity"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Capitalization Ratio', 'نسبة الرسملة', 'Long-term debt to capitalization', 'الدين طويل الأجل إلى الرسملة', 'Classical', 'Leverage Ratios', 'Long-term Debt / Total Capitalization', '{"interpretation": {"low": "< 0.3", "moderate": "0.3-0.5", "high": "> 0.5"}}', '["long_term_debt", "total_capitalization"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Debt-to-EBITDA Ratio', 'نسبة الدين إلى الأرباح قبل الفوائد والضرائب والاستهلاك', 'Total debt to EBITDA', 'إجمالي الدين إلى الأرباح قبل الفوائد والضرائب والاستهلاك', 'Classical', 'Leverage Ratios', 'Total Debt / EBITDA', '{"interpretation": {"low": "< 2", "moderate": "2-4", "high": "4-6", "very_high": "> 6"}}', '["total_debt", "ebitda"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Long-term Debt Ratio', 'نسبة الدين طويل الأجل', 'Long-term debt to assets', 'الدين طويل الأجل إلى الأصول', 'Classical', 'Leverage Ratios', 'Long-term Debt / Total Assets', '{"interpretation": {"low": "< 0.2", "moderate": "0.2-0.4", "high": "> 0.4"}}', '["long_term_debt", "total_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Short-term Debt Ratio', 'نسبة الدين قصير الأجل', 'Short-term debt to assets', 'الدين قصير الأجل إلى الأصول', 'Classical', 'Leverage Ratios', 'Short-term Debt / Total Assets', '{"interpretation": {"low": "< 0.1", "moderate": "0.1-0.2", "high": "> 0.2"}}', '["short_term_debt", "total_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Preferred Stock Ratio', 'نسبة الأسهم المفضلة', 'Preferred stock to total equity', 'الأسهم المفضلة إلى إجمالي حقوق الملكية', 'Classical', 'Leverage Ratios', 'Preferred Stock / Total Equity', '{"interpretation": {"low": "< 0.1", "moderate": "0.1-0.3", "high": "> 0.3"}}', '["preferred_stock", "total_equity"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Cash Debt Coverage', 'تغطية الدين النقدي', 'Operating cash flow to total debt', 'التدفق النقدي التشغيلي إلى إجمالي الدين', 'Classical', 'Leverage Ratios', 'Operating Cash Flow / Total Debt', '{"interpretation": {"strong": "> 0.4", "adequate": "0.2-0.4", "weak": "< 0.2"}}', '["operating_cash_flow", "total_debt"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Asset Coverage Ratio', 'نسبة تغطية الأصول', 'Tangible assets coverage of debt', 'تغطية الأصول الملموسة للدين', 'Classical', 'Leverage Ratios', '(Total Assets - Intangible Assets - Current Liabilities) / Total Debt', '{"interpretation": {"strong": "> 1.5", "adequate": "1.0-1.5", "weak": "< 1.0"}}', '["total_assets", "intangible_assets", "current_liabilities", "total_debt"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

-- ACTIVITY/EFFICIENCY ANALYSIS (23 analyses)
('Asset Turnover', 'معدل دوران الأصول', 'Revenue to total assets', 'الإيرادات إلى إجمالي الأصول', 'Classical', 'Activity Ratios', 'Revenue / Average Total Assets', '{"interpretation": {"excellent": "> 2.0", "good": "1.5-2.0", "average": "1.0-1.5", "poor": "< 1.0"}}', '["revenue", "average_total_assets"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Fixed Asset Turnover', 'معدل دوران الأصول الثابتة', 'Revenue to net fixed assets', 'الإيرادات إلى صافي الأصول الثابتة', 'Classical', 'Activity Ratios', 'Revenue / Average Net Fixed Assets', '{"interpretation": {"excellent": "> 4", "good": "2-4", "average": "1-2", "poor": "< 1"}}', '["revenue", "average_net_fixed_assets"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Inventory Turnover', 'معدل دوران المخزون', 'COGS to average inventory', 'تكلفة البضاعة المباعة إلى متوسط المخزون', 'Classical', 'Activity Ratios', 'COGS / Average Inventory', '{"interpretation": {"excellent": "> 12", "good": "8-12", "average": "4-8", "poor": "< 4"}}', '["cogs", "average_inventory"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Receivables Turnover', 'معدل دوران المدينين', 'Net sales to average receivables', 'صافي المبيعات إلى متوسط المدينين', 'Classical', 'Activity Ratios', 'Net Credit Sales / Average Accounts Receivable', '{"interpretation": {"excellent": "> 12", "good": "8-12", "average": "4-8", "poor": "< 4"}}', '["net_credit_sales", "average_accounts_receivable"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Payables Turnover', 'معدل دوران الدائنين', 'COGS to average payables', 'تكلفة البضاعة المباعة إلى متوسط الدائنين', 'Classical', 'Activity Ratios', 'COGS / Average Accounts Payable', '{"interpretation": {"excellent": "6-12", "good": "4-6", "average": "2-4", "poor": "< 2"}}', '["cogs", "average_accounts_payable"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Working Capital Turnover', 'معدل دوران رأس المال العامل', 'Revenue to working capital', 'الإيرادات إلى رأس المال العامل', 'Classical', 'Activity Ratios', 'Revenue / Average Working Capital', '{"interpretation": {"excellent": "> 12", "good": "8-12", "average": "4-8", "poor": "< 4"}}', '["revenue", "average_working_capital"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Total Capital Turnover', 'معدل دوران إجمالي رأس المال', 'Revenue to total capital', 'الإيرادات إلى إجمالي رأس المال', 'Classical', 'Activity Ratios', 'Revenue / Average Total Capital', '{"interpretation": {"excellent": "> 2", "good": "1.5-2", "average": "1-1.5", "poor": "< 1"}}', '["revenue", "average_total_capital"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Days Sales Outstanding', 'أيام المبيعات المعلقة', 'Average collection period', 'متوسط فترة التحصيل', 'Classical', 'Activity Ratios', '365 / Receivables Turnover', '{"interpretation": {"excellent": "< 30", "good": "30-45", "average": "45-60", "poor": "> 60"}}', '["receivables_turnover"]', '{"type": "days", "unit": "days", "decimal_places": 0}'),

('Days Inventory Outstanding', 'أيام المخزون المعلق', 'Average inventory period', 'متوسط فترة المخزون', 'Classical', 'Activity Ratios', '365 / Inventory Turnover', '{"interpretation": {"excellent": "< 30", "good": "30-60", "average": "60-90", "poor": "> 90"}}', '["inventory_turnover"]', '{"type": "days", "unit": "days", "decimal_places": 0}'),

('Days Payable Outstanding', 'أيام الدائنين المعلقة', 'Average payment period', 'متوسط فترة السداد', 'Classical', 'Activity Ratios', '365 / Payables Turnover', '{"interpretation": {"excellent": "> 45", "good": "30-45", "average": "15-30", "poor": "< 15"}}', '["payables_turnover"]', '{"type": "days", "unit": "days", "decimal_places": 0}'),

('Cash Conversion Cycle', 'دورة تحويل النقد', 'Days to convert investment to cash', 'أيام تحويل الاستثمار إلى نقد', 'Classical', 'Activity Ratios', 'DIO + DSO - DPO', '{"interpretation": {"excellent": "< 30", "good": "30-60", "average": "60-90", "poor": "> 90"}}', '["days_inventory_outstanding", "days_sales_outstanding", "days_payable_outstanding"]', '{"type": "days", "unit": "days", "decimal_places": 0}'),

('Current Asset Turnover', 'معدل دوران الأصول المتداولة', 'Revenue to current assets', 'الإيرادات إلى الأصول المتداولة', 'Classical', 'Activity Ratios', 'Revenue / Average Current Assets', '{"interpretation": {"excellent": "> 4", "good": "2-4", "average": "1-2", "poor": "< 1"}}', '["revenue", "average_current_assets"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Intangible Asset Turnover', 'معدل دوران الأصول غير الملموسة', 'Revenue to intangible assets', 'الإيرادات إلى الأصول غير الملموسة', 'Classical', 'Activity Ratios', 'Revenue / Average Intangible Assets', '{"interpretation": {"excellent": "> 8", "good": "4-8", "average": "2-4", "poor": "< 2"}}', '["revenue", "average_intangible_assets"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Cash Turnover', 'معدل دوران النقد', 'Revenue to average cash', 'الإيرادات إلى متوسط النقد', 'Classical', 'Activity Ratios', 'Revenue / Average Cash', '{"interpretation": {"excellent": "> 20", "good": "10-20", "average": "5-10", "poor": "< 5"}}', '["revenue", "average_cash"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Equipment Turnover', 'معدل دوران المعدات', 'Revenue to equipment value', 'الإيرادات إلى قيمة المعدات', 'Classical', 'Activity Ratios', 'Revenue / Average Equipment Value', '{"interpretation": {"excellent": "> 3", "good": "2-3", "average": "1-2", "poor": "< 1"}}', '["revenue", "average_equipment_value"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Building Turnover', 'معدل دوران المباني', 'Revenue to building value', 'الإيرادات إلى قيمة المباني', 'Classical', 'Activity Ratios', 'Revenue / Average Building Value', '{"interpretation": {"excellent": "> 2", "good": "1-2", "average": "0.5-1", "poor": "< 0.5"}}', '["revenue", "average_building_value"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Land Turnover', 'معدل دوران الأراضي', 'Revenue to land value', 'الإيرادات إلى قيمة الأراضي', 'Classical', 'Activity Ratios', 'Revenue / Land Value', '{"interpretation": {"excellent": "> 5", "good": "2-5", "average": "1-2", "poor": "< 1"}}', '["revenue", "land_value"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Investment Turnover', 'معدل دوران الاستثمارات', 'Revenue to investments', 'الإيرادات إلى الاستثمارات', 'Classical', 'Activity Ratios', 'Revenue / Average Investment Securities', '{"interpretation": {"excellent": "> 4", "good": "2-4", "average": "1-2", "poor": "< 1"}}', '["revenue", "average_investment_securities"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Sales to Net Worth', 'المبيعات إلى صافي الثروة', 'Sales relative to net worth', 'المبيعات بالنسبة لصافي الثروة', 'Classical', 'Activity Ratios', 'Net Sales / Net Worth', '{"interpretation": {"high": "> 6", "moderate": "3-6", "low": "< 3"}}', '["net_sales", "net_worth"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Creditors Turnover', 'معدل دوران الدائنين', 'Credit purchases to creditors', 'المشتريات الآجلة إلى الدائنين', 'Classical', 'Activity Ratios', 'Credit Purchases / Average Creditors', '{"interpretation": {"high": "> 8", "moderate": "4-8", "low": "< 4"}}', '["credit_purchases", "average_creditors"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Debtors Turnover', 'معدل دوران المدينين', 'Credit sales to debtors', 'المبيعات الآجلة إلى المدينين', 'Classical', 'Activity Ratios', 'Credit Sales / Average Debtors', '{"interpretation": {"high": "> 10", "moderate": "5-10", "low": "< 5"}}', '["credit_sales", "average_debtors"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Revenue per Employee', 'الإيرادات لكل موظف', 'Total revenue divided by employees', 'إجمالي الإيرادات مقسومة على عدد الموظفين', 'Classical', 'Activity Ratios', 'Total Revenue / Number of Employees', '{"interpretation": {"high": "> 500000", "moderate": "250000-500000", "low": "< 250000"}}', '["total_revenue", "number_of_employees"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Asset per Employee', 'الأصول لكل موظف', 'Total assets divided by employees', 'إجمالي الأصول مقسومة على عدد الموظفين', 'Classical', 'Activity Ratios', 'Total Assets / Number of Employees', '{"interpretation": {"high": "> 1000000", "moderate": "500000-1000000", "low": "< 500000"}}', '["total_assets", "number_of_employees"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

-- PROFITABILITY ANALYSIS (25 analyses)
('Gross Profit Margin', 'هامش الربح الإجمالي', 'Gross profit as percentage of revenue', 'الربح الإجمالي كنسبة من الإيرادات', 'Classical', 'Profitability Ratios', '(Revenue - COGS) / Revenue * 100', '{"interpretation": {"excellent": "> 40%", "good": "25-40%", "average": "15-25%", "poor": "< 15%"}}', '["revenue", "cogs"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Operating Profit Margin', 'هامش الربح التشغيلي', 'Operating profit as percentage of revenue', 'الربح التشغيلي كنسبة من الإيرادات', 'Classical', 'Profitability Ratios', 'Operating Income / Revenue * 100', '{"interpretation": {"excellent": "> 15%", "good": "10-15%", "average": "5-10%", "poor": "< 5%"}}', '["operating_income", "revenue"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Net Profit Margin', 'هامش صافي الربح', 'Net income as percentage of revenue', 'صافي الدخل كنسبة من الإيرادات', 'Classical', 'Profitability Ratios', 'Net Income / Revenue * 100', '{"interpretation": {"excellent": "> 10%", "good": "5-10%", "average": "2-5%", "poor": "< 2%"}}', '["net_income", "revenue"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Return on Assets (ROA)', 'العائد على الأصول', 'Net income relative to total assets', 'صافي الدخل بالنسبة لإجمالي الأصول', 'Classical', 'Profitability Ratios', 'Net Income / Average Total Assets * 100', '{"interpretation": {"excellent": "> 15%", "good": "10-15%", "average": "5-10%", "poor": "< 5%"}}', '["net_income", "average_total_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Return on Equity (ROE)', 'العائد على حقوق الملكية', 'Net income relative to shareholders equity', 'صافي الدخل بالنسبة لحقوق المساهمين', 'Classical', 'Profitability Ratios', 'Net Income / Average Total Equity * 100', '{"interpretation": {"excellent": "> 20%", "good": "15-20%", "average": "10-15%", "poor": "< 10%"}}', '["net_income", "average_total_equity"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Return on Investment (ROI)', 'العائد على الاستثمار', 'Net income relative to investment', 'صافي الدخل بالنسبة للاستثمار', 'Classical', 'Profitability Ratios', 'Net Income / Total Investment * 100', '{"interpretation": {"excellent": "> 25%", "good": "15-25%", "average": "8-15%", "poor": "< 8%"}}', '["net_income", "total_investment"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('EBITDA Margin', 'هامش الأرباح قبل الفوائد والضرائب والاستهلاك', 'EBITDA as percentage of revenue', 'الأرباح قبل الفوائد والضرائب والاستهلاك كنسبة من الإيرادات', 'Classical', 'Profitability Ratios', 'EBITDA / Revenue * 100', '{"interpretation": {"excellent": "> 20%", "good": "15-20%", "average": "10-15%", "poor": "< 10%"}}', '["ebitda", "revenue"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('EBIT Margin', 'هامش الأرباح قبل الفوائد والضرائب', 'EBIT as percentage of revenue', 'الأرباح قبل الفوائد والضرائب كنسبة من الإيرادات', 'Classical', 'Profitability Ratios', 'EBIT / Revenue * 100', '{"interpretation": {"excellent": "> 18%", "good": "12-18%", "average": "8-12%", "poor": "< 8%"}}', '["ebit", "revenue"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Pretax Profit Margin', 'هامش الربح قبل الضرائب', 'Pretax income as percentage of revenue', 'الدخل قبل الضرائب كنسبة من الإيرادات', 'Classical', 'Profitability Ratios', 'Pretax Income / Revenue * 100', '{"interpretation": {"excellent": "> 12%", "good": "8-12%", "average": "4-8%", "poor": "< 4%"}}', '["pretax_income", "revenue"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Operating Return on Assets', 'العائد التشغيلي على الأصول', 'Operating income to total assets', 'الدخل التشغيلي إلى إجمالي الأصول', 'Classical', 'Profitability Ratios', 'Operating Income / Average Total Assets * 100', '{"interpretation": {"excellent": "> 12%", "good": "8-12%", "average": "4-8%", "poor": "< 4%"}}', '["operating_income", "average_total_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Cash Return on Assets', 'العائد النقدي على الأصول', 'Operating cash flow to total assets', 'التدفق النقدي التشغيلي إلى إجمالي الأصول', 'Classical', 'Profitability Ratios', 'Operating Cash Flow / Average Total Assets * 100', '{"interpretation": {"excellent": "> 15%", "good": "10-15%", "average": "5-10%", "poor": "< 5%"}}', '["operating_cash_flow", "average_total_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Return on Sales', 'العائد على المبيعات', 'Net income to net sales', 'صافي الدخل إلى صافي المبيعات', 'Classical', 'Profitability Ratios', 'Net Income / Net Sales * 100', '{"interpretation": {"excellent": "> 8%", "good": "5-8%", "average": "2-5%", "poor": "< 2%"}}', '["net_income", "net_sales"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Return on Revenue', 'العائد على الإيرادات', 'Net income to total revenue', 'صافي الدخل إلى إجمالي الإيرادات', 'Classical', 'Profitability Ratios', 'Net Income / Total Revenue * 100', '{"interpretation": {"excellent": "> 8%", "good": "5-8%", "average": "2-5%", "poor": "< 2%"}}', '["net_income", "total_revenue"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Earnings per Share (EPS)', 'ربحية السهم', 'Net income per outstanding share', 'صافي الدخل لكل سهم متداول', 'Classical', 'Profitability Ratios', 'Net Income / Outstanding Shares', '{"interpretation": {"growing": "positive_trend", "stable": "consistent", "declining": "concerning"}}', '["net_income", "outstanding_shares"]', '{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Book Value per Share', 'القيمة الدفترية للسهم', 'Shareholders equity per share', 'حقوق المساهمين لكل سهم', 'Classical', 'Profitability Ratios', 'Total Shareholders Equity / Outstanding Shares', '{"interpretation": {"increasing": "value_growth", "stable": "consistent", "decreasing": "concerning"}}', '["total_shareholders_equity", "outstanding_shares"]', '{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Dividend per Share', 'توزيعات الأرباح للسهم', 'Total dividends per outstanding share', 'إجمالي توزيعات الأرباح لكل سهم متداول', 'Classical', 'Profitability Ratios', 'Total Dividends / Outstanding Shares', '{"interpretation": {"increasing": "shareholder_friendly", "stable": "consistent", "decreasing": "concerning"}}', '["total_dividends", "outstanding_shares"]', '{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Dividend Payout Ratio', 'نسبة توزيع الأرباح', 'Dividends relative to net income', 'توزيعات الأرباح بالنسبة لصافي الدخل', 'Classical', 'Profitability Ratios', 'Total Dividends / Net Income * 100', '{"interpretation": {"conservative": "< 40%", "moderate": "40-60%", "high": "> 60%"}}', '["total_dividends", "net_income"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Dividend Yield', 'عائد التوزيعات', 'Annual dividends per share to price per share', 'توزيعات الأرباح السنوية للسهم إلى سعر السهم', 'Classical', 'Profitability Ratios', 'Annual Dividends per Share / Price per Share * 100', '{"interpretation": {"high": "> 4%", "moderate": "2-4%", "low": "< 2%"}}', '["annual_dividends_per_share", "price_per_share"]', '{"type": "percentage", "unit": "%", "decimal_places": 2}'),

('Revenue Growth Rate', 'معدل نمو الإيرادات', 'Year-over-year revenue growth', 'نمو الإيرادات سنة بعد سنة', 'Classical', 'Profitability Ratios', '(Current Revenue - Previous Revenue) / Previous Revenue * 100', '{"interpretation": {"excellent": "> 15%", "good": "8-15%", "average": "3-8%", "poor": "< 3%"}}', '["current_revenue", "previous_revenue"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Earnings Growth Rate', 'معدل نمو الأرباح', 'Year-over-year earnings growth', 'نمو الأرباح سنة بعد سنة', 'Classical', 'Profitability Ratios', '(Current Earnings - Previous Earnings) / Previous Earnings * 100', '{"interpretation": {"excellent": "> 20%", "good": "10-20%", "average": "5-10%", "poor": "< 5%"}}', '["current_earnings", "previous_earnings"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Retention Ratio', 'نسبة الاحتفاظ', 'Retained earnings to net income', 'الأرباح المحتجزة إلى صافي الدخل', 'Classical', 'Profitability Ratios', 'Retained Earnings / Net Income * 100', '{"interpretation": {"high": "> 60%", "moderate": "40-60%", "low": "< 40%"}}', '["retained_earnings", "net_income"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Asset Coverage Ratio', 'نسبة تغطية الأصول للربحية', 'Earnings coverage of assets', 'تغطية الأرباح للأصول', 'Classical', 'Profitability Ratios', 'Net Income / (Total Assets - Intangible Assets) * 100', '{"interpretation": {"high": "> 8%", "moderate": "4-8%", "low": "< 4%"}}', '["net_income", "total_assets", "intangible_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Cash Earnings per Share', 'الأرباح النقدية للسهم', 'Cash earnings per outstanding share', 'الأرباح النقدية لكل سهم متداول', 'Classical', 'Profitability Ratios', '(Net Income + Depreciation) / Outstanding Shares', '{"interpretation": {"high": "> EPS", "equal": "= EPS", "low": "< EPS"}}', '["net_income", "depreciation", "outstanding_shares"]', '{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Operating Cash Flow per Share', 'التدفق النقدي التشغيلي للسهم', 'Operating cash flow per share', 'التدفق النقدي التشغيلي لكل سهم', 'Classical', 'Profitability Ratios', 'Operating Cash Flow / Outstanding Shares', '{"interpretation": {"strong": "> 10", "moderate": "5-10", "weak": "< 5"}}', '["operating_cash_flow", "outstanding_shares"]', '{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Free Cash Flow per Share', 'التدفق النقدي الحر للسهم', 'Free cash flow per outstanding share', 'التدفق النقدي الحر لكل سهم متداول', 'Classical', 'Profitability Ratios', 'Free Cash Flow / Outstanding Shares', '{"interpretation": {"excellent": "> 8", "good": "4-8", "average": "2-4", "poor": "< 2"}}', '["free_cash_flow", "outstanding_shares"]', '{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

-- MARKET VALUE ANALYSIS (12 analyses)
('Price-to-Earnings Ratio (P/E)', 'نسبة السعر إلى الأرباح', 'Market price per share to earnings per share', 'سعر السوق للسهم إلى ربحية السهم', 'Classical', 'Market Value Ratios', 'Price per Share / Earnings per Share', '{"interpretation": {"undervalued": "< 15", "fair": "15-25", "overvalued": "> 25"}}', '["price_per_share", "earnings_per_share"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Price-to-Book Ratio (P/B)', 'نسبة السعر إلى القيمة الدفترية', 'Market price to book value per share', 'سعر السوق إلى القيمة الدفترية للسهم', 'Classical', 'Market Value Ratios', 'Price per Share / Book Value per Share', '{"interpretation": {"undervalued": "< 1", "fair": "1-3", "overvalued": "> 3"}}', '["price_per_share", "book_value_per_share"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Price-to-Sales Ratio (P/S)', 'نسبة السعر إلى المبيعات', 'Market cap to total sales', 'القيمة السوقية إلى إجمالي المبيعات', 'Classical', 'Market Value Ratios', 'Market Capitalization / Total Sales', '{"interpretation": {"undervalued": "< 1", "fair": "1-2", "overvalued": "> 2"}}', '["market_capitalization", "total_sales"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Price-to-Cash Flow Ratio', 'نسبة السعر إلى التدفق النقدي', 'Price per share to cash flow per share', 'سعر السهم إلى التدفق النقدي للسهم', 'Classical', 'Market Value Ratios', 'Price per Share / Cash Flow per Share', '{"interpretation": {"undervalued": "< 10", "fair": "10-15", "overvalued": "> 15"}}', '["price_per_share", "cash_flow_per_share"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Market-to-Book Ratio', 'نسبة السوق إلى الدفتر', 'Market value to book value', 'القيمة السوقية إلى القيمة الدفترية', 'Classical', 'Market Value Ratios', 'Market Value of Equity / Book Value of Equity', '{"interpretation": {"undervalued": "< 1", "fair": "1-2", "overvalued": "> 2"}}', '["market_value_of_equity", "book_value_of_equity"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Enterprise Value to EBITDA', 'قيمة المشروع إلى الأرباح قبل الفوائد والضرائب والاستهلاك', 'EV to EBITDA multiple', 'مضاعف قيمة المشروع إلى الأرباح قبل الفوائد والضرائب والاستهلاك', 'Classical', 'Market Value Ratios', 'Enterprise Value / EBITDA', '{"interpretation": {"undervalued": "< 8", "fair": "8-12", "overvalued": "> 12"}}', '["enterprise_value", "ebitda"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Enterprise Value to Sales', 'قيمة المشروع إلى المبيعات', 'EV to sales multiple', 'مضاعف قيمة المشروع إلى المبيعات', 'Classical', 'Market Value Ratios', 'Enterprise Value / Total Sales', '{"interpretation": {"undervalued": "< 1", "fair": "1-3", "overvalued": "> 3"}}', '["enterprise_value", "total_sales"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Market Capitalization', 'القيمة السوقية', 'Total market value of shares', 'إجمالي القيمة السوقية للأسهم', 'Classical', 'Market Value Ratios', 'Outstanding Shares × Price per Share', '{"interpretation": {"large_cap": "> 10B", "mid_cap": "2B-10B", "small_cap": "< 2B"}}', '["outstanding_shares", "price_per_share"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Enterprise Value', 'قيمة المشروع', 'Market cap plus debt minus cash', 'القيمة السوقية زائد الدين ناقص النقد', 'Classical', 'Market Value Ratios', 'Market Capitalization + Total Debt - Cash and Cash Equivalents', '{"interpretation": {"premium": "> Market Cap", "discount": "< Market Cap"}}', '["market_capitalization", "total_debt", "cash_and_cash_equivalents"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Earnings Yield', 'عائد الأرباح', 'Earnings per share to price per share', 'ربحية السهم إلى سعر السهم', 'Classical', 'Market Value Ratios', 'Earnings per Share / Price per Share * 100', '{"interpretation": {"attractive": "> 8%", "fair": "4-8%", "expensive": "< 4%"}}', '["earnings_per_share", "price_per_share"]', '{"type": "percentage", "unit": "%", "decimal_places": 2}'),

('Sales per Share', 'المبيعات للسهم', 'Total sales per outstanding share', 'إجمالي المبيعات لكل سهم متداول', 'Classical', 'Market Value Ratios', 'Total Sales / Outstanding Shares', '{"interpretation": {"high": "> 100", "moderate": "50-100", "low": "< 50"}}', '["total_sales", "outstanding_shares"]', '{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Tobin''s Q Ratio', 'نسبة توبين كيو', 'Market value to replacement cost', 'القيمة السوقية إلى تكلفة الاستبدال', 'Classical', 'Market Value Ratios', 'Market Value of Company / Replacement Cost of Assets', '{"interpretation": {"undervalued": "< 1", "fair": "1", "overvalued": "> 1"}}', '["market_value_of_company", "replacement_cost_of_assets"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

-- OPERATIONAL EFFICIENCY ANALYSIS (8 analyses)
('Operating Expense Ratio', 'نسبة المصاريف التشغيلية', 'Operating expenses to revenue', 'المصاريف التشغيلية إلى الإيرادات', 'Classical', 'Operational Efficiency', 'Operating Expenses / Revenue * 100', '{"interpretation": {"excellent": "< 40%", "good": "40-60%", "average": "60-80%", "poor": "> 80%"}}', '["operating_expenses", "revenue"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Administrative Expense Ratio', 'نسبة المصاريف الإدارية', 'Administrative expenses to revenue', 'المصاريف الإدارية إلى الإيرادات', 'Classical', 'Operational Efficiency', 'Administrative Expenses / Revenue * 100', '{"interpretation": {"low": "< 10%", "moderate": "10-20%", "high": "> 20%"}}', '["administrative_expenses", "revenue"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Selling Expense Ratio', 'نسبة مصاريف البيع', 'Selling expenses to revenue', 'مصاريف البيع إلى الإيرادات', 'Classical', 'Operational Efficiency', 'Selling Expenses / Revenue * 100', '{"interpretation": {"low": "< 15%", "moderate": "15-25%", "high": "> 25%"}}', '["selling_expenses", "revenue"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Employee Productivity', 'إنتاجية الموظف', 'Revenue per employee', 'الإيرادات لكل موظف', 'Classical', 'Operational Efficiency', 'Total Revenue / Number of Employees', '{"interpretation": {"high": "> 500000", "moderate": "250000-500000", "low": "< 250000"}}', '["total_revenue", "number_of_employees"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Asset Utilization', 'استغلال الأصول', 'Revenue per unit of assets', 'الإيرادات لكل وحدة أصول', 'Classical', 'Operational Efficiency', 'Revenue / Total Assets', '{"interpretation": {"efficient": "> 1.5", "moderate": "1.0-1.5", "inefficient": "< 1.0"}}', '["revenue", "total_assets"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Capital Productivity', 'إنتاجية رأس المال', 'Revenue per unit of capital', 'الإيرادات لكل وحدة رأس مال', 'Classical', 'Operational Efficiency', 'Revenue / Total Capital', '{"interpretation": {"high": "> 2", "moderate": "1-2", "low": "< 1"}}', '["revenue", "total_capital"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Labor Efficiency Ratio', 'نسبة كفاءة العمالة', 'Output per labor input', 'الإنتاج لكل مدخل عمالة', 'Classical', 'Operational Efficiency', 'Total Output / Labor Hours', '{"interpretation": {"improving": "increasing_trend", "stable": "consistent", "declining": "decreasing_trend"}}', '["total_output", "labor_hours"]', '{"type": "ratio", "unit": "units/hour", "decimal_places": 2}'),

('Capacity Utilization', 'استغلال الطاقة الإنتاجية', 'Actual output to maximum capacity', 'الإنتاج الفعلي إلى الطاقة القصوى', 'Classical', 'Operational Efficiency', 'Actual Production / Maximum Capacity * 100', '{"interpretation": {"excellent": "> 85%", "good": "70-85%", "average": "50-70%", "poor": "< 50%"}}', '["actual_production", "maximum_capacity"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}');

-- =====================================================
-- APPLIED INTERMEDIATE ANALYSIS (21 ANALYSES)
-- =====================================================

INSERT INTO analysis_types (name_en, name_ar, description_en, description_ar, category, subcategory, formula, calculation_logic, required_fields, output_format) VALUES

-- CASH FLOW ANALYSIS (7 analyses)
('Free Cash Flow to Equity', 'التدفق النقدي الحر لحقوق الملكية', 'Cash flow available to equity holders', 'التدفق النقدي المتاح لحملة الأسهم', 'Intermediate', 'Cash Flow Analysis', 'Net Income + Depreciation - CapEx - Change in WC + Net Borrowing', '{"interpretation": {"positive": "cash_generating", "negative": "cash_consuming"}}', '["net_income", "depreciation", "capex", "change_in_working_capital", "net_borrowing"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Free Cash Flow to Firm', 'التدفق النقدي الحر للشركة', 'Cash flow available to all investors', 'التدفق النقدي المتاح لجميع المستثمرين', 'Intermediate', 'Cash Flow Analysis', 'EBIT*(1-Tax Rate) + Depreciation - CapEx - Change in WC', '{"interpretation": {"positive": "value_generating", "negative": "value_consuming"}}', '["ebit", "tax_rate", "depreciation", "capex", "change_in_working_capital"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Operating Cash Flow Coverage', 'تغطية التدفق النقدي التشغيلي', 'Operating cash flow to capital expenditures', 'التدفق النقدي التشغيلي إلى النفقات الرأسمالية', 'Intermediate', 'Cash Flow Analysis', 'Operating Cash Flow / Capital Expenditures', '{"interpretation": {"strong": "> 1.5", "adequate": "1.0-1.5", "weak": "< 1.0"}}', '["operating_cash_flow", "capital_expenditures"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Cash Flow from Operations to Sales', 'التدفق النقدي من العمليات إلى المبيعات', 'Operating cash flow relative to sales', 'التدفق النقدي التشغيلي بالنسبة للمبيعات', 'Intermediate', 'Cash Flow Analysis', 'Operating Cash Flow / Net Sales * 100', '{"interpretation": {"excellent": "> 15%", "good": "10-15%", "average": "5-10%", "poor": "< 5%"}}', '["operating_cash_flow", "net_sales"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Cash Return on Invested Capital', 'العائد النقدي على رأس المال المستثمر', 'Cash flow return on invested capital', 'عائد التدفق النقدي على رأس المال المستثمر', 'Intermediate', 'Cash Flow Analysis', 'Free Cash Flow / Invested Capital * 100', '{"interpretation": {"excellent": "> 12%", "good": "8-12%", "average": "4-8%", "poor": "< 4%"}}', '["free_cash_flow", "invested_capital"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Price to Free Cash Flow', 'السعر إلى التدفق النقدي الحر', 'Market price to free cash flow per share', 'سعر السوق إلى التدفق النقدي الحر للسهم', 'Intermediate', 'Cash Flow Analysis', 'Price per Share / Free Cash Flow per Share', '{"interpretation": {"undervalued": "< 15", "fair": "15-25", "overvalued": "> 25"}}', '["price_per_share", "free_cash_flow_per_share"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Cash Conversion Efficiency', 'كفاءة تحويل النقد', 'Operating cash flow to net income', 'التدفق النقدي التشغيلي إلى صافي الدخل', 'Intermediate', 'Cash Flow Analysis', 'Operating Cash Flow / Net Income', '{"interpretation": {"excellent": "> 1.2", "good": "1.0-1.2", "average": "0.8-1.0", "poor": "< 0.8"}}', '["operating_cash_flow", "net_income"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

-- RETURN ANALYSIS (5 analyses)
('Return on Invested Capital', 'العائد على رأس المال المستثمر', 'NOPAT to invested capital ratio', 'صافي الربح التشغيلي بعد الضرائب إلى رأس المال المستثمر', 'Intermediate', 'Return Analysis', 'NOPAT / Invested Capital * 100', '{"interpretation": {"excellent": "> 15%", "good": "10-15%", "average": "5-10%", "poor": "< 5%"}}', '["nopat", "invested_capital"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Return on Net Assets', 'العائد على صافي الأصول', 'Net income to net assets', 'صافي الدخل إلى صافي الأصول', 'Intermediate', 'Return Analysis', 'Net Income / Net Assets * 100', '{"interpretation": {"excellent": "> 18%", "good": "12-18%", "average": "6-12%", "poor": "< 6%"}}', '["net_income", "net_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Return on Capital Employed', 'العائد على رأس المال المستخدم', 'EBIT to capital employed', 'الأرباح قبل الفوائد والضرائب إلى رأس المال المستخدم', 'Intermediate', 'Return Analysis', 'EBIT / Capital Employed * 100', '{"interpretation": {"excellent": "> 20%", "good": "15-20%", "average": "10-15%", "poor": "< 10%"}}', '["ebit", "capital_employed"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Return on Working Capital', 'العائد على رأس المال العامل', 'Net income to working capital', 'صافي الدخل إلى رأس المال العامل', 'Intermediate', 'Return Analysis', 'Net Income / Average Working Capital * 100', '{"interpretation": {"excellent": "> 50%", "good": "30-50%", "average": "15-30%", "poor": "< 15%"}}', '["net_income", "average_working_capital"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Risk-Adjusted Return', 'العائد المعدل للمخاطر', 'Return adjusted for risk level', 'العائد المعدل حسب مستوى المخاطر', 'Intermediate', 'Return Analysis', '(Return - Risk Free Rate) / Standard Deviation', '{"interpretation": {"excellent": "> 1.0", "good": "0.5-1.0", "average": "0.2-0.5", "poor": "< 0.2"}}', '["return", "risk_free_rate", "standard_deviation"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 3}'),

-- EFFICIENCY ANALYSIS (4 analyses)
('Working Capital Efficiency', 'كفاءة رأس المال العامل', 'Sales to working capital', 'المبيعات إلى رأس المال العامل', 'Intermediate', 'Efficiency Analysis', 'Net Sales / Average Working Capital', '{"interpretation": {"efficient": "> 8", "moderate": "4-8", "inefficient": "< 4"}}', '["net_sales", "average_working_capital"]', '{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Capital Turnover Efficiency', 'كفاءة دوران رأس المال', 'Revenue to total capital', 'الإيرادات إلى إجمالي رأس المال', 'Intermediate', 'Efficiency Analysis', 'Revenue / Average Total Capital', '{"interpretation": {"efficient": "> 1.5", "moderate": "1.0-1.5", "inefficient": "< 1.0"}}', '["revenue", "average_total_capital"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Operational Leverage', 'الرافعة التشغيلية', 'Percentage change in EBIT to sales change', 'النسبة المئوية للتغير في الأرباح قبل الفوائد والضرائب إلى تغير المبيعات', 'Intermediate', 'Efficiency Analysis', '% Change in EBIT / % Change in Sales', '{"interpretation": {"high": "> 2", "moderate": "1-2", "low": "< 1"}}', '["percent_change_ebit", "percent_change_sales"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 2}'),

('Financial Leverage Multiplier', 'مضاعف الرافعة المالية', 'Assets to equity multiplier', 'مضاعف الأصول إلى حقوق الملكية', 'Intermediate', 'Efficiency Analysis', 'Average Total Assets / Average Total Equity', '{"interpretation": {"conservative": "< 2", "moderate": "2-3", "aggressive": "> 3"}}', '["average_total_assets", "average_total_equity"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

-- QUALITY ANALYSIS (3 analyses)
('Asset Quality Ratio', 'نسبة جودة الأصول', 'Tangible assets to total assets', 'الأصول الملموسة إلى إجمالي الأصول', 'Intermediate', 'Quality Analysis', '(Total Assets - Intangible Assets) / Total Assets * 100', '{"interpretation": {"excellent": "> 80%", "good": "60-80%", "average": "40-60%", "poor": "< 40%"}}', '["total_assets", "intangible_assets"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Earnings Quality Index', 'مؤشر جودة الأرباح', 'Operating cash flow to net income', 'التدفق النقدي التشغيلي إلى صافي الدخل', 'Intermediate', 'Quality Analysis', 'Operating Cash Flow / Net Income', '{"interpretation": {"high_quality": "> 1.1", "good_quality": "0.9-1.1", "questionable": "< 0.9"}}', '["operating_cash_flow", "net_income"]', '{"type": "ratio", "unit": "index", "decimal_places": 2}'),

('Balance Sheet Quality', 'جودة الميزانية العمومية', 'Current assets to current liabilities quality', 'جودة الأصول المتداولة إلى الخصوم المتداولة', 'Intermediate', 'Quality Analysis', '(Cash + Receivables + Inventory) / Current Liabilities', '{"interpretation": {"strong": "> 1.5", "adequate": "1.0-1.5", "weak": "< 1.0"}}', '["cash", "receivables", "inventory", "current_liabilities"]', '{"type": "ratio", "unit": "times", "decimal_places": 2}'),

-- GROWTH ANALYSIS (2 analyses)
('Sustainable Growth Rate', 'معدل النمو المستدام', 'Growth rate without external financing', 'معدل النمو بدون تمويل خارجي', 'Intermediate', 'Growth Analysis', 'ROE × Retention Ratio', '{"interpretation": {"high": "> 15%", "moderate": "8-15%", "low": "< 8%"}}', '["roe", "retention_ratio"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Internal Growth Rate', 'معدل النمو الداخلي', 'Growth from retained earnings', 'النمو من الأرباح المحتجزة', 'Intermediate', 'Growth Analysis', 'ROA × Retention Ratio / (1 - ROA × Retention Ratio)', '{"interpretation": {"strong": "> 10%", "moderate": "5-10%", "weak": "< 5%"}}', '["roa", "retention_ratio"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}');

-- =====================================================
-- ADVANCED ANALYSIS (53 ANALYSES)
-- =====================================================

INSERT INTO analysis_types (name_en, name_ar, description_en, description_ar, category, subcategory, formula, calculation_logic, required_fields, output_format) VALUES

-- VALUATION MODELS (12 analyses)
('Discounted Cash Flow Model', 'نموذج التدفق النقدي المخصوم', 'Present value of future cash flows', 'القيمة الحالية للتدفقات النقدية المستقبلية', 'Advanced', 'Valuation Models', 'Sum of PV(Cash Flows) + Terminal Value', '{"interpretation": {"undervalued": "DCF > Market Price", "overvalued": "DCF < Market Price"}}', '["cash_flows", "discount_rate", "terminal_growth_rate"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Dividend Discount Model', 'نموذج خصم توزيعات الأرباح', 'Present value of expected dividends', 'القيمة الحالية لتوزيعات الأرباح المتوقعة', 'Advanced', 'Valuation Models', 'Sum of PV(Expected Dividends)', '{"interpretation": {"undervalued": "DDM > Market Price", "overvalued": "DDM < Market Price"}}', '["expected_dividends", "required_return", "growth_rate"]', '{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Gordon Growth Model', 'نموذج نمو جوردون', 'Dividend growth valuation model', 'نموذج تقييم نمو توزيعات الأرباح', 'Advanced', 'Valuation Models', 'D1 / (r - g)', '{"interpretation": {"undervalued": "GGM > Market Price", "overvalued": "GGM < Market Price"}}', '["next_dividend", "required_return", "growth_rate"]', '{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Residual Income Model', 'نموذج الدخل المتبقي', 'Value from excess earnings', 'القيمة من الأرباح الزائدة', 'Advanced', 'Valuation Models', 'Book Value + PV(Residual Income)', '{"interpretation": {"positive_ri": "value_creation", "negative_ri": "value_destruction"}}', '["book_value", "net_income", "equity_cost", "book_value_equity"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Adjusted Present Value', 'القيمة الحالية المعدلة', 'APV valuation approach', 'منهج تقييم القيمة الحالية المعدلة', 'Advanced', 'Valuation Models', 'Unlevered Firm Value + PV(Tax Shield)', '{"interpretation": {"with_debt": "APV", "without_debt": "Unlevered Value"}}', '["unlevered_cash_flows", "unlevered_cost_of_equity", "tax_shield"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Sum of the Parts Valuation', 'تقييم مجموع الأجزاء', 'Separate valuation of business segments', 'تقييم منفصل لقطاعات الأعمال', 'Advanced', 'Valuation Models', 'Sum of Individual Segment Values', '{"interpretation": {"conglomerate_discount": "< Sum of Parts", "conglomerate_premium": "> Sum of Parts"}}', '["segment_values", "corporate_adjustments"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Liquidation Value', 'قيمة التصفية', 'Asset liquidation value', 'قيمة تصفية الأصول', 'Advanced', 'Valuation Models', 'Sum of Asset Liquidation Values - Liabilities', '{"interpretation": {"above_liquidation": "going_concern_premium", "below_liquidation": "liquidation_candidate"}}', '["asset_liquidation_values", "total_liabilities"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Replacement Cost Valuation', 'تقييم تكلفة الاستبدال', 'Cost to replace company assets', 'تكلفة استبدال أصول الشركة', 'Advanced', 'Valuation Models', 'Current Replacement Cost of All Assets', '{"interpretation": {"below_replacement": "attractive", "above_replacement": "expensive"}}', '["replacement_costs", "depreciation_adjustments"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Economic Value Added Model', 'نموذج القيمة الاقتصادية المضافة', 'EVA-based valuation', 'التقييم المبني على القيمة الاقتصادية المضافة', 'Advanced', 'Valuation Models', 'Invested Capital + PV(Future EVA)', '{"interpretation": {"positive_eva": "value_creation", "negative_eva": "value_destruction"}}', '["invested_capital", "future_eva", "wacc"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Free Cash Flow to Equity Model', 'نموذج التدفق النقدي الحر لحقوق الملكية', 'FCFE valuation model', 'نموذج تقييم التدفق النقدي الحر لحقوق الملكية', 'Advanced', 'Valuation Models', 'Sum of PV(FCFE)', '{"interpretation": {"undervalued": "FCFE Model > Market Price", "overvalued": "FCFE Model < Market Price"}}', '["fcfe", "cost_of_equity", "growth_rate"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Asset-Based Valuation', 'التقييم المبني على الأصول', 'Book value adjusted valuation', 'التقييم المعدل للقيمة الدفترية', 'Advanced', 'Valuation Models', 'Adjusted Book Value of Assets - Liabilities', '{"interpretation": {"above_book": "hidden_value", "below_book": "asset_writedowns"}}', '["book_value_assets", "asset_adjustments", "total_liabilities"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Market Multiple Valuation', 'تقييم مضاعفات السوق', 'Comparable company multiples', 'مضاعفات الشركات المشابهة', 'Advanced', 'Valuation Models', 'Company Metric × Industry Average Multiple', '{"interpretation": {"discount_to_peers": "undervalued", "premium_to_peers": "overvalued"}}', '["company_metric", "industry_multiple"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

-- RISK MODELS (10 analyses)
('Value at Risk (VaR)', 'القيمة المعرضة للمخاطر', 'Maximum potential loss at confidence level', 'الحد الأقصى للخسائر المحتملة عند مستوى ثقة معين', 'Advanced', 'Risk Models', 'Portfolio Value × (Mean Return - Z-score × Standard Deviation)', '{"interpretation": {"high_risk": "> 10%", "moderate_risk": "5-10%", "low_risk": "< 5%"}}', '["portfolio_value", "mean_return", "standard_deviation", "confidence_level"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Conditional Value at Risk', 'القيمة المعرضة للمخاطر الشرطية', 'Expected loss beyond VaR threshold', 'الخسارة المتوقعة خارج حد القيمة المعرضة للمخاطر', 'Advanced', 'Risk Models', 'Expected Loss | Loss > VaR', '{"interpretation": {"high_tail_risk": "> 1.5 × VaR", "moderate_tail_risk": "1.2-1.5 × VaR", "low_tail_risk": "< 1.2 × VaR"}}', '["var", "tail_losses", "tail_probabilities"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Beta Coefficient', 'معامل بيتا', 'Stock sensitivity to market movements', 'حساسية السهم لتحركات السوق', 'Advanced', 'Risk Models', 'Covariance(Stock, Market) / Variance(Market)', '{"interpretation": {"high_beta": "> 1.5", "moderate_beta": "0.8-1.5", "low_beta": "< 0.8"}}', '["stock_returns", "market_returns"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 3}'),

('Sharpe Ratio', 'نسبة شارب', 'Risk-adjusted return measure', 'مقياس العائد المعدل للمخاطر', 'Advanced', 'Risk Models', '(Portfolio Return - Risk-free Rate) / Standard Deviation', '{"interpretation": {"excellent": "> 2.0", "good": "1.0-2.0", "average": "0.5-1.0", "poor": "< 0.5"}}', '["portfolio_return", "risk_free_rate", "standard_deviation"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 3}'),

('Treynor Ratio', 'نسبة ترينور', 'Return per unit of systematic risk', 'العائد لكل وحدة مخاطرة منتظمة', 'Advanced', 'Risk Models', '(Portfolio Return - Risk-free Rate) / Beta', '{"interpretation": {"superior": "> Market Treynor", "inferior": "< Market Treynor"}}', '["portfolio_return", "risk_free_rate", "beta"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 3}'),

('Jensen''s Alpha', 'ألفا جينسن', 'Risk-adjusted excess return', 'العائد الزائد المعدل للمخاطر', 'Advanced', 'Risk Models', 'Portfolio Return - [Risk-free Rate + Beta × (Market Return - Risk-free Rate)]', '{"interpretation": {"positive_alpha": "outperformed", "negative_alpha": "underperformed"}}', '["portfolio_return", "risk_free_rate", "beta", "market_return"]', '{"type": "percentage", "unit": "%", "decimal_places": 2}'),

('Information Ratio', 'نسبة المعلومات', 'Active return per unit of tracking error', 'العائد النشط لكل وحدة خطأ تتبع', 'Advanced', 'Risk Models', '(Portfolio Return - Benchmark Return) / Tracking Error', '{"interpretation": {"excellent": "> 0.75", "good": "0.5-0.75", "average": "0.25-0.5", "poor": "< 0.25"}}', '["portfolio_return", "benchmark_return", "tracking_error"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 3}'),

('Sortino Ratio', 'نسبة سورتينو', 'Downside risk-adjusted return', 'العائد المعدل لمخاطر الانحدار', 'Advanced', 'Risk Models', '(Portfolio Return - Target Return) / Downside Deviation', '{"interpretation": {"excellent": "> 2.0", "good": "1.0-2.0", "average": "0.5-1.0", "poor": "< 0.5"}}', '["portfolio_return", "target_return", "downside_deviation"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 3}'),

('Maximum Drawdown', 'أقصى انسحاب', 'Largest peak-to-trough decline', 'أكبر انخفاض من القمة إلى القاع', 'Advanced', 'Risk Models', 'Max((Peak Value - Trough Value) / Peak Value)', '{"interpretation": {"low_risk": "< 10%", "moderate_risk": "10-20%", "high_risk": "> 20%"}}', '["peak_values", "trough_values"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Calmar Ratio', 'نسبة كالمار', 'Annual return to maximum drawdown', 'العائد السنوي إلى أقصى انسحاب', 'Advanced', 'Risk Models', 'Annualized Return / Maximum Drawdown', '{"interpretation": {"excellent": "> 1.0", "good": "0.5-1.0", "average": "0.25-0.5", "poor": "< 0.25"}}', '["annualized_return", "maximum_drawdown"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 3}'),

-- DERIVATIVES PRICING (8 analyses)
('Black-Scholes Option Pricing', 'نموذج بلاك شولز للخيارات', 'Theoretical option price calculation', 'حساب السعر النظري للخيارات', 'Advanced', 'Derivatives Pricing', 'Complex BS formula with d1, d2 calculations', '{"interpretation": {"in_money": "valuable", "at_money": "fair_value", "out_money": "worthless"}}', '["stock_price", "strike_price", "time_to_expiry", "risk_free_rate", "volatility"]', '{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Binomial Option Model', 'نموذج الخيارات الثنائي', 'Option pricing using binomial tree', 'تسعير الخيارات باستخدام الشجرة الثنائية', 'Advanced', 'Derivatives Pricing', 'Backward induction through binomial tree', '{"interpretation": {"convergence": "approaches_BS_price", "american_style": "early_exercise_premium"}}', '["stock_price", "strike_price", "risk_free_rate", "volatility", "time_steps"]', '{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Monte Carlo Option Pricing', 'تسعير الخيارات بطريقة مونت كارلو', 'Option pricing via simulation', 'تسعير الخيارات عبر المحاكاة', 'Advanced', 'Derivatives Pricing', 'Average of simulated payoffs discounted to present', '{"interpretation": {"path_dependent": "exotic_options", "path_independent": "standard_options"}}', '["stock_price", "strike_price", "volatility", "risk_free_rate", "simulations"]', '{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Greeks - Delta', 'اليونانيات - دلتا', 'Option price sensitivity to stock price', 'حساسية سعر الخيار لسعر السهم', 'Advanced', 'Derivatives Pricing', 'Change in Option Price / Change in Stock Price', '{"interpretation": {"call_delta": "0_to_1", "put_delta": "-1_to_0"}}', '["option_price", "stock_price_change"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 4}'),

('Greeks - Gamma', 'اليونانيات - جاما', 'Rate of change of delta', 'معدل تغير دلتا', 'Advanced', 'Derivatives Pricing', 'Change in Delta / Change in Stock Price', '{"interpretation": {"high_gamma": "near_expiry_ATM", "low_gamma": "deep_ITM_OTM"}}', '["delta", "stock_price_change"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 6}'),

('Greeks - Theta', 'اليونانيات - ثيتا', 'Option price decay with time', 'انحلال سعر الخيار مع الوقت', 'Advanced', 'Derivatives Pricing', 'Change in Option Price / Change in Time', '{"interpretation": {"negative_theta": "time_decay", "accelerating": "near_expiry"}}', '["option_price", "time_change"]', '{"type": "currency", "unit": "SAR/day", "decimal_places": 3}'),

('Greeks - Vega', 'اليونانيات - فيجا', 'Option sensitivity to volatility', 'حساسية الخيار للتقلبات', 'Advanced', 'Derivatives Pricing', 'Change in Option Price / Change in Volatility', '{"interpretation": {"positive_vega": "long_options", "negative_vega": "short_options"}}', '["option_price", "volatility_change"]', '{"type": "ratio", "unit": "SAR/%vol", "decimal_places": 3}'),

('Greeks - Rho', 'اليونانيات - رو', 'Option sensitivity to interest rates', 'حساسية الخيار لأسعار الفائدة', 'Advanced', 'Derivatives Pricing', 'Change in Option Price / Change in Interest Rate', '{"interpretation": {"call_rho": "positive", "put_rho": "negative"}}', '["option_price", "interest_rate_change"]', '{"type": "ratio", "unit": "SAR/%rate", "decimal_places": 3}'),

-- FIXED INCOME ANALYSIS (8 analyses)
('Modified Duration', 'المدة المعدلة', 'Bond price sensitivity to interest rates', 'حساسية سعر السند لتغيرات أسعار الفائدة', 'Advanced', 'Fixed Income', 'Macaulay Duration / (1 + Yield)', '{"interpretation": {"high_duration": "> 10_years", "moderate_duration": "5-10_years", "low_duration": "< 5_years"}}', '["macaulay_duration", "yield_to_maturity"]', '{"type": "ratio", "unit": "years", "decimal_places": 2}'),

('Effective Duration', 'المدة الفعالة', 'Duration for bonds with embedded options', 'المدة للسندات ذات الخيارات المدمجة', 'Advanced', 'Fixed Income', '(P- - P+) / (2 × P0 × Δy)', '{"interpretation": {"shorter_than_modified": "negative_convexity", "similar_to_modified": "option_not_valuable"}}', '["price_down", "price_up", "initial_price", "yield_change"]', '{"type": "ratio", "unit": "years", "decimal_places": 2}'),

('Convexity', 'التحدب', 'Bond price-yield relationship curvature', 'انحناء العلاقة بين سعر السند والعائد', 'Advanced', 'Fixed Income', 'Second derivative of price-yield relationship', '{"interpretation": {"positive_convexity": "favorable", "negative_convexity": "unfavorable"}}', '["bond_price", "cash_flows", "yield_to_maturity"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 3}'),

('Yield to Maturity', 'العائد حتى الاستحقاق', 'Internal rate of return of bond', 'معدل العائد الداخلي للسند', 'Advanced', 'Fixed Income', 'IRR of bond cash flows', '{"interpretation": {"above_coupon": "discount_bond", "below_coupon": "premium_bond"}}', '["bond_price", "coupon_payments", "principal", "time_to_maturity"]', '{"type": "percentage", "unit": "%", "decimal_places": 3}'),

('Yield to Call', 'العائد حتى الاستدعاء', 'Yield assuming bond called at first call date', 'العائد بافتراض استدعاء السند في أول تاريخ استدعاء', 'Advanced', 'Fixed Income', 'IRR to first call date', '{"interpretation": {"below_ytm": "likely_to_be_called", "above_ytm": "unlikely_to_be_called"}}', '["bond_price", "coupon_payments", "call_price", "time_to_call"]', '{"type": "percentage", "unit": "%", "decimal_places": 3}'),

('Credit Spread', 'فارق الائتمان', 'Yield difference from risk-free bond', 'فارق العائد من السند الخالي من المخاطر', 'Advanced', 'Fixed Income', 'Corporate Bond Yield - Treasury Yield', '{"interpretation": {"wide_spread": "high_credit_risk", "narrow_spread": "low_credit_risk"}}', '["corporate_yield", "treasury_yield"]', '{"type": "percentage", "unit": "bps", "decimal_places": 0}'),

('Option Adjusted Spread', 'فارق العائد المعدل للخيار', 'Spread after adjusting for embedded options', 'الفارق بعد التعديل للخيارات المدمجة', 'Advanced', 'Fixed Income', 'Z-spread - Option Value', '{"interpretation": {"positive_oas": "attractive", "negative_oas": "expensive"}}', '["z_spread", "option_value"]', '{"type": "percentage", "unit": "bps", "decimal_places": 0}'),

('Z-Spread', 'الفارق الصفري', 'Spread over entire treasury curve', 'الفارق على كامل منحنى الخزانة', 'Advanced', 'Fixed Income', 'Constant spread added to treasury curve', '{"interpretation": {"higher_z_spread": "higher_risk", "lower_z_spread": "lower_risk"}}', '["bond_cash_flows", "treasury_curve", "bond_price"]', '{"type": "percentage", "unit": "bps", "decimal_places": 0}'),

-- VALUE CREATION ANALYSIS (5 analyses)
('Economic Value Added', 'القيمة الاقتصادية المضافة', 'NOPAT minus cost of capital', 'صافي الربح التشغيلي بعد الضرائب ناقص تكلفة رأس المال', 'Advanced', 'Value Creation', 'NOPAT - (Invested Capital × WACC)', '{"interpretation": {"positive_eva": "value_creating", "negative_eva": "value_destroying"}}', '["nopat", "invested_capital", "wacc"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Market Value Added', 'القيمة السوقية المضافة', 'Market value minus invested capital', 'القيمة السوقية ناقص رأس المال المستثمر', 'Advanced', 'Value Creation', 'Market Value - Invested Capital', '{"interpretation": {"positive_mva": "value_creating", "negative_mva": "value_destroying"}}', '["market_value", "invested_capital"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Cash Value Added', 'القيمة النقدية المضافة', 'Operating cash flow minus cost of capital', 'التدفق النقدي التشغيلي ناقص تكلفة رأس المال', 'Advanced', 'Value Creation', 'Operating Cash Flow - (Invested Capital × WACC)', '{"interpretation": {"positive_cva": "cash_value_creating", "negative_cva": "cash_value_destroying"}}', '["operating_cash_flow", "invested_capital", "wacc"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Total Shareholder Return', 'إجمالي عائد المساهمين', 'Capital gains plus dividends', 'المكاسب الرأسمالية زائد توزيعات الأرباح', 'Advanced', 'Value Creation', '(Ending Price - Beginning Price + Dividends) / Beginning Price', '{"interpretation": {"outperformed": "> Market Return", "underperformed": "< Market Return"}}', '["ending_price", "beginning_price", "dividends"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Value Driver Analysis', 'تحليل محركات القيمة', 'Decomposition of value creation sources', 'تحليل مصادر خلق القيمة', 'Advanced', 'Value Creation', 'Revenue Growth + Margin Expansion + Capital Efficiency + Multiple Expansion', '{"interpretation": {"revenue_driven": "growth_company", "margin_driven": "efficiency_company"}}', '["revenue_growth", "margin_change", "capital_efficiency", "multiple_change"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

-- CAPITAL STRUCTURE ANALYSIS (5 analyses)
('Optimal Capital Structure', 'الهيكل الرأسمالي الأمثل', 'Debt-equity mix minimizing WACC', 'خليط الدين وحقوق الملكية الذي يقلل المتوسط المرجح لتكلفة رأس المال', 'Advanced', 'Capital Structure', 'Debt/Equity ratio minimizing WACC', '{"interpretation": {"below_optimal": "increase_debt", "above_optimal": "reduce_debt"}}', '["wacc_curve", "debt_levels", "equity_levels"]', '{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Financial Distress Cost', 'تكلفة الضائقة المالية', 'Expected cost of financial difficulties', 'التكلفة المتوقعة للصعوبات المالية', 'Advanced', 'Capital Structure', 'Probability of Distress × Cost of Distress', '{"interpretation": {"high_cost": "reduce_leverage", "low_cost": "increase_leverage"}}', '["probability_of_distress", "cost_of_distress"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Interest Tax Shield', 'درع الضرائب من الفوائد', 'Tax benefit from debt interest', 'المنفعة الضريبية من فوائد الدين', 'Advanced', 'Capital Structure', 'Interest Expense × Tax Rate', '{"interpretation": {"valuable_shield": "high_tax_rate", "limited_shield": "low_tax_rate"}}', '["interest_expense", "tax_rate"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Degree of Financial Leverage', 'درجة الرافعة المالية', 'EPS sensitivity to EBIT changes', 'حساسية ربحية السهم لتغيرات الأرباح قبل الفوائد والضرائب', 'Advanced', 'Capital Structure', '% Change in EPS / % Change in EBIT', '{"interpretation": {"high_dfl": "> 2", "moderate_dfl": "1-2", "low_dfl": "< 1"}}', '["percent_change_eps", "percent_change_ebit"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 2}'),

('Degree of Combined Leverage', 'درجة الرافعة المشتركة', 'Combined operating and financial leverage', 'الرافعة التشغيلية والمالية المشتركة', 'Advanced', 'Capital Structure', 'DOL × DFL', '{"interpretation": {"high_dcl": "> 4", "moderate_dcl": "2-4", "low_dcl": "< 2"}}', '["degree_of_operating_leverage", "degree_of_financial_leverage"]', '{"type": "ratio", "unit": "coefficient", "decimal_places": 2}'),

-- CORPORATE FINANCE MODELS (5 analyses)
('Weighted Average Cost of Capital', 'المتوسط المرجح لتكلفة رأس المال', 'Blended cost of equity and debt', 'التكلفة المخلوطة لحقوق الملكية والدين', 'Advanced', 'Corporate Finance', '(E/V × Re) + (D/V × Rd × (1-Tc))', '{"interpretation": {"low_wacc": "efficient_capital", "high_wacc": "expensive_capital"}}', '["market_value_equity", "market_value_debt", "cost_of_equity", "cost_of_debt", "tax_rate"]', '{"type": "percentage", "unit": "%", "decimal_places": 2}'),

('Capital Asset Pricing Model', 'نموذج تسعير الأصول الرأسمالية', 'Required return based on systematic risk', 'العائد المطلوب حسب المخاطرة المنتظمة', 'Advanced', 'Corporate Finance', 'Rf + β × (Rm - Rf)', '{"interpretation": {"high_beta": "high_required_return", "low_beta": "low_required_return"}}', '["risk_free_rate", "beta", "market_return"]', '{"type": "percentage", "unit": "%", "decimal_places": 2}'),

('Arbitrage Pricing Theory', 'نظرية التسعير التحكيمي', 'Multi-factor asset pricing model', 'نموذج تسعير الأصول متعدد العوامل', 'Advanced', 'Corporate Finance', 'Rf + β1×F1 + β2×F2 + ... + βn×Fn', '{"interpretation": {"factor_sensitive": "exposed_to_factor", "factor_neutral": "not_exposed"}}', '["risk_free_rate", "factor_betas", "factor_premiums"]', '{"type": "percentage", "unit": "%", "decimal_places": 2}'),

('Net Present Value', 'صافي القيمة الحالية', 'Present value of project cash flows minus initial investment', 'القيمة الحالية للتدفقات النقدية للمشروع ناقص الاستثمار الأولي', 'Advanced', 'Corporate Finance', 'Sum of PV(Cash Flows) - Initial Investment', '{"interpretation": {"positive_npv": "accept_project", "negative_npv": "reject_project"}}', '["cash_flows", "discount_rate", "initial_investment"]', '{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Internal Rate of Return', 'معدل العائد الداخلي', 'Discount rate making NPV equal to zero', 'معدل الخصم الذي يجعل صافي القيمة الحالية تساوي صفر', 'Advanced', 'Corporate Finance', 'Rate where NPV = 0', '{"interpretation": {"irr_above_wacc": "accept_project", "irr_below_wacc": "reject_project"}}', '["cash_flows", "initial_investment"]', '{"type": "percentage", "unit": "%", "decimal_places": 2}');

-- Create indexes for performance
CREATE INDEX idx_analysis_types_category ON analysis_types(category);
CREATE INDEX idx_analysis_types_subcategory ON analysis_types(subcategory);
CREATE INDEX idx_analysis_types_industry ON analysis_types(industry_specific);
CREATE INDEX idx_analysis_types_complexity ON analysis_types(complexity_level);

-- Insert category summary for validation
CREATE TABLE analysis_summary AS
SELECT
    category,
    COUNT(*) as count,
    STRING_AGG(DISTINCT subcategory, ', ') as subcategories
FROM analysis_types
GROUP BY category
ORDER BY
    CASE category
        WHEN 'Classical' THEN 1
        WHEN 'Intermediate' THEN 2
        WHEN 'Advanced' THEN 3
    END;

-- Validation: Should show Classical: 106, Intermediate: 21, Advanced: 53
SELECT
    'Analysis Types Count Validation' as validation_check,
    (SELECT COUNT(*) FROM analysis_types WHERE category = 'Classical') as classical_count,
    (SELECT COUNT(*) FROM analysis_types WHERE category = 'Intermediate') as intermediate_count,
    (SELECT COUNT(*) FROM analysis_types WHERE category = 'Advanced') as advanced_count,
    (SELECT COUNT(*) FROM analysis_types) as total_count;