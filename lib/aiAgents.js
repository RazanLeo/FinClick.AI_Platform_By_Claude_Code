const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const winston = require('winston');
const { supabaseAdmin } = require('./supabase');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './logs/ai-agents.log' })
    ]
});

class AIAgents {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.geminiModel = this.gemini.getGenerativeModel({ model: "gemini-pro" });

        this.costs = {
            total: 0,
            openai: 0,
            gemini: 0
        };
    }

    // Document Processing Agent
    async processDocument(analysisId, documentData, language = 'en') {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            logger.info(`Starting document processing for analysis ${analysisId}`);

            const prompt = this.createDocumentProcessingPrompt(documentData, language);

            // Use OpenAI for document processing
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: language === 'ar' ?
                            'أنت خبير في التحليل المالي وتحليل الوثائق المالية. مهمتك هي استخراج البيانات المالية الرئيسية من الوثائق.' :
                            'You are a financial analysis expert specializing in document processing. Your task is to extract key financial data from documents.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 4000
            });

            const extractedData = this.parseDocumentResponse(response.choices[0].message.content);

            // Calculate cost
            const inputTokens = response.usage.prompt_tokens;
            const outputTokens = response.usage.completion_tokens;
            const cost = this.calculateOpenAICost('gpt-4', inputTokens, outputTokens);

            this.costs.openai += cost;
            this.costs.total += cost;

            result = {
                extracted_data: extractedData,
                confidence_score: this.calculateConfidenceScore(extractedData),
                processing_notes: this.generateProcessingNotes(extractedData, language)
            };

            logger.info(`Document processing completed for analysis ${analysisId}`);

        } catch (err) {
            logger.error('Error in document processing:', err);
            error = err.message;
        }

        // Log the agent activity
        await this.logAgentActivity(analysisId, 'document_processor', 'Document Processing Agent', {
            document_id: documentData.id,
            language: language
        }, result, Date.now() - startTime, null, this.costs.openai, error ? 'error' : 'success', error);

        return { result, error };
    }

    // Financial Analysis Agent
    async analyzeFinancialData(analysisId, financialData, analysisTypes, language = 'en') {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            logger.info(`Starting financial analysis for analysis ${analysisId}`);

            const prompt = this.createFinancialAnalysisPrompt(financialData, analysisTypes, language);

            // Use Gemini for financial analysis
            const geminiResult = await this.geminiModel.generateContent(prompt);
            const response = geminiResult.response;
            const analysisResult = this.parseFinancialAnalysisResponse(response.text());

            // Estimate cost (Gemini pricing is different)
            const cost = 0.001; // Placeholder cost
            this.costs.gemini += cost;
            this.costs.total += cost;

            result = {
                insights: analysisResult.insights,
                recommendations: analysisResult.recommendations,
                risk_assessment: analysisResult.risk_assessment,
                industry_comparison: analysisResult.industry_comparison,
                trends: analysisResult.trends
            };

            logger.info(`Financial analysis completed for analysis ${analysisId}`);

        } catch (err) {
            logger.error('Error in financial analysis:', err);
            error = err.message;
        }

        await this.logAgentActivity(analysisId, 'financial_analyzer', 'Financial Analysis Agent', {
            analysis_types: analysisTypes.map(t => t.name_en),
            language: language
        }, result, Date.now() - startTime, null, cost, error ? 'error' : 'success', error);

        return { result, error };
    }

    // Market Data Enrichment Agent
    async enrichWithMarketData(analysisId, companyData, sectorData, language = 'en') {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            logger.info(`Starting market data enrichment for analysis ${analysisId}`);

            const prompt = this.createMarketEnrichmentPrompt(companyData, sectorData, language);

            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: language === 'ar' ?
                            'أنت محلل أسواق مالية متخصص في مقارنة أداء الشركات مع معايير الصناعة وتحليل اتجاهات السوق.' :
                            'You are a market analyst specialized in comparing company performance with industry benchmarks and analyzing market trends.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 3000
            });

            const marketInsights = this.parseMarketEnrichmentResponse(response.choices[0].message.content);

            const cost = this.calculateOpenAICost('gpt-3.5-turbo', response.usage.prompt_tokens, response.usage.completion_tokens);
            this.costs.openai += cost;
            this.costs.total += cost;

            result = {
                market_position: marketInsights.market_position,
                competitive_analysis: marketInsights.competitive_analysis,
                sector_trends: marketInsights.sector_trends,
                benchmark_comparison: marketInsights.benchmark_comparison,
                market_outlook: marketInsights.market_outlook
            };

            logger.info(`Market data enrichment completed for analysis ${analysisId}`);

        } catch (err) {
            logger.error('Error in market data enrichment:', err);
            error = err.message;
        }

        await this.logAgentActivity(analysisId, 'market_enricher', 'Market Data Enrichment Agent', {
            company: companyData.company_name,
            sector: sectorData.name_en,
            language: language
        }, result, Date.now() - startTime, null, cost, error ? 'error' : 'success', error);

        return { result, error };
    }

    // Report Generation Agent
    async generateReportContent(analysisId, analysisResults, language = 'en') {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            logger.info(`Starting report generation for analysis ${analysisId}`);

            const prompt = this.createReportGenerationPrompt(analysisResults, language);

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: language === 'ar' ?
                            'أنت كاتب تقارير مالية محترف متخصص في إنشاء تقارير شاملة ومفصلة للتحليل المالي.' :
                            'You are a professional financial report writer specialized in creating comprehensive and detailed financial analysis reports.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 6000
            });

            const reportContent = this.parseReportContent(response.choices[0].message.content);

            const cost = this.calculateOpenAICost('gpt-4', response.usage.prompt_tokens, response.usage.completion_tokens);
            this.costs.openai += cost;
            this.costs.total += cost;

            result = {
                executive_summary: reportContent.executive_summary,
                detailed_analysis: reportContent.detailed_analysis,
                charts_descriptions: reportContent.charts_descriptions,
                recommendations: reportContent.recommendations,
                appendix: reportContent.appendix,
                glossary: reportContent.glossary
            };

            logger.info(`Report generation completed for analysis ${analysisId}`);

        } catch (err) {
            logger.error('Error in report generation:', err);
            error = err.message;
        }

        await this.logAgentActivity(analysisId, 'report_generator', 'Report Generation Agent', {
            language: language,
            analysis_count: Object.keys(analysisResults.results || {}).length
        }, result, Date.now() - startTime, null, cost, error ? 'error' : 'success', error);

        return { result, error };
    }

    // Risk Assessment Agent
    async assessRisks(analysisId, financialData, industryData, language = 'en') {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            logger.info(`Starting risk assessment for analysis ${analysisId}`);

            const prompt = this.createRiskAssessmentPrompt(financialData, industryData, language);

            const response = await this.geminiModel.generateContent(prompt);
            const riskAnalysis = this.parseRiskAssessmentResponse(response.response.text());

            const cost = 0.001; // Placeholder for Gemini cost
            this.costs.gemini += cost;
            this.costs.total += cost;

            result = {
                overall_risk_score: riskAnalysis.overall_risk_score,
                risk_categories: riskAnalysis.risk_categories,
                key_risks: riskAnalysis.key_risks,
                mitigation_strategies: riskAnalysis.mitigation_strategies,
                risk_trend: riskAnalysis.risk_trend
            };

            logger.info(`Risk assessment completed for analysis ${analysisId}`);

        } catch (err) {
            logger.error('Error in risk assessment:', err);
            error = err.message;
        }

        await this.logAgentActivity(analysisId, 'risk_assessor', 'Risk Assessment Agent', {
            language: language
        }, result, Date.now() - startTime, null, cost, error ? 'error' : 'success', error);

        return { result, error };
    }

    // Orchestrator - runs all agents in sequence
    async runFullAnalysis(analysisId, documentData, financialData, analysisTypes, companyData, sectorData, language = 'en') {
        logger.info(`Starting full AI analysis for analysis ${analysisId}`);

        const results = {
            document_processing: null,
            financial_analysis: null,
            market_enrichment: null,
            risk_assessment: null,
            report_content: null,
            total_cost: 0,
            processing_time: 0,
            errors: []
        };

        const startTime = Date.now();

        try {
            // Step 1: Process Document
            const docResult = await this.processDocument(analysisId, documentData, language);
            results.document_processing = docResult.result;
            if (docResult.error) results.errors.push(`Document Processing: ${docResult.error}`);

            // Step 2: Analyze Financial Data
            const analysisResult = await this.analyzeFinancialData(analysisId, financialData, analysisTypes, language);
            results.financial_analysis = analysisResult.result;
            if (analysisResult.error) results.errors.push(`Financial Analysis: ${analysisResult.error}`);

            // Step 3: Enrich with Market Data
            const marketResult = await this.enrichWithMarketData(analysisId, companyData, sectorData, language);
            results.market_enrichment = marketResult.result;
            if (marketResult.error) results.errors.push(`Market Enrichment: ${marketResult.error}`);

            // Step 4: Assess Risks
            const riskResult = await this.assessRisks(analysisId, financialData, { sector: sectorData }, language);
            results.risk_assessment = riskResult.result;
            if (riskResult.error) results.errors.push(`Risk Assessment: ${riskResult.error}`);

            // Step 5: Generate Report Content
            const reportResult = await this.generateReportContent(analysisId, {
                results: financialData,
                ai_insights: {
                    financial_analysis: results.financial_analysis,
                    market_enrichment: results.market_enrichment,
                    risk_assessment: results.risk_assessment
                }
            }, language);
            results.report_content = reportResult.result;
            if (reportResult.error) results.errors.push(`Report Generation: ${reportResult.error}`);

            results.total_cost = this.costs.total;
            results.processing_time = Date.now() - startTime;

            logger.info(`Full AI analysis completed for analysis ${analysisId}. Cost: $${results.total_cost.toFixed(4)}, Time: ${results.processing_time}ms`);

        } catch (error) {
            logger.error('Error in full analysis orchestration:', error);
            results.errors.push(`Orchestration Error: ${error.message}`);
        }

        return results;
    }

    // Prompt Creation Functions
    createDocumentProcessingPrompt(documentData, language) {
        const basePrompt = language === 'ar' ? `
تحليل الوثيقة المالية التالية واستخراج البيانات المالية الرئيسية:

نوع الوثيقة: ${documentData.mime_type}
اسم الملف: ${documentData.original_filename}
البيانات المستخرجة من OCR: ${JSON.stringify(documentData.ocr_data || {})}

يرجى استخراج البيانات المالية التالية إذا كانت متوفرة:
- الأصول المتداولة
- الخصوم المتداولة
- إجمالي الأصول
- إجمالي حقوق الملكية
- الإيرادات/المبيعات
- تكلفة البضاعة المباعة
- الربح التشغيلي
- صافي الدخل
- التدفق النقدي التشغيلي
- النفقات الرأسمالية

قدم النتائج بتنسيق JSON مع مستوى الثقة لكل قيمة.
` : `
Analyze the following financial document and extract key financial data:

Document Type: ${documentData.mime_type}
Filename: ${documentData.original_filename}
OCR Data: ${JSON.stringify(documentData.ocr_data || {})}

Please extract the following financial data if available:
- Current Assets
- Current Liabilities
- Total Assets
- Total Equity
- Revenue/Sales
- Cost of Goods Sold
- Operating Income
- Net Income
- Operating Cash Flow
- Capital Expenditures

Provide results in JSON format with confidence level for each value.
`;

        return basePrompt;
    }

    createFinancialAnalysisPrompt(financialData, analysisTypes, language) {
        const typesList = analysisTypes.map(t => language === 'ar' ? t.name_ar : t.name_en).join(', ');

        return language === 'ar' ? `
قم بتحليل البيانات المالية التالية وتقديم رؤى شاملة:

البيانات المالية:
${JSON.stringify(financialData, null, 2)}

أنواع التحليل المطلوبة:
${typesList}

يرجى تقديم:
1. تحليل شامل لكل نسبة مالية
2. تقييم الأداء المالي العام
3. نقاط القوة والضعف
4. توصيات للتحسين
5. تحليل الاتجاهات إذا كانت البيانات التاريخية متوفرة
6. مقارنة مع معايير الصناعة (إذا كانت متوفرة)

قدم النتائج بتنسيق JSON مع التفسيرات باللغة العربية.
` : `
Analyze the following financial data and provide comprehensive insights:

Financial Data:
${JSON.stringify(financialData, null, 2)}

Required Analysis Types:
${typesList}

Please provide:
1. Comprehensive analysis of each financial ratio
2. Overall financial performance assessment
3. Strengths and weaknesses identification
4. Improvement recommendations
5. Trend analysis if historical data is available
6. Industry benchmark comparison (if available)

Provide results in JSON format with explanations in English.
`;
    }

    createMarketEnrichmentPrompt(companyData, sectorData, language) {
        return language === 'ar' ? `
قم بإثراء التحليل المالي بالبيانات السوقية والقطاعية:

بيانات الشركة:
${JSON.stringify(companyData, null, 2)}

بيانات القطاع:
${JSON.stringify(sectorData, null, 2)}

يرجى تقديم:
1. تحليل الموقع السوقي للشركة
2. المقارنة مع الشركات المنافسة
3. اتجاهات القطاع والسوق
4. مقارنة مع المعايير القطاعية
5. توقعات السوق والنظرة المستقبلية

قدم التحليل بتنسيق JSON باللغة العربية.
` : `
Enrich the financial analysis with market and sector data:

Company Data:
${JSON.stringify(companyData, null, 2)}

Sector Data:
${JSON.stringify(sectorData, null, 2)}

Please provide:
1. Company's market position analysis
2. Competitive comparison
3. Sector and market trends
4. Industry benchmark comparison
5. Market outlook and future prospects

Provide analysis in JSON format in English.
`;
    }

    createReportGenerationPrompt(analysisResults, language) {
        return language === 'ar' ? `
اكتب تقريراً مالياً شاملاً ومهنياً بناءً على نتائج التحليل التالية:

نتائج التحليل:
${JSON.stringify(analysisResults, null, 2)}

يجب أن يتضمن التقرير:
1. ملخص تنفيذي
2. تحليل مفصل للنسب المالية
3. وصف للمخططات والرسوم البيانية
4. التوصيات والاستنتاجات
5. ملحق بالبيانات التفصيلية
6. مسرد المصطلحات المالية

اكتب التقرير باللغة العربية بأسلوب مهني ومناسب لأصحاب القرار.
` : `
Write a comprehensive and professional financial report based on the following analysis results:

Analysis Results:
${JSON.stringify(analysisResults, null, 2)}

The report should include:
1. Executive Summary
2. Detailed Financial Ratio Analysis
3. Charts and Graphs Descriptions
4. Recommendations and Conclusions
5. Appendix with Detailed Data
6. Financial Terms Glossary

Write the report in English in a professional style suitable for decision makers.
`;
    }

    createRiskAssessmentPrompt(financialData, industryData, language) {
        return language === 'ar' ? `
قم بتقييم شامل للمخاطر المالية بناءً على البيانات التالية:

البيانات المالية:
${JSON.stringify(financialData, null, 2)}

بيانات الصناعة:
${JSON.stringify(industryData, null, 2)}

يرجى تقديم:
1. درجة المخاطر الإجمالية (من 1-10)
2. تصنيف المخاطر (مخاطر السيولة، الائتمان، السوق، التشغيل)
3. أهم المخاطر المحددة
4. استراتيجيات التخفيف من المخاطر
5. اتجاه المخاطر (متزايد، مستقر، متناقص)

قدم التقييم بتنسيق JSON باللغة العربية.
` : `
Conduct a comprehensive risk assessment based on the following data:

Financial Data:
${JSON.stringify(financialData, null, 2)}

Industry Data:
${JSON.stringify(industryData, null, 2)}

Please provide:
1. Overall risk score (1-10 scale)
2. Risk categories (liquidity, credit, market, operational)
3. Key identified risks
4. Risk mitigation strategies
5. Risk trend (increasing, stable, decreasing)

Provide assessment in JSON format in English.
`;
    }

    // Response Parsing Functions
    parseDocumentResponse(response) {
        try {
            // Try to parse as JSON first
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback to text parsing
            return {
                extracted_values: response,
                confidence: 0.5,
                notes: 'Parsed from text response'
            };
        } catch (error) {
            logger.error('Error parsing document response:', error);
            return { error: 'Failed to parse response' };
        }
    }

    parseFinancialAnalysisResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return {
                insights: response.substring(0, 1000),
                recommendations: [],
                risk_assessment: 'Medium',
                industry_comparison: 'Not available'
            };
        } catch (error) {
            logger.error('Error parsing financial analysis response:', error);
            return { error: 'Failed to parse response' };
        }
    }

    parseMarketEnrichmentResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return {
                market_position: 'Average',
                competitive_analysis: response.substring(0, 500),
                sector_trends: [],
                benchmark_comparison: {},
                market_outlook: 'Neutral'
            };
        } catch (error) {
            logger.error('Error parsing market enrichment response:', error);
            return { error: 'Failed to parse response' };
        }
    }

    parseReportContent(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Split response into sections
            const sections = response.split(/\n\s*\n/);
            return {
                executive_summary: sections[0] || '',
                detailed_analysis: sections[1] || '',
                charts_descriptions: [],
                recommendations: sections[2] || '',
                appendix: sections[3] || '',
                glossary: {}
            };
        } catch (error) {
            logger.error('Error parsing report content:', error);
            return { error: 'Failed to parse response' };
        }
    }

    parseRiskAssessmentResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return {
                overall_risk_score: 5,
                risk_categories: {
                    liquidity: 'Medium',
                    credit: 'Medium',
                    market: 'Medium',
                    operational: 'Medium'
                },
                key_risks: [],
                mitigation_strategies: [],
                risk_trend: 'Stable'
            };
        } catch (error) {
            logger.error('Error parsing risk assessment response:', error);
            return { error: 'Failed to parse response' };
        }
    }

    // Utility Functions
    calculateConfidenceScore(extractedData) {
        if (!extractedData || Object.keys(extractedData).length === 0) return 0;

        let totalFields = 0;
        let filledFields = 0;

        const expectedFields = [
            'current_assets', 'current_liabilities', 'total_assets', 'total_equity',
            'revenue', 'cogs', 'operating_income', 'net_income'
        ];

        expectedFields.forEach(field => {
            totalFields++;
            if (extractedData[field] && extractedData[field] !== null && extractedData[field] !== 0) {
                filledFields++;
            }
        });

        return Math.round((filledFields / totalFields) * 100) / 100;
    }

    generateProcessingNotes(extractedData, language) {
        const notes = [];
        const fieldCount = Object.keys(extractedData).length;

        if (language === 'ar') {
            notes.push(`تم استخراج ${fieldCount} حقل من البيانات المالية`);
            if (fieldCount < 5) notes.push('البيانات المستخرجة محدودة، قد تحتاج إلى مراجعة يدوية');
        } else {
            notes.push(`Extracted ${fieldCount} financial data fields`);
            if (fieldCount < 5) notes.push('Limited data extracted, may require manual review');
        }

        return notes;
    }

    calculateOpenAICost(model, inputTokens, outputTokens) {
        const pricing = {
            'gpt-4': { input: 0.03, output: 0.06 },
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }
        };

        const rates = pricing[model] || pricing['gpt-3.5-turbo'];
        return ((inputTokens * rates.input) + (outputTokens * rates.output)) / 1000;
    }

    async logAgentActivity(analysisId, agentType, agentName, inputData, outputData, processingTime, tokensUsed, cost, status, errorMessage) {
        try {
            await supabaseAdmin
                .from('ai_agent_logs')
                .insert({
                    analysis_id: analysisId,
                    agent_type: agentType,
                    agent_name: agentName,
                    input_data: inputData,
                    output_data: outputData,
                    processing_time: processingTime,
                    tokens_used: tokensUsed,
                    cost: cost,
                    status: status,
                    error_message: errorMessage
                });
        } catch (error) {
            logger.error('Error logging agent activity:', error);
        }
    }

    // Get total costs for reporting
    getCosts() {
        return { ...this.costs };
    }

    // Reset costs
    resetCosts() {
        this.costs = { total: 0, openai: 0, gemini: 0 };
    }
}

module.exports = AIAgents;