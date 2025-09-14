-- Insert all 180+ financial analysis types
INSERT INTO analysis_types (name_en, name_ar, description_en, description_ar, category, subcategory, formula, calculation_logic, required_fields, output_format) VALUES

-- Liquidity Ratios
('Current Ratio', 'نسبة التداول', 'Measures company ability to pay short-term obligations', 'تقيس قدرة الشركة على سداد الالتزامات قصيرة الأجل', 'Liquidity', 'Basic Ratios', 'Current Assets / Current Liabilities',
'{"formula": "current_assets / current_liabilities", "interpretation": {"excellent": "> 2.5", "good": "1.5-2.5", "average": "1.0-1.5", "poor": "< 1.0"}}',
'["current_assets", "current_liabilities"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Quick Ratio', 'النسبة السريعة', 'Measures immediate liquidity without inventory', 'تقيس السيولة الفورية بدون المخزون', 'Liquidity', 'Basic Ratios', '(Current Assets - Inventory) / Current Liabilities',
'{"formula": "(current_assets - inventory) / current_liabilities", "interpretation": {"excellent": "> 1.5", "good": "1.0-1.5", "average": "0.7-1.0", "poor": "< 0.7"}}',
'["current_assets", "inventory", "current_liabilities"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Cash Ratio', 'نسبة النقد', 'Measures ability to pay debts with cash and equivalents', 'تقيس القدرة على سداد الديون بالنقد ومعادلاته', 'Liquidity', 'Advanced Ratios', '(Cash + Cash Equivalents) / Current Liabilities',
'{"formula": "(cash + cash_equivalents) / current_liabilities", "interpretation": {"excellent": "> 0.5", "good": "0.3-0.5", "average": "0.1-0.3", "poor": "< 0.1"}}',
'["cash", "cash_equivalents", "current_liabilities"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Working Capital', 'رأس المال العامل', 'Difference between current assets and liabilities', 'الفرق بين الأصول والخصوم المتداولة', 'Liquidity', 'Absolute Values', 'Current Assets - Current Liabilities',
'{"formula": "current_assets - current_liabilities", "interpretation": {"positive": "good", "negative": "concerning"}}',
'["current_assets", "current_liabilities"]',
'{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Operating Cash Flow Ratio', 'نسبة التدفق النقدي التشغيلي', 'Operating cash flow to current liabilities ratio', 'نسبة التدفق النقدي التشغيلي إلى الخصوم المتداولة', 'Liquidity', 'Cash Flow Ratios', 'Operating Cash Flow / Current Liabilities',
'{"formula": "operating_cash_flow / current_liabilities", "interpretation": {"excellent": "> 0.4", "good": "0.25-0.4", "average": "0.15-0.25", "poor": "< 0.15"}}',
'["operating_cash_flow", "current_liabilities"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

-- Leverage Ratios
('Debt-to-Equity Ratio', 'نسبة الدين إلى حقوق الملكية', 'Total debt relative to shareholders equity', 'إجمالي الدين بالنسبة لحقوق المساهمين', 'Leverage', 'Basic Ratios', 'Total Debt / Total Equity',
'{"formula": "total_debt / total_equity", "interpretation": {"low": "< 0.3", "moderate": "0.3-0.6", "high": "0.6-1.0", "very_high": "> 1.0"}}',
'["total_debt", "total_equity"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Debt Ratio', 'نسبة الدين', 'Total debt to total assets ratio', 'نسبة إجمالي الدين إلى إجمالي الأصول', 'Leverage', 'Basic Ratios', 'Total Debt / Total Assets',
'{"formula": "total_debt / total_assets", "interpretation": {"low": "< 0.3", "moderate": "0.3-0.5", "high": "0.5-0.7", "very_high": "> 0.7"}}',
'["total_debt", "total_assets"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Equity Ratio', 'نسبة حقوق الملكية', 'Shareholders equity to total assets ratio', 'نسبة حقوق المساهمين إلى إجمالي الأصول', 'Leverage', 'Basic Ratios', 'Total Equity / Total Assets',
'{"formula": "total_equity / total_assets", "interpretation": {"excellent": "> 0.7", "good": "0.5-0.7", "average": "0.3-0.5", "poor": "< 0.3"}}',
'["total_equity", "total_assets"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Interest Coverage Ratio', 'نسبة تغطية الفوائد', 'EBIT to interest expense ratio', 'نسبة الأرباح قبل الفوائد والضرائب إلى مصاريف الفوائد', 'Leverage', 'Coverage Ratios', 'EBIT / Interest Expense',
'{"formula": "ebit / interest_expense", "interpretation": {"excellent": "> 8", "good": "4-8", "average": "2-4", "poor": "< 2"}}',
'["ebit", "interest_expense"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Times Interest Earned', 'عدد مرات كسب الفوائد', 'Same as Interest Coverage Ratio', 'مثل نسبة تغطية الفوائد', 'Leverage', 'Coverage Ratios', 'EBIT / Interest Expense',
'{"formula": "ebit / interest_expense", "interpretation": {"excellent": "> 8", "good": "4-8", "average": "2-4", "poor": "< 2"}}',
'["ebit", "interest_expense"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}'),

-- Activity/Efficiency Ratios
('Asset Turnover', 'معدل دوران الأصول', 'Revenue relative to total assets', 'الإيرادات بالنسبة لإجمالي الأصول', 'Activity', 'Turnover Ratios', 'Revenue / Total Assets',
'{"formula": "revenue / total_assets", "interpretation": {"excellent": "> 2.0", "good": "1.5-2.0", "average": "1.0-1.5", "poor": "< 1.0"}}',
'["revenue", "total_assets"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Inventory Turnover', 'معدل دوران المخزون', 'Cost of goods sold to average inventory', 'تكلفة البضاعة المباعة إلى متوسط المخزون', 'Activity', 'Turnover Ratios', 'COGS / Average Inventory',
'{"formula": "cogs / average_inventory", "interpretation": {"excellent": "> 12", "good": "8-12", "average": "4-8", "poor": "< 4"}}',
'["cogs", "average_inventory"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Receivables Turnover', 'معدل دوران المدينين', 'Net credit sales to average accounts receivable', 'صافي المبيعات الآجلة إلى متوسط الحسابات المدينة', 'Activity', 'Turnover Ratios', 'Net Credit Sales / Average Accounts Receivable',
'{"formula": "net_credit_sales / average_accounts_receivable", "interpretation": {"excellent": "> 12", "good": "8-12", "average": "4-8", "poor": "< 4"}}',
'["net_credit_sales", "average_accounts_receivable"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Days Sales Outstanding', 'أيام المبيعات المعلقة', 'Average collection period for receivables', 'متوسط فترة تحصيل الذمم المدينة', 'Activity', 'Period Ratios', '365 / Receivables Turnover',
'{"formula": "365 / receivables_turnover", "interpretation": {"excellent": "< 30", "good": "30-45", "average": "45-60", "poor": "> 60"}}',
'["receivables_turnover"]',
'{"type": "days", "unit": "days", "decimal_places": 0}'),

('Days Inventory Outstanding', 'أيام المخزون المعلق', 'Average days to sell inventory', 'متوسط أيام بيع المخزون', 'Activity', 'Period Ratios', '365 / Inventory Turnover',
'{"formula": "365 / inventory_turnover", "interpretation": {"excellent": "< 30", "good": "30-60", "average": "60-90", "poor": "> 90"}}',
'["inventory_turnover"]',
'{"type": "days", "unit": "days", "decimal_places": 0}'),

-- Profitability Ratios
('Gross Profit Margin', 'هامش الربح الإجمالي', 'Gross profit as percentage of revenue', 'الربح الإجمالي كنسبة مئوية من الإيرادات', 'Profitability', 'Margin Ratios', '(Revenue - COGS) / Revenue * 100',
'{"formula": "(revenue - cogs) / revenue * 100", "interpretation": {"excellent": "> 40%", "good": "25-40%", "average": "15-25%", "poor": "< 15%"}}',
'["revenue", "cogs"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Operating Profit Margin', 'هامش الربح التشغيلي', 'Operating profit as percentage of revenue', 'الربح التشغيلي كنسبة مئوية من الإيرادات', 'Profitability', 'Margin Ratios', 'Operating Income / Revenue * 100',
'{"formula": "operating_income / revenue * 100", "interpretation": {"excellent": "> 15%", "good": "10-15%", "average": "5-10%", "poor": "< 5%"}}',
'["operating_income", "revenue"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Net Profit Margin', 'هامش صافي الربح', 'Net income as percentage of revenue', 'صافي الدخل كنسبة مئوية من الإيرادات', 'Profitability', 'Margin Ratios', 'Net Income / Revenue * 100',
'{"formula": "net_income / revenue * 100", "interpretation": {"excellent": "> 10%", "good": "5-10%", "average": "2-5%", "poor": "< 2%"}}',
'["net_income", "revenue"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Return on Assets (ROA)', 'العائد على الأصول', 'Net income relative to total assets', 'صافي الدخل بالنسبة لإجمالي الأصول', 'Profitability', 'Return Ratios', 'Net Income / Total Assets * 100',
'{"formula": "net_income / total_assets * 100", "interpretation": {"excellent": "> 15%", "good": "10-15%", "average": "5-10%", "poor": "< 5%"}}',
'["net_income", "total_assets"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Return on Equity (ROE)', 'العائد على حقوق الملكية', 'Net income relative to shareholders equity', 'صافي الدخل بالنسبة لحقوق المساهمين', 'Profitability', 'Return Ratios', 'Net Income / Total Equity * 100',
'{"formula": "net_income / total_equity * 100", "interpretation": {"excellent": "> 20%", "good": "15-20%", "average": "10-15%", "poor": "< 10%"}}',
'["net_income", "total_equity"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

-- Market Value Ratios
('Price-to-Earnings Ratio (P/E)', 'نسبة السعر إلى الأرباح', 'Market price per share to earnings per share', 'سعر السهم في السوق إلى ربحية السهم', 'Market', 'Valuation Ratios', 'Market Price per Share / Earnings per Share',
'{"formula": "market_price_per_share / earnings_per_share", "interpretation": {"undervalued": "< 15", "fair": "15-25", "overvalued": "> 25"}}',
'["market_price_per_share", "earnings_per_share"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Price-to-Book Ratio (P/B)', 'نسبة السعر إلى القيمة الدفترية', 'Market price per share to book value per share', 'سعر السهم في السوق إلى القيمة الدفترية للسهم', 'Market', 'Valuation Ratios', 'Market Price per Share / Book Value per Share',
'{"formula": "market_price_per_share / book_value_per_share", "interpretation": {"undervalued": "< 1", "fair": "1-3", "overvalued": "> 3"}}',
'["market_price_per_share", "book_value_per_share"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Market-to-Book Ratio', 'نسبة القيمة السوقية إلى الدفترية', 'Same as Price-to-Book ratio', 'مثل نسبة السعر إلى القيمة الدفترية', 'Market', 'Valuation Ratios', 'Market Value of Equity / Book Value of Equity',
'{"formula": "market_value_equity / book_value_equity", "interpretation": {"undervalued": "< 1", "fair": "1-3", "overvalued": "> 3"}}',
'["market_value_equity", "book_value_equity"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Dividend Yield', 'عائد توزيعات الأرباح', 'Annual dividends per share to market price', 'توزيعات الأرباح السنوية للسهم إلى سعر السوق', 'Market', 'Dividend Ratios', 'Annual Dividends per Share / Market Price per Share * 100',
'{"formula": "annual_dividends_per_share / market_price_per_share * 100", "interpretation": {"high": "> 6%", "moderate": "3-6%", "low": "< 3%"}}',
'["annual_dividends_per_share", "market_price_per_share"]',
'{"type": "percentage", "unit": "%", "decimal_places": 2}'),

('Dividend Payout Ratio', 'نسبة توزيع الأرباح', 'Dividends paid relative to net income', 'الأرباح الموزعة بالنسبة لصافي الدخل', 'Market', 'Dividend Ratios', 'Dividends Paid / Net Income * 100',
'{"formula": "dividends_paid / net_income * 100", "interpretation": {"conservative": "< 30%", "moderate": "30-60%", "high": "> 60%"}}',
'["dividends_paid", "net_income"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

-- Advanced Ratios
('EBITDA', 'الأرباح قبل الفوائد والضرائب والاستهلاك والإطفاء', 'Earnings before interest, taxes, depreciation, and amortization', 'الأرباح قبل الفوائد والضرائب والاستهلاك والإطفاء', 'Profitability', 'Advanced Metrics', 'Net Income + Interest + Taxes + Depreciation + Amortization',
'{"formula": "net_income + interest_expense + tax_expense + depreciation + amortization"}',
'["net_income", "interest_expense", "tax_expense", "depreciation", "amortization"]',
'{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('EBITDA Margin', 'هامش الأرباح قبل الفوائد والضرائب والاستهلاك', 'EBITDA as percentage of revenue', 'الأرباح قبل الفوائد والضرائب والاستهلاك كنسبة من الإيرادات', 'Profitability', 'Advanced Ratios', 'EBITDA / Revenue * 100',
'{"formula": "ebitda / revenue * 100", "interpretation": {"excellent": "> 20%", "good": "15-20%", "average": "10-15%", "poor": "< 10%"}}',
'["ebitda", "revenue"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Free Cash Flow', 'التدفق النقدي الحر', 'Operating cash flow minus capital expenditures', 'التدفق النقدي التشغيلي ناقص النفقات الرأسمالية', 'Cash Flow', 'Advanced Metrics', 'Operating Cash Flow - Capital Expenditures',
'{"formula": "operating_cash_flow - capital_expenditures"}',
'["operating_cash_flow", "capital_expenditures"]',
'{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Free Cash Flow Yield', 'عائد التدفق النقدي الحر', 'Free cash flow per share to market price', 'التدفق النقدي الحر للسهم إلى سعر السوق', 'Cash Flow', 'Yield Ratios', 'Free Cash Flow per Share / Market Price per Share * 100',
'{"formula": "free_cash_flow_per_share / market_price_per_share * 100", "interpretation": {"excellent": "> 10%", "good": "5-10%", "average": "2-5%", "poor": "< 2%"}}',
'["free_cash_flow_per_share", "market_price_per_share"]',
'{"type": "percentage", "unit": "%", "decimal_places": 2}'),

-- More Liquidity Ratios
('Net Working Capital Ratio', 'نسبة صافي رأس المال العامل', 'Net working capital to total assets', 'صافي رأس المال العامل إلى إجمالي الأصول', 'Liquidity', 'Advanced Ratios', 'Net Working Capital / Total Assets * 100',
'{"formula": "(current_assets - current_liabilities) / total_assets * 100", "interpretation": {"excellent": "> 20%", "good": "10-20%", "average": "0-10%", "poor": "< 0%"}}',
'["current_assets", "current_liabilities", "total_assets"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Cash Conversion Cycle', 'دورة تحويل النقد', 'Days to convert investments into cash', 'أيام تحويل الاستثمارات إلى نقد', 'Activity', 'Cycle Ratios', 'DIO + DSO - DPO',
'{"formula": "days_inventory_outstanding + days_sales_outstanding - days_payable_outstanding", "interpretation": {"excellent": "< 30", "good": "30-60", "average": "60-90", "poor": "> 90"}}',
'["days_inventory_outstanding", "days_sales_outstanding", "days_payable_outstanding"]',
'{"type": "days", "unit": "days", "decimal_places": 0}'),

('Defensive Interval Ratio', 'نسبة الفترة الدفاعية', 'Days company can operate without additional financing', 'أيام تشغيل الشركة بدون تمويل إضافي', 'Liquidity', 'Advanced Ratios', '(Cash + Short-term Investments + Receivables) / Daily Operating Expenses',
'{"formula": "(cash + short_term_investments + accounts_receivable) / daily_operating_expenses", "interpretation": {"excellent": "> 100", "good": "60-100", "average": "30-60", "poor": "< 30"}}',
'["cash", "short_term_investments", "accounts_receivable", "daily_operating_expenses"]',
'{"type": "days", "unit": "days", "decimal_places": 0}'),

-- More Leverage Ratios
('Long-term Debt to Equity', 'نسبة الدين طويل الأجل إلى حقوق الملكية', 'Long-term debt relative to shareholders equity', 'الدين طويل الأجل بالنسبة لحقوق المساهمين', 'Leverage', 'Advanced Ratios', 'Long-term Debt / Total Equity',
'{"formula": "long_term_debt / total_equity", "interpretation": {"low": "< 0.3", "moderate": "0.3-0.6", "high": "> 0.6"}}',
'["long_term_debt", "total_equity"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Debt-to-Capital Ratio', 'نسبة الدين إلى رأس المال', 'Total debt to total capital', 'إجمالي الدين إلى إجمالي رأس المال', 'Leverage', 'Advanced Ratios', 'Total Debt / (Total Debt + Total Equity)',
'{"formula": "total_debt / (total_debt + total_equity)", "interpretation": {"low": "< 0.3", "moderate": "0.3-0.5", "high": "> 0.5"}}',
'["total_debt", "total_equity"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Cash Coverage Ratio', 'نسبة التغطية النقدية', 'Cash earnings to interest payments', 'الأرباح النقدية إلى مدفوعات الفوائد', 'Leverage', 'Coverage Ratios', '(EBIT + Depreciation) / Interest Expense',
'{"formula": "(ebit + depreciation) / interest_expense", "interpretation": {"excellent": "> 10", "good": "5-10", "average": "2-5", "poor": "< 2"}}',
'["ebit", "depreciation", "interest_expense"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Fixed Charge Coverage Ratio', 'نسبة تغطية الرسوم الثابتة', 'Earnings to fixed charges ratio', 'نسبة الأرباح إلى الرسوم الثابتة', 'Leverage', 'Coverage Ratios', '(EBIT + Fixed Charges) / (Interest + Fixed Charges)',
'{"formula": "(ebit + fixed_charges) / (interest_expense + fixed_charges)", "interpretation": {"excellent": "> 5", "good": "2.5-5", "average": "1.5-2.5", "poor": "< 1.5"}}',
'["ebit", "fixed_charges", "interest_expense"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}'),

-- More Activity Ratios
('Fixed Asset Turnover', 'معدل دوران الأصول الثابتة', 'Revenue to net fixed assets ratio', 'نسبة الإيرادات إلى صافي الأصول الثابتة', 'Activity', 'Turnover Ratios', 'Revenue / Net Fixed Assets',
'{"formula": "revenue / net_fixed_assets", "interpretation": {"excellent": "> 4", "good": "2-4", "average": "1-2", "poor": "< 1"}}',
'["revenue", "net_fixed_assets"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Total Capital Turnover', 'معدل دوران إجمالي رأس المال', 'Revenue to total capital ratio', 'نسبة الإيرادات إلى إجمالي رأس المال', 'Activity', 'Turnover Ratios', 'Revenue / Total Capital',
'{"formula": "revenue / total_capital", "interpretation": {"excellent": "> 2", "good": "1.5-2", "average": "1-1.5", "poor": "< 1"}}',
'["revenue", "total_capital"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Working Capital Turnover', 'معدل دوران رأس المال العامل', 'Revenue to working capital ratio', 'نسبة الإيرادات إلى رأس المال العامل', 'Activity', 'Turnover Ratios', 'Revenue / Working Capital',
'{"formula": "revenue / working_capital", "interpretation": {"excellent": "> 12", "good": "8-12", "average": "4-8", "poor": "< 4"}}',
'["revenue", "working_capital"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Days Payable Outstanding', 'أيام الدائنين المعلقة', 'Average payment period for payables', 'متوسط فترة سداد الذمم الدائنة', 'Activity', 'Period Ratios', '365 / Payables Turnover',
'{"formula": "365 / payables_turnover", "interpretation": {"excellent": "> 45", "good": "30-45", "average": "15-30", "poor": "< 15"}}',
'["payables_turnover"]',
'{"type": "days", "unit": "days", "decimal_places": 0}'),

-- Additional Profitability Ratios
('Operating Return on Assets', 'العائد التشغيلي على الأصول', 'Operating income to total assets', 'الدخل التشغيلي إلى إجمالي الأصول', 'Profitability', 'Return Ratios', 'Operating Income / Total Assets * 100',
'{"formula": "operating_income / total_assets * 100", "interpretation": {"excellent": "> 12%", "good": "8-12%", "average": "4-8%", "poor": "< 4%"}}',
'["operating_income", "total_assets"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Return on Invested Capital', 'العائد على رأس المال المستثمر', 'NOPAT to invested capital ratio', 'صافي الربح التشغيلي بعد الضرائب إلى رأس المال المستثمر', 'Profitability', 'Return Ratios', 'NOPAT / Invested Capital * 100',
'{"formula": "nopat / invested_capital * 100", "interpretation": {"excellent": "> 15%", "good": "10-15%", "average": "5-10%", "poor": "< 5%"}}',
'["nopat", "invested_capital"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Earnings Before Interest After Taxes', 'الأرباح قبل الفوائد بعد الضرائب', 'Operating profit after taxes', 'الربح التشغيلي بعد الضرائب', 'Profitability', 'Advanced Metrics', 'Operating Income * (1 - Tax Rate)',
'{"formula": "operating_income * (1 - tax_rate)"}',
'["operating_income", "tax_rate"]',
'{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

-- Cash Flow Ratios
('Operating Cash Flow Margin', 'هامش التدفق النقدي التشغيلي', 'Operating cash flow to revenue ratio', 'نسبة التدفق النقدي التشغيلي إلى الإيرادات', 'Cash Flow', 'Margin Ratios', 'Operating Cash Flow / Revenue * 100',
'{"formula": "operating_cash_flow / revenue * 100", "interpretation": {"excellent": "> 15%", "good": "10-15%", "average": "5-10%", "poor": "< 5%"}}',
'["operating_cash_flow", "revenue"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Cash Return on Assets', 'العائد النقدي على الأصول', 'Operating cash flow to total assets', 'التدفق النقدي التشغيلي إلى إجمالي الأصول', 'Cash Flow', 'Return Ratios', 'Operating Cash Flow / Total Assets * 100',
'{"formula": "operating_cash_flow / total_assets * 100", "interpretation": {"excellent": "> 12%", "good": "8-12%", "average": "4-8%", "poor": "< 4%"}}',
'["operating_cash_flow", "total_assets"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Cash Coverage of Dividends', 'التغطية النقدية لتوزيعات الأرباح', 'Operating cash flow to dividends paid', 'التدفق النقدي التشغيلي إلى الأرباح الموزعة', 'Cash Flow', 'Coverage Ratios', 'Operating Cash Flow / Dividends Paid',
'{"formula": "operating_cash_flow / dividends_paid", "interpretation": {"excellent": "> 3", "good": "2-3", "average": "1-2", "poor": "< 1"}}',
'["operating_cash_flow", "dividends_paid"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}'),

-- Growth Ratios
('Revenue Growth Rate', 'معدل نمو الإيرادات', 'Year-over-year revenue growth', 'نمو الإيرادات من سنة لأخرى', 'Growth', 'Growth Rates', '(Current Revenue - Previous Revenue) / Previous Revenue * 100',
'{"formula": "(current_revenue - previous_revenue) / previous_revenue * 100", "interpretation": {"excellent": "> 20%", "good": "10-20%", "average": "5-10%", "poor": "< 5%"}}',
'["current_revenue", "previous_revenue"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Earnings Growth Rate', 'معدل نمو الأرباح', 'Year-over-year earnings growth', 'نمو الأرباح من سنة لأخرى', 'Growth', 'Growth Rates', '(Current Earnings - Previous Earnings) / Previous Earnings * 100',
'{"formula": "(current_earnings - previous_earnings) / previous_earnings * 100", "interpretation": {"excellent": "> 25%", "good": "15-25%", "average": "5-15%", "poor": "< 5%"}}',
'["current_earnings", "previous_earnings"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Asset Growth Rate', 'معدل نمو الأصول', 'Year-over-year asset growth', 'نمو الأصول من سنة لأخرى', 'Growth', 'Growth Rates', '(Current Assets - Previous Assets) / Previous Assets * 100',
'{"formula": "(current_total_assets - previous_total_assets) / previous_total_assets * 100", "interpretation": {"excellent": "> 15%", "good": "10-15%", "average": "5-10%", "poor": "< 5%"}}',
'["current_total_assets", "previous_total_assets"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

-- Market Performance Ratios
('Price-to-Sales Ratio', 'نسبة السعر إلى المبيعات', 'Market cap to revenue ratio', 'القيمة السوقية إلى الإيرادات', 'Market', 'Valuation Ratios', 'Market Cap / Revenue',
'{"formula": "market_cap / revenue", "interpretation": {"undervalued": "< 2", "fair": "2-5", "overvalued": "> 5"}}',
'["market_cap", "revenue"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Price-to-Cash Flow Ratio', 'نسبة السعر إلى التدفق النقدي', 'Market price to operating cash flow per share', 'سعر السوق إلى التدفق النقدي التشغيلي للسهم', 'Market', 'Valuation Ratios', 'Market Price per Share / Operating Cash Flow per Share',
'{"formula": "market_price_per_share / operating_cash_flow_per_share", "interpretation": {"undervalued": "< 10", "fair": "10-15", "overvalued": "> 15"}}',
'["market_price_per_share", "operating_cash_flow_per_share"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Enterprise Value to EBITDA', 'قيمة المؤسسة إلى الأرباح قبل الفوائد والضرائب والاستهلاك', 'Enterprise value to EBITDA ratio', 'نسبة قيمة المؤسسة إلى الأرباح قبل الفوائد والضرائب والاستهلاك', 'Market', 'Valuation Ratios', 'Enterprise Value / EBITDA',
'{"formula": "enterprise_value / ebitda", "interpretation": {"undervalued": "< 8", "fair": "8-12", "overvalued": "> 12"}}',
'["enterprise_value", "ebitda"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}'),

-- Risk Assessment Ratios
('Beta', 'بيتا', 'Stock volatility relative to market', 'تقلب السهم بالنسبة للسوق', 'Risk', 'Volatility Measures', 'Covariance(Stock, Market) / Variance(Market)',
'{"formula": "covariance_stock_market / variance_market", "interpretation": {"low_risk": "< 1", "market_risk": "= 1", "high_risk": "> 1"}}',
'["covariance_stock_market", "variance_market"]',
'{"type": "ratio", "unit": "coefficient", "decimal_places": 2}'),

('Altman Z-Score', 'نموذج ألتمان للتنبؤ بالإفلاس', 'Bankruptcy prediction model', 'نموذج التنبؤ بالإفلاس', 'Risk', 'Credit Risk', '1.2*A + 1.4*B + 3.3*C + 0.6*D + 1.0*E',
'{"formula": "1.2 * (working_capital / total_assets) + 1.4 * (retained_earnings / total_assets) + 3.3 * (ebit / total_assets) + 0.6 * (market_value_equity / total_liabilities) + 1.0 * (sales / total_assets)", "interpretation": {"safe": "> 2.99", "caution": "1.81-2.99", "distress": "< 1.81"}}',
'["working_capital", "total_assets", "retained_earnings", "ebit", "market_value_equity", "total_liabilities", "sales"]',
'{"type": "score", "unit": "points", "decimal_places": 2}'),

-- Efficiency Ratios
('Employee Productivity', 'إنتاجية الموظفين', 'Revenue per employee', 'الإيرادات لكل موظف', 'Efficiency', 'Productivity Ratios', 'Total Revenue / Number of Employees',
'{"formula": "total_revenue / number_of_employees"}',
'["total_revenue", "number_of_employees"]',
'{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Sales per Employee', 'المبيعات لكل موظف', 'Same as employee productivity', 'مثل إنتاجية الموظفين', 'Efficiency', 'Productivity Ratios', 'Total Sales / Number of Employees',
'{"formula": "total_sales / number_of_employees"}',
'["total_sales", "number_of_employees"]',
'{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Profit per Employee', 'الربح لكل موظف', 'Net income per employee', 'صافي الدخل لكل موظف', 'Efficiency', 'Productivity Ratios', 'Net Income / Number of Employees',
'{"formula": "net_income / number_of_employees"}',
'["net_income", "number_of_employees"]',
'{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

-- Additional Market Ratios
('Book Value per Share', 'القيمة الدفترية للسهم', 'Shareholders equity per outstanding share', 'حقوق المساهمين لكل سهم قائم', 'Market', 'Per Share Ratios', 'Total Shareholders Equity / Outstanding Shares',
'{"formula": "total_shareholders_equity / outstanding_shares"}',
'["total_shareholders_equity", "outstanding_shares"]',
'{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Earnings per Share (EPS)', 'ربحية السهم', 'Net income per outstanding share', 'صافي الدخل لكل سهم قائم', 'Market', 'Per Share Ratios', 'Net Income / Outstanding Shares',
'{"formula": "net_income / outstanding_shares"}',
'["net_income", "outstanding_shares"]',
'{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

('Diluted EPS', 'ربحية السهم المخففة', 'EPS assuming all convertibles are converted', 'ربحية السهم بافتراض تحويل جميع الأدوات القابلة للتحويل', 'Market', 'Per Share Ratios', 'Net Income / Diluted Shares Outstanding',
'{"formula": "net_income / diluted_shares_outstanding"}',
'["net_income", "diluted_shares_outstanding"]',
'{"type": "currency", "unit": "SAR", "decimal_places": 2}'),

-- Dupont Analysis Components
('Equity Multiplier', 'مضاعف حقوق الملكية', 'Total assets to shareholders equity ratio', 'نسبة إجمالي الأصول إلى حقوق المساهمين', 'Leverage', 'DuPont Components', 'Total Assets / Total Shareholders Equity',
'{"formula": "total_assets / total_shareholders_equity", "interpretation": {"low": "< 2", "moderate": "2-3", "high": "> 3"}}',
'["total_assets", "total_shareholders_equity"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('DuPont ROE', 'عائد حقوق الملكية دوبونت', '3-factor DuPont analysis of ROE', 'تحليل دوبونت ثلاثي العوامل لعائد حقوق الملكية', 'Profitability', 'DuPont Analysis', 'Profit Margin × Asset Turnover × Equity Multiplier',
'{"formula": "profit_margin * asset_turnover * equity_multiplier", "components": ["profit_margin", "asset_turnover", "equity_multiplier"]}',
'["profit_margin", "asset_turnover", "equity_multiplier"]',
'{"type": "percentage", "unit": "%", "decimal_places": 2}'),

-- Quality Ratios
('Quality of Earnings', 'جودة الأرباح', 'Operating cash flow to net income ratio', 'نسبة التدفق النقدي التشغيلي إلى صافي الدخل', 'Quality', 'Earnings Quality', 'Operating Cash Flow / Net Income',
'{"formula": "operating_cash_flow / net_income", "interpretation": {"excellent": "> 1.2", "good": "1.0-1.2", "average": "0.8-1.0", "poor": "< 0.8"}}',
'["operating_cash_flow", "net_income"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Accruals Ratio', 'نسبة الاستحقاقات', 'Non-cash earnings component', 'مكون الأرباح غير النقدي', 'Quality', 'Earnings Quality', '(Net Income - Operating Cash Flow) / Total Assets',
'{"formula": "(net_income - operating_cash_flow) / total_assets", "interpretation": {"good": "< 0.05", "moderate": "0.05-0.10", "concerning": "> 0.10"}}',
'["net_income", "operating_cash_flow", "total_assets"]',
'{"type": "ratio", "unit": "coefficient", "decimal_places": 3}'),

-- Additional Financial Health Indicators
('Financial Leverage', 'الرافعة المالية', 'Degree of financial leverage used', 'درجة الرافعة المالية المستخدمة', 'Leverage', 'Leverage Ratios', 'Total Assets / Total Equity',
'{"formula": "total_assets / total_equity", "interpretation": {"conservative": "< 2", "moderate": "2-4", "aggressive": "> 4"}}',
'["total_assets", "total_equity"]',
'{"type": "ratio", "unit": "times", "decimal_places": 2}'),

('Capitalization Ratio', 'نسبة الرسملة', 'Long-term debt to total capitalization', 'الدين طويل الأجل إلى إجمالي الرسملة', 'Leverage', 'Capital Structure', 'Long-term Debt / (Long-term Debt + Total Equity)',
'{"formula": "long_term_debt / (long_term_debt + total_equity)", "interpretation": {"low": "< 0.3", "moderate": "0.3-0.5", "high": "> 0.5"}}',
'["long_term_debt", "total_equity"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Degree of Operating Leverage', 'درجة الرافعة التشغيلية', 'Operating leverage effect on earnings', 'تأثير الرافعة التشغيلية على الأرباح', 'Risk', 'Operating Risk', '% Change in EBIT / % Change in Sales',
'{"formula": "percentage_change_ebit / percentage_change_sales", "interpretation": {"low": "< 1.5", "moderate": "1.5-2.5", "high": "> 2.5"}}',
'["percentage_change_ebit", "percentage_change_sales"]',
'{"type": "ratio", "unit": "coefficient", "decimal_places": 2}'),

('Degree of Financial Leverage', 'درجة الرافعة المالية', 'Financial leverage effect on EPS', 'تأثير الرافعة المالية على ربحية السهم', 'Risk', 'Financial Risk', '% Change in EPS / % Change in EBIT',
'{"formula": "percentage_change_eps / percentage_change_ebit", "interpretation": {"low": "< 1.5", "moderate": "1.5-2.0", "high": "> 2.0"}}',
'["percentage_change_eps", "percentage_change_ebit"]',
'{"type": "ratio", "unit": "coefficient", "decimal_places": 2}'),

-- Sector-Specific Ratios (Banking)
('Loan-to-Deposit Ratio', 'نسبة القروض إلى الودائع', 'Total loans to total deposits (Banking)', 'إجمالي القروض إلى إجمالي الودائع (البنوك)', 'Banking', 'Banking Ratios', 'Total Loans / Total Deposits',
'{"formula": "total_loans / total_deposits", "interpretation": {"conservative": "< 0.7", "moderate": "0.7-0.9", "aggressive": "> 0.9"}}',
'["total_loans", "total_deposits"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Non-Performing Loans Ratio', 'نسبة القروض غير المؤداة', 'NPLs to total loans (Banking)', 'القروض غير المؤداة إلى إجمالي القروض (البنوك)', 'Banking', 'Risk Ratios', 'Non-Performing Loans / Total Loans * 100',
'{"formula": "non_performing_loans / total_loans * 100", "interpretation": {"excellent": "< 2%", "good": "2-5%", "concerning": "> 5%"}}',
'["non_performing_loans", "total_loans"]',
'{"type": "percentage", "unit": "%", "decimal_places": 2}'),

('Capital Adequacy Ratio', 'نسبة كفاية رأس المال', 'Tier 1 capital to risk-weighted assets (Banking)', 'رأس المال من الفئة الأولى إلى الأصول المرجحة بالمخاطر (البنوك)', 'Banking', 'Capital Ratios', 'Tier 1 Capital / Risk Weighted Assets * 100',
'{"formula": "tier1_capital / risk_weighted_assets * 100", "interpretation": {"strong": "> 12%", "adequate": "8-12%", "weak": "< 8%"}}',
'["tier1_capital", "risk_weighted_assets"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

-- Sector-Specific Ratios (Insurance)
('Combined Ratio', 'النسبة المدمجة', 'Claims + Expenses to Premiums (Insurance)', 'المطالبات + المصروفات إلى الأقساط (التأمين)', 'Insurance', 'Insurance Ratios', '(Claims Paid + Operating Expenses) / Premiums Earned * 100',
'{"formula": "(claims_paid + operating_expenses) / premiums_earned * 100", "interpretation": {"profitable": "< 100%", "break_even": "= 100%", "unprofitable": "> 100%"}}',
'["claims_paid", "operating_expenses", "premiums_earned"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Loss Ratio', 'نسبة الخسائر', 'Claims to premiums ratio (Insurance)', 'نسبة المطالبات إلى الأقساط (التأمين)', 'Insurance', 'Insurance Ratios', 'Claims Paid / Premiums Earned * 100',
'{"formula": "claims_paid / premiums_earned * 100", "interpretation": {"excellent": "< 60%", "good": "60-80%", "concerning": "> 80%"}}',
'["claims_paid", "premiums_earned"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

-- More Advanced Ratios
('Economic Value Added (EVA)', 'القيمة الاقتصادية المضافة', 'NOPAT minus cost of capital', 'صافي الربح التشغيلي بعد الضرائب ناقص تكلفة رأس المال', 'Value Creation', 'Value Metrics', 'NOPAT - (Invested Capital × WACC)',
'{"formula": "nopat - (invested_capital * wacc)", "interpretation": {"positive": "value_creating", "negative": "value_destroying"}}',
'["nopat", "invested_capital", "wacc"]',
'{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Market Value Added (MVA)', 'القيمة السوقية المضافة', 'Market value minus invested capital', 'القيمة السوقية ناقص رأس المال المستثمر', 'Value Creation', 'Value Metrics', 'Market Value of Company - Invested Capital',
'{"formula": "market_value_company - invested_capital", "interpretation": {"positive": "value_creating", "negative": "value_destroying"}}',
'["market_value_company", "invested_capital"]',
'{"type": "currency", "unit": "SAR", "decimal_places": 0}'),

('Return on Invested Capital (ROIC)', 'العائد على رأس المال المستثمر', 'After-tax operating income to invested capital', 'دخل التشغيل بعد الضرائب إلى رأس المال المستثمر', 'Profitability', 'Return Ratios', 'NOPAT / Invested Capital * 100',
'{"formula": "nopat / invested_capital * 100", "interpretation": {"excellent": "> 20%", "good": "15-20%", "average": "10-15%", "poor": "< 10%"}}',
'["nopat", "invested_capital"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Weighted Average Cost of Capital (WACC)', 'المتوسط المرجح لتكلفة رأس المال', 'Blended cost of equity and debt financing', 'التكلفة المخلوطة لتمويل حقوق الملكية والدين', 'Cost of Capital', 'Cost Metrics', '(E/V × Re) + ((D/V × Rd) × (1-T))',
'{"formula": "(equity_weight * cost_of_equity) + (debt_weight * cost_of_debt * (1 - tax_rate))", "interpretation": {"low": "< 8%", "moderate": "8-12%", "high": "> 12%"}}',
'["equity_weight", "cost_of_equity", "debt_weight", "cost_of_debt", "tax_rate"]',
'{"type": "percentage", "unit": "%", "decimal_places": 2}'),

-- Sustainable Growth Rate
('Sustainable Growth Rate', 'معدل النمو المستدام', 'Maximum growth rate without external financing', 'أقصى معدل نمو بدون تمويل خارجي', 'Growth', 'Growth Analysis', 'ROE × (1 - Dividend Payout Ratio)',
'{"formula": "roe * (1 - dividend_payout_ratio)", "interpretation": {"conservative": "< 10%", "moderate": "10-20%", "aggressive": "> 20%"}}',
'["roe", "dividend_payout_ratio"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

('Internal Growth Rate', 'معدل النمو الداخلي', 'Growth rate using only retained earnings', 'معدل النمو باستخدام الأرباح المحتجزة فقط', 'Growth', 'Growth Analysis', 'ROA × Retention Ratio',
'{"formula": "roa * retention_ratio", "interpretation": {"conservative": "< 5%", "moderate": "5-15%", "aggressive": "> 15%"}}',
'["roa", "retention_ratio"]',
'{"type": "percentage", "unit": "%", "decimal_places": 1}'),

-- Cash Flow Coverage Ratios
('Capital Expenditure Coverage', 'تغطية النفقات الرأسمالية', 'Operating cash flow to capex ratio', 'نسبة التدفق النقدي التشغيلي إلى النفقات الرأسمالية', 'Cash Flow', 'Coverage Ratios', 'Operating Cash Flow / Capital Expenditures',
'{"formula": "operating_cash_flow / capital_expenditures", "interpretation": {"excellent": "> 3", "good": "2-3", "adequate": "1-2", "concerning": "< 1"}}',
'["operating_cash_flow", "capital_expenditures"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}'),

('Debt Service Coverage', 'تغطية خدمة الدين', 'Operating income to debt service ratio', 'نسبة الدخل التشغيلي إلى خدمة الدين', 'Cash Flow', 'Coverage Ratios', 'Operating Income / (Principal + Interest Payments)',
'{"formula": "operating_income / (principal_payments + interest_payments)", "interpretation": {"strong": "> 2", "adequate": "1.5-2", "weak": "< 1.5"}}',
'["operating_income", "principal_payments", "interest_payments"]',
'{"type": "ratio", "unit": "times", "decimal_places": 1}');

-- Insert company sectors
INSERT INTO company_sectors (name_en, name_ar, code, description_en, description_ar) VALUES
('Financial Services', 'الخدمات المالية', 'FIN', 'Banking, insurance, and investment services', 'البنوك والتأمين وخدمات الاستثمار'),
('Technology', 'التكنولوجيا', 'TECH', 'Software, hardware, and IT services', 'البرمجيات والأجهزة وخدمات تقنية المعلومات'),
('Healthcare', 'الرعاية الصحية', 'HLTH', 'Pharmaceuticals, medical devices, and healthcare services', 'الأدوية والأجهزة الطبية وخدمات الرعاية الصحية'),
('Energy', 'الطاقة', 'ENRG', 'Oil, gas, and renewable energy', 'النفط والغاز والطاقة المتجددة'),
('Manufacturing', 'الصناعة', 'MANF', 'Industrial and consumer goods production', 'إنتاج السلع الصناعية والاستهلاكية'),
('Retail', 'التجزئة', 'RETL', 'Consumer retail and e-commerce', 'تجارة التجزئة والتجارة الإلكترونية'),
('Real Estate', 'العقارات', 'REST', 'Property development and management', 'تطوير وإدارة العقارات'),
('Transportation', 'النقل', 'TRNS', 'Logistics, shipping, and transportation services', 'الخدمات اللوجستية والشحن والنقل'),
('Telecommunications', 'الاتصالات', 'TELC', 'Mobile, internet, and communication services', 'خدمات الهاتف المحمول والإنترنت والاتصالات'),
('Utilities', 'المرافق', 'UTIL', 'Water, electricity, and gas utilities', 'مرافق المياه والكهرباء والغاز');

-- Insert legal entities
INSERT INTO legal_entities (name_en, name_ar, code, description_en, description_ar) VALUES
('Public Joint Stock Company', 'شركة مساهمة عامة', 'PJSC', 'Publicly traded corporation', 'شركة مساهمة متداولة علناً'),
('Private Joint Stock Company', 'شركة مساهمة مقفلة', 'PrJSC', 'Private corporation', 'شركة مساهمة خاصة'),
('Limited Liability Company', 'شركة ذات مسؤولية محدودة', 'LLC', 'Limited liability company', 'شركة ذات مسؤولية محدودة'),
('Partnership', 'شراكة', 'PART', 'General or limited partnership', 'شراكة عامة أو محدودة'),
('Sole Proprietorship', 'مؤسسة فردية', 'SP', 'Individual business ownership', 'ملكية تجارية فردية'),
('Branch Office', 'مكتب فرعي', 'BR', 'Branch of foreign company', 'فرع لشركة أجنبية'),
('Representative Office', 'مكتب تمثيلي', 'RO', 'Representative office of foreign company', 'مكتب تمثيلي لشركة أجنبية'),
('Non-Profit Organization', 'منظمة غير ربحية', 'NPO', 'Non-profit organization', 'منظمة غير هادفة للربح');

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
('default_currency', '"SAR"', 'Default currency for financial calculations'),
('analysis_timeout', '300', 'Analysis processing timeout in seconds'),
('max_file_size', '50', 'Maximum file upload size in MB'),
('supported_languages', '["en", "ar"]', 'Supported interface languages'),
('ai_models', '{"openai": "gpt-4", "gemini": "gemini-pro"}', 'AI models configuration'),
('external_apis', '{"fmp": true, "openai": true, "gemini": true}', 'External APIs availability'),
('subscription_plans', '{"monthly": 299, "quarterly": 799, "yearly": 2999}', 'Subscription pricing in SAR'),
('report_templates', '["standard", "executive", "detailed", "custom"]', 'Available report templates');