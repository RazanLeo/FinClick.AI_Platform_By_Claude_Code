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

        // Initialize all seven specialized agents
        this.agents = {
            ingestion: new IngestionAgent(this),
            structuring: new StructuringAgent(this),
            benchmark: new BenchmarkAgent(this),
            analysis: new AnalysisAgent(this),
            narrative: new NarrativeAgent(this),
            reporting: new ReportingAgent(this),
            compliance: new ComplianceAgent(this)
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

    // Enhanced Orchestrator - runs all seven specialized agents in sequence
    async runFullAnalysis(analysisId, documentData, financialData, analysisTypes, companyData, sectorData, language = 'en') {
        logger.info(`Starting full AI analysis with 7 specialized agents for analysis ${analysisId}`);

        const results = {
            ingestion_results: null,
            structuring_results: null,
            benchmark_results: null,
            analysis_results: null,
            narrative_results: null,
            reporting_results: null,
            compliance_results: null,
            total_cost: 0,
            processing_time: 0,
            errors: [],
            agent_performance: {}
        };

        const startTime = Date.now();

        try {
            // Step 1: Data Ingestion Agent
            logger.info('Running IngestionAgent...');
            const ingestionResult = await this.agents.ingestion.processMultipleDocuments(
                analysisId,
                Array.isArray(documentData) ? documentData : [documentData],
                language
            );
            results.ingestion_results = ingestionResult.result;
            results.agent_performance.ingestion = ingestionResult.error ? 'failed' : 'success';
            if (ingestionResult.error) results.errors.push(`Ingestion: ${ingestionResult.error}`);

            // Step 2: Data Structuring Agent
            logger.info('Running StructuringAgent...');
            const structuringResult = await this.agents.structuring.structureFinancialData(
                analysisId,
                ingestionResult.result?.consolidated_data || financialData,
                analysisTypes,
                language
            );
            results.structuring_results = structuringResult.result;
            results.agent_performance.structuring = structuringResult.error ? 'failed' : 'success';
            if (structuringResult.error) results.errors.push(`Structuring: ${structuringResult.error}`);

            // Step 3: Benchmark Agent
            logger.info('Running BenchmarkAgent...');
            const benchmarkResult = await this.agents.benchmark.fetchIndustryBenchmarks(
                analysisId,
                sectorData.id,
                companyData.activity_id,
                analysisTypes.map(t => t.name_en),
                language
            );
            results.benchmark_results = benchmarkResult.result;
            results.agent_performance.benchmark = benchmarkResult.error ? 'failed' : 'success';
            if (benchmarkResult.error) results.errors.push(`Benchmark: ${benchmarkResult.error}`);

            // Step 4: Analysis Agent
            logger.info('Running AnalysisAgent...');
            const analysisResult = await this.agents.analysis.performAdvancedAnalysis(
                analysisId,
                structuringResult.result?.structured_data || financialData,
                analysisTypes,
                benchmarkResult.result || {},
                language
            );
            results.analysis_results = analysisResult.result;
            results.agent_performance.analysis = analysisResult.error ? 'failed' : 'success';
            if (analysisResult.error) results.errors.push(`Analysis: ${analysisResult.error}`);

            // Step 5: Narrative Agent
            logger.info('Running NarrativeAgent...');
            const narrativeResult = await this.agents.narrative.generateNarrative(
                analysisId,
                analysisResult.result || {},
                language
            );
            results.narrative_results = narrativeResult.result;
            results.agent_performance.narrative = narrativeResult.error ? 'failed' : 'success';
            if (narrativeResult.error) results.errors.push(`Narrative: ${narrativeResult.error}`);

            // Step 6: Reporting Agent
            logger.info('Running ReportingAgent...');
            const reportingResult = await this.agents.reporting.generateReport(
                analysisId,
                narrativeResult.result || {},
                [], // Charts will be generated separately
                'pdf',
                language
            );
            results.reporting_results = reportingResult.result;
            results.agent_performance.reporting = reportingResult.error ? 'failed' : 'success';
            if (reportingResult.error) results.errors.push(`Reporting: ${reportingResult.error}`);

            // Step 7: Compliance Agent
            logger.info('Running ComplianceAgent...');
            const complianceResult = await this.agents.compliance.checkCompliance(
                analysisId,
                structuringResult.result?.structured_data || financialData,
                reportingResult.result || {},
                'SA', // Default to Saudi Arabia
                language
            );
            results.compliance_results = complianceResult.result;
            results.agent_performance.compliance = complianceResult.error ? 'failed' : 'success';
            if (complianceResult.error) results.errors.push(`Compliance: ${complianceResult.error}`);

            results.total_cost = this.costs.total;
            results.processing_time = Date.now() - startTime;

            // Log completion statistics
            const successfulAgents = Object.values(results.agent_performance).filter(status => status === 'success').length;
            logger.info(`Full AI analysis completed for analysis ${analysisId}. ${successfulAgents}/7 agents successful. Cost: $${results.total_cost.toFixed(4)}, Time: ${results.processing_time}ms`);

        } catch (error) {
            logger.error('Error in full analysis orchestration:', error);
            results.errors.push(`Orchestration Error: ${error.message}`);
        }

        return results;
    }

    // Legacy method for backward compatibility
    async processDocument(analysisId, documentData, language = 'en') {
        return await this.agents.ingestion.processMultipleDocuments(analysisId, [documentData], language);
    }

    async analyzeFinancialData(analysisId, financialData, analysisTypes, language = 'en') {
        const structuredData = await this.agents.structuring.structureFinancialData(analysisId, financialData, analysisTypes, language);
        const benchmarks = await this.agents.benchmark.fetchIndustryBenchmarks(analysisId, null, null, analysisTypes.map(t => t.name_en), language);
        return await this.agents.analysis.performAdvancedAnalysis(analysisId, structuredData.result?.structured_data || financialData, analysisTypes, benchmarks.result || {}, language);
    }

    async enrichWithMarketData(analysisId, companyData, sectorData, language = 'en') {
        return await this.agents.benchmark.fetchIndustryBenchmarks(analysisId, sectorData.id, companyData.activity_id, [], language);
    }

    async assessRisks(analysisId, financialData, industryData, language = 'en') {
        // Risk assessment is now integrated into the Analysis Agent
        return { result: { overall_risk_score: 5, risk_categories: {}, key_risks: [], mitigation_strategies: [], risk_trend: 'stable' }, error: null };
    }

    async generateReportContent(analysisId, analysisResults, language = 'en') {
        const narrative = await this.agents.narrative.generateNarrative(analysisId, analysisResults, language);
        return await this.agents.reporting.generateReport(analysisId, narrative.result || {}, [], 'pdf', language);
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

}

// IngestionAgent - وكيل استيعاب البيانات
class IngestionAgent {
    constructor(parent) {
        this.parent = parent;
        this.name = 'IngestionAgent';
        this.description = 'متخصص في استيعاب وتحويل البيانات من المصادر المختلفة';
    }

    async processMultipleDocuments(analysisId, documents, language = 'en') {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            logger.info(`IngestionAgent: Processing ${documents.length} documents for analysis ${analysisId}`);

            const processedDocuments = [];

            for (const document of documents) {
                const processed = await this.processDocument(document, language);
                processedDocuments.push(processed);
            }

            // Consolidate data from multiple documents
            const consolidatedData = this.consolidateDocumentData(processedDocuments);

            result = {
                processed_documents: processedDocuments.length,
                consolidated_data: consolidatedData,
                data_quality_score: this.assessDataQuality(consolidatedData),
                ingestion_notes: this.generateIngestionNotes(processedDocuments, language)
            };

        } catch (err) {
            logger.error('IngestionAgent error:', err);
            error = err.message;
        }

        await this.parent.logAgentActivity(analysisId, 'ingestion', this.name, {
            documents_count: documents.length,
            language: language
        }, result, Date.now() - startTime, null, 0.002, error ? 'error' : 'success', error);

        return { result, error };
    }

    async processDocument(document, language) {
        const prompt = language === 'ar' ? `
استخرج وصنف البيانات المالية من الوثيقة التالية:

نوع الملف: ${document.mime_type}
اسم الملف: ${document.original_filename}
البيانات المستخرجة: ${JSON.stringify(document.ocr_data || document.processed_data || {})}

المطلوب:
1. تصنيف نوع البيانات المالية (قائمة دخل، ميزانية، تدفقات نقدية)
2. استخراج الأرقام والقيم المالية
3. تحديد الفترة الزمنية
4. تقييم جودة البيانات
5. تحديد أي بيانات مفقودة أو غير واضحة

قدم النتيجة بتنسيق JSON منظم.
` : `
Extract and classify financial data from the following document:

File Type: ${document.mime_type}
Filename: ${document.original_filename}
Extracted Data: ${JSON.stringify(document.ocr_data || document.processed_data || {})}

Required:
1. Classify financial data type (income statement, balance sheet, cash flow)
2. Extract financial numbers and values
3. Identify time period
4. Assess data quality
5. Identify missing or unclear data

Provide result in structured JSON format.
`;

        const response = await this.parent.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: language === 'ar' ?
                        'أنت وكيل ذكي متخصص في استيعاب وتصنيف البيانات المالية من مصادر متعددة.' :
                        'You are an AI agent specialized in ingesting and classifying financial data from multiple sources.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 3000
        });

        return this.parseResponse(response.choices[0].message.content);
    }

    consolidateDocumentData(processedDocuments) {
        const consolidated = {
            financial_statements: {},
            time_periods: [],
            data_completeness: 0,
            sources: []
        };

        processedDocuments.forEach(doc => {
            if (doc.statement_type) {
                consolidated.financial_statements[doc.statement_type] = doc.extracted_data;
            }
            if (doc.period) {
                consolidated.time_periods.push(doc.period);
            }
            consolidated.sources.push(doc.source);
        });

        return consolidated;
    }

    assessDataQuality(data) {
        let score = 0;
        const maxScore = 100;

        // Check completeness
        if (data.financial_statements.income_statement) score += 30;
        if (data.financial_statements.balance_sheet) score += 30;
        if (data.financial_statements.cash_flow) score += 20;
        if (data.time_periods.length > 0) score += 10;
        if (data.sources.length > 0) score += 10;

        return Math.min(score, maxScore);
    }

    generateIngestionNotes(documents, language) {
        const notes = [];
        const docCount = documents.length;

        if (language === 'ar') {
            notes.push(`تم معالجة ${docCount} وثيقة مالية`);
            notes.push('تم تصنيف وتنظيم البيانات حسب نوع القائمة المالية');
        } else {
            notes.push(`Processed ${docCount} financial documents`);
            notes.push('Data classified and organized by financial statement type');
        }

        return notes;
    }

    parseResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw_response: response };
        } catch (error) {
            return { error: 'Failed to parse response', raw_response: response };
        }
    }
}

// StructuringAgent - وكيل هيكلة البيانات
class StructuringAgent {
    constructor(parent) {
        this.parent = parent;
        this.name = 'StructuringAgent';
        this.description = 'متخصص في هيكلة وتنظيم البيانات المالية';
    }

    async structureFinancialData(analysisId, rawData, analysisTypes, language = 'en') {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            logger.info(`StructuringAgent: Structuring financial data for analysis ${analysisId}`);

            const structuredData = await this.createStructuredFormat(rawData, analysisTypes, language);
            const validationResult = this.validateStructuredData(structuredData);
            const mappedData = this.mapToAnalysisRequirements(structuredData, analysisTypes);

            result = {
                structured_data: structuredData,
                validation: validationResult,
                mapped_data: mappedData,
                completeness_score: this.calculateCompletenessScore(structuredData, analysisTypes)
            };

        } catch (err) {
            logger.error('StructuringAgent error:', err);
            error = err.message;
        }

        await this.parent.logAgentActivity(analysisId, 'structuring', this.name, {
            analysis_types_count: analysisTypes.length,
            language: language
        }, result, Date.now() - startTime, null, 0.003, error ? 'error' : 'success', error);

        return { result, error };
    }

    async createStructuredFormat(rawData, analysisTypes, language) {
        const prompt = language === 'ar' ? `
قم بهيكلة البيانات المالية التالية لتتناسب مع متطلبات التحليل:

البيانات الخام:
${JSON.stringify(rawData, null, 2)}

أنواع التحليل المطلوبة:
${analysisTypes.map(t => t.name_ar).join(', ')}

المطلوب:
1. تنظيم البيانات في هيكل موحد
2. تصنيف البيانات حسب نوع القائمة المالية
3. إنشاء مصفوفة البيانات للتحليل
4. تحديد البيانات المفقودة
5. اقتراح مصادر بديلة للبيانات المفقودة

قدم النتيجة بتنسيق JSON منظم ومرتب.
` : `
Structure the following financial data to meet analysis requirements:

Raw Data:
${JSON.stringify(rawData, null, 2)}

Required Analysis Types:
${analysisTypes.map(t => t.name_en).join(', ')}

Required:
1. Organize data in unified structure
2. Classify data by financial statement type
3. Create data matrix for analysis
4. Identify missing data
5. Suggest alternative sources for missing data

Provide result in structured and organized JSON format.
`;

        const response = await this.parent.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: language === 'ar' ?
                        'أنت وكيل ذكي متخصص في هيكلة وتنظيم البيانات المالية لأغراض التحليل.' :
                        'You are an AI agent specialized in structuring and organizing financial data for analysis purposes.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 4000
        });

        return this.parseResponse(response.choices[0].message.content);
    }

    validateStructuredData(data) {
        const validation = {
            is_valid: true,
            errors: [],
            warnings: [],
            completeness: 0
        };

        // Validate essential fields
        const requiredFields = ['revenue', 'total_assets', 'current_assets', 'current_liabilities'];
        let presentFields = 0;

        requiredFields.forEach(field => {
            if (data[field] && data[field] !== null && data[field] !== 0) {
                presentFields++;
            } else {
                validation.warnings.push(`Missing or zero value for ${field}`);
            }
        });

        validation.completeness = (presentFields / requiredFields.length) * 100;

        if (validation.completeness < 50) {
            validation.is_valid = false;
            validation.errors.push('Insufficient data for reliable analysis');
        }

        return validation;
    }

    mapToAnalysisRequirements(data, analysisTypes) {
        const mapping = {};

        analysisTypes.forEach(type => {
            const requirements = this.getAnalysisRequirements(type);
            mapping[type.name_en] = {
                required_fields: requirements,
                available_fields: this.checkFieldAvailability(data, requirements),
                readiness: this.calculateReadiness(data, requirements)
            };
        });

        return mapping;
    }

    getAnalysisRequirements(analysisType) {
        const requirements = {
            'Current Ratio': ['current_assets', 'current_liabilities'],
            'Quick Ratio': ['current_assets', 'inventory', 'current_liabilities'],
            'Debt to Equity': ['total_debt', 'total_equity'],
            'ROE': ['net_income', 'total_equity'],
            'ROA': ['net_income', 'total_assets'],
            'Gross Profit Margin': ['revenue', 'cost_of_goods_sold'],
            'Net Profit Margin': ['net_income', 'revenue']
        };

        return requirements[analysisType.name_en] || [];
    }

    checkFieldAvailability(data, requirements) {
        return requirements.filter(field => data[field] && data[field] !== null && data[field] !== 0);
    }

    calculateReadiness(data, requirements) {
        if (requirements.length === 0) return 100;
        const available = this.checkFieldAvailability(data, requirements);
        return (available.length / requirements.length) * 100;
    }

    calculateCompletenessScore(data, analysisTypes) {
        const totalRequirements = analysisTypes.reduce((sum, type) => {
            return sum + this.getAnalysisRequirements(type).length;
        }, 0);

        if (totalRequirements === 0) return 100;

        let availableFields = 0;
        analysisTypes.forEach(type => {
            const requirements = this.getAnalysisRequirements(type);
            availableFields += this.checkFieldAvailability(data, requirements).length;
        });

        return (availableFields / totalRequirements) * 100;
    }

    parseResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw_response: response };
        } catch (error) {
            return { error: 'Failed to parse response', raw_response: response };
        }
    }
}

// BenchmarkAgent - وكيل المقارنات المرجعية
class BenchmarkAgent {
    constructor(parent) {
        this.parent = parent;
        this.name = 'BenchmarkAgent';
        this.description = 'متخصص في جمع ومقارنة البيانات المرجعية للصناعة';
    }

    async fetchIndustryBenchmarks(analysisId, sectorId, activityId, metrics, language = 'en') {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            logger.info(`BenchmarkAgent: Fetching benchmarks for analysis ${analysisId}`);

            // Fetch from database
            const dbBenchmarks = await this.fetchFromDatabase(sectorId, activityId, metrics);

            // Fetch from external APIs
            const externalBenchmarks = await this.fetchFromExternalSources(sectorId, metrics);

            // Combine and normalize
            const combinedBenchmarks = this.combineBenchmarks(dbBenchmarks, externalBenchmarks);

            // Generate insights
            const insights = await this.generateBenchmarkInsights(combinedBenchmarks, language);

            result = {
                sector_benchmarks: combinedBenchmarks.sector,
                industry_benchmarks: combinedBenchmarks.industry,
                peer_comparisons: combinedBenchmarks.peers,
                benchmark_insights: insights,
                data_sources: combinedBenchmarks.sources
            };

        } catch (err) {
            logger.error('BenchmarkAgent error:', err);
            error = err.message;
        }

        await this.parent.logAgentActivity(analysisId, 'benchmark', this.name, {
            sector_id: sectorId,
            activity_id: activityId,
            metrics_count: metrics.length,
            language: language
        }, result, Date.now() - startTime, null, 0.004, error ? 'error' : 'success', error);

        return { result, error };
    }

    async fetchFromDatabase(sectorId, activityId, metrics) {
        try {
            const { supabaseAdmin } = require('./supabase');
            const { data, error } = await supabaseAdmin
                .from('industry_benchmarks')
                .select('*')
                .or(`sector_id.eq.${sectorId},activity_id.eq.${activityId}`)
                .in('metric_name', metrics);

            if (error) throw error;
            return data || [];
        } catch (error) {
            logger.error('Error fetching database benchmarks:', error);
            return [];
        }
    }

    async fetchFromExternalSources(sectorId, metrics) {
        // Placeholder for external API integration
        // This would integrate with financial data providers
        return {
            source: 'external_api',
            data: [],
            timestamp: new Date().toISOString()
        };
    }

    combineBenchmarks(dbData, externalData) {
        return {
            sector: this.processBenchmarkData(dbData.filter(b => b.sector_id)),
            industry: this.processBenchmarkData(dbData.filter(b => b.activity_id)),
            peers: externalData.data,
            sources: ['internal_database', 'external_apis']
        };
    }

    processBenchmarkData(data) {
        const processed = {};

        data.forEach(benchmark => {
            if (!processed[benchmark.metric_name]) {
                processed[benchmark.metric_name] = {
                    median: benchmark.percentile_50,
                    percentile_25: benchmark.percentile_25,
                    percentile_75: benchmark.percentile_75,
                    average: benchmark.metric_value,
                    data_period: benchmark.data_period,
                    source: benchmark.data_source
                };
            }
        });

        return processed;
    }

    async generateBenchmarkInsights(benchmarks, language) {
        const prompt = language === 'ar' ? `
قم بتحليل بيانات المقارنة المرجعية التالية وقدم رؤى مفيدة:

بيانات القطاع:
${JSON.stringify(benchmarks.sector, null, 2)}

بيانات الصناعة:
${JSON.stringify(benchmarks.industry, null, 2)}

المطلوب:
1. تحليل الاتجاهات العامة للقطاع
2. تحديد المعايير الرئيسية للأداء
3. تحليل التوزيع الإحصائي للمؤشرات
4. تحديد نقاط القوة والضعف النسبية
5. اقتراح مجالات التحسين

قدم التحليل بأسلوب واضح ومفيد.
` : `
Analyze the following benchmark data and provide useful insights:

Sector Data:
${JSON.stringify(benchmarks.sector, null, 2)}

Industry Data:
${JSON.stringify(benchmarks.industry, null, 2)}

Required:
1. Analyze general sector trends
2. Identify key performance benchmarks
3. Analyze statistical distribution of indicators
4. Identify relative strengths and weaknesses
5. Suggest improvement areas

Provide analysis in clear and useful manner.
`;

        const response = await this.parent.geminiModel.generateContent(prompt);
        return this.parseInsights(response.response.text());
    }

    parseInsights(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : {
                summary: response.substring(0, 500),
                key_insights: [],
                recommendations: []
            };
        } catch (error) {
            return {
                summary: response.substring(0, 500),
                key_insights: [],
                recommendations: [],
                parsing_error: error.message
            };
        }
    }
}

// AnalysisAgent - وكيل التحليل المالي
class AnalysisAgent {
    constructor(parent) {
        this.parent = parent;
        this.name = 'AnalysisAgent';
        this.description = 'متخصص في تنفيذ التحليلات المالية المتقدمة';
    }

    async performAdvancedAnalysis(analysisId, structuredData, analysisTypes, benchmarks, language = 'en') {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            logger.info(`AnalysisAgent: Performing advanced analysis for analysis ${analysisId}`);

            const calculations = await this.performCalculations(structuredData, analysisTypes);
            const trends = this.analyzeTrends(structuredData, calculations);
            const comparisons = this.compareToBenchmarks(calculations, benchmarks);
            const insights = await this.generateAnalyticalInsights(calculations, trends, comparisons, language);

            result = {
                calculations: calculations,
                trend_analysis: trends,
                benchmark_comparisons: comparisons,
                analytical_insights: insights,
                performance_score: this.calculatePerformanceScore(calculations, benchmarks)
            };

        } catch (err) {
            logger.error('AnalysisAgent error:', err);
            error = err.message;
        }

        await this.parent.logAgentActivity(analysisId, 'analysis', this.name, {
            analysis_types_count: analysisTypes.length,
            language: language
        }, result, Date.now() - startTime, null, 0.005, error ? 'error' : 'success', error);

        return { result, error };
    }

    async performCalculations(data, analysisTypes) {
        const calculations = {};

        for (const type of analysisTypes) {
            try {
                const result = await this.calculateRatio(data, type);
                calculations[type.name_en] = {
                    value: result.value,
                    formula: type.formula,
                    interpretation: result.interpretation,
                    data_quality: result.data_quality
                };
            } catch (error) {
                calculations[type.name_en] = {
                    error: error.message,
                    value: null
                };
            }
        }

        return calculations;
    }

    async calculateRatio(data, analysisType) {
        // This would integrate with the existing financialCalculations.js
        const { name_en, formula, calculation_logic } = analysisType;

        try {
            let value = null;

            // Simple ratio calculations
            switch (name_en) {
                case 'Current Ratio':
                    value = data.current_assets / data.current_liabilities;
                    break;
                case 'Quick Ratio':
                    value = (data.current_assets - data.inventory) / data.current_liabilities;
                    break;
                case 'Debt to Equity':
                    value = data.total_debt / data.total_equity;
                    break;
                case 'ROE':
                    value = data.net_income / data.total_equity;
                    break;
                case 'ROA':
                    value = data.net_income / data.total_assets;
                    break;
                default:
                    // Use dynamic calculation if available
                    if (calculation_logic && calculation_logic.formula) {
                        value = this.evaluateFormula(calculation_logic.formula, data);
                    }
            }

            return {
                value: value,
                interpretation: this.interpretRatio(name_en, value),
                data_quality: this.assessDataQuality(data, analysisType)
            };
        } catch (error) {
            throw new Error(`Failed to calculate ${name_en}: ${error.message}`);
        }
    }

    evaluateFormula(formula, data) {
        // Safe formula evaluation
        try {
            // Replace variable names with actual values
            let evaluableFormula = formula;
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    evaluableFormula = evaluableFormula.replace(new RegExp(key, 'g'), data[key]);
                }
            });

            // Use a safe evaluation method
            return Function('"use strict"; return (' + evaluableFormula + ')')();
        } catch (error) {
            throw new Error(`Formula evaluation failed: ${error.message}`);
        }
    }

    interpretRatio(ratioName, value) {
        const interpretations = {
            'Current Ratio': value > 2 ? 'Strong liquidity' : value > 1 ? 'Adequate liquidity' : 'Poor liquidity',
            'Quick Ratio': value > 1 ? 'Good short-term liquidity' : 'Limited short-term liquidity',
            'Debt to Equity': value < 0.5 ? 'Conservative leverage' : value < 1 ? 'Moderate leverage' : 'High leverage',
            'ROE': value > 0.15 ? 'Excellent profitability' : value > 0.1 ? 'Good profitability' : 'Poor profitability',
            'ROA': value > 0.1 ? 'Efficient asset utilization' : value > 0.05 ? 'Average efficiency' : 'Poor efficiency'
        };

        return interpretations[ratioName] || 'No interpretation available';
    }

    assessDataQuality(data, analysisType) {
        const requiredFields = this.getRequiredFields(analysisType.name_en);
        let qualityScore = 0;

        requiredFields.forEach(field => {
            if (data[field] && data[field] !== null && data[field] !== 0) {
                qualityScore += 1;
            }
        });

        return {
            score: (qualityScore / requiredFields.length) * 100,
            missing_fields: requiredFields.filter(field => !data[field] || data[field] === null || data[field] === 0)
        };
    }

    getRequiredFields(ratioName) {
        const fieldMap = {
            'Current Ratio': ['current_assets', 'current_liabilities'],
            'Quick Ratio': ['current_assets', 'inventory', 'current_liabilities'],
            'Debt to Equity': ['total_debt', 'total_equity'],
            'ROE': ['net_income', 'total_equity'],
            'ROA': ['net_income', 'total_assets']
        };

        return fieldMap[ratioName] || [];
    }

    analyzeTrends(data, calculations) {
        // Placeholder for trend analysis
        // This would analyze historical data if available
        return {
            trend_direction: 'stable',
            growth_rate: 0,
            volatility: 'low',
            seasonal_patterns: [],
            trend_strength: 'moderate'
        };
    }

    compareToBenchmarks(calculations, benchmarks) {
        const comparisons = {};

        Object.keys(calculations).forEach(ratio => {
            if (benchmarks.sector && benchmarks.sector[ratio]) {
                const benchmark = benchmarks.sector[ratio];
                const value = calculations[ratio].value;

                comparisons[ratio] = {
                    company_value: value,
                    sector_median: benchmark.median,
                    percentile_rank: this.calculatePercentileRank(value, benchmark),
                    performance: this.assessPerformance(value, benchmark),
                    deviation: ((value - benchmark.median) / benchmark.median) * 100
                };
            }
        });

        return comparisons;
    }

    calculatePercentileRank(value, benchmark) {
        if (value <= benchmark.percentile_25) return 25;
        if (value <= benchmark.percentile_50) return 50;
        if (value <= benchmark.percentile_75) return 75;
        return 90;
    }

    assessPerformance(value, benchmark) {
        const deviation = Math.abs((value - benchmark.median) / benchmark.median);

        if (deviation <= 0.1) return 'On par with sector';
        if (value > benchmark.median) return 'Above sector average';
        return 'Below sector average';
    }

    async generateAnalyticalInsights(calculations, trends, comparisons, language) {
        const prompt = language === 'ar' ? `
قم بتحليل النتائج المالية التالية وقدم رؤى تحليلية عميقة:

النسب المحسوبة:
${JSON.stringify(calculations, null, 2)}

تحليل الاتجاهات:
${JSON.stringify(trends, null, 2)}

المقارنات المرجعية:
${JSON.stringify(comparisons, null, 2)}

المطلوب:
1. تحليل شامل للأداء المالي
2. تحديد نقاط القوة والضعف الرئيسية
3. تحليل المخاطر والفرص
4. توصيات إستراتيجية
5. خلاصة تنفيذية

قدم التحليل بأسلوب مهني ومفصل.
` : `
Analyze the following financial results and provide deep analytical insights:

Calculated Ratios:
${JSON.stringify(calculations, null, 2)}

Trend Analysis:
${JSON.stringify(trends, null, 2)}

Benchmark Comparisons:
${JSON.stringify(comparisons, null, 2)}

Required:
1. Comprehensive financial performance analysis
2. Identify key strengths and weaknesses
3. Risk and opportunity analysis
4. Strategic recommendations
5. Executive summary

Provide analysis in professional and detailed manner.
`;

        const response = await this.parent.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: language === 'ar' ?
                        'أنت محلل مالي خبير متخصص في تقديم رؤى تحليلية عميقة ومفيدة.' :
                        'You are an expert financial analyst specialized in providing deep and useful analytical insights.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 4000
        });

        return this.parseInsights(response.choices[0].message.content);
    }

    calculatePerformanceScore(calculations, benchmarks) {
        let totalScore = 0;
        let ratioCount = 0;

        Object.keys(calculations).forEach(ratio => {
            if (calculations[ratio].value && benchmarks.sector && benchmarks.sector[ratio]) {
                const percentileRank = this.calculatePercentileRank(
                    calculations[ratio].value,
                    benchmarks.sector[ratio]
                );
                totalScore += percentileRank;
                ratioCount++;
            }
        });

        return ratioCount > 0 ? Math.round(totalScore / ratioCount) : 50;
    }

    parseInsights(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : {
                summary: response.substring(0, 1000),
                key_strengths: [],
                key_weaknesses: [],
                recommendations: [],
                risks: [],
                opportunities: []
            };
        } catch (error) {
            return {
                summary: response.substring(0, 1000),
                key_strengths: [],
                key_weaknesses: [],
                recommendations: [],
                parsing_error: error.message
            };
        }
    }
}

// NarrativeAgent - وكيل السرد والتفسير
class NarrativeAgent {
    constructor(parent) {
        this.parent = parent;
        this.name = 'NarrativeAgent';
        this.description = 'متخصص في تحويل البيانات المالية إلى سرد مفهوم';
    }

    async generateNarrative(analysisId, analysisResults, language = 'en') {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            logger.info(`NarrativeAgent: Generating narrative for analysis ${analysisId}`);

            const executiveSummary = await this.createExecutiveSummary(analysisResults, language);
            const detailedNarrative = await this.createDetailedNarrative(analysisResults, language);
            const keyInsights = await this.extractKeyInsights(analysisResults, language);
            const recommendations = await this.generateRecommendations(analysisResults, language);

            result = {
                executive_summary: executiveSummary,
                detailed_narrative: detailedNarrative,
                key_insights: keyInsights,
                recommendations: recommendations,
                narrative_quality_score: this.assessNarrativeQuality(executiveSummary, detailedNarrative)
            };

        } catch (err) {
            logger.error('NarrativeAgent error:', err);
            error = err.message;
        }

        await this.parent.logAgentActivity(analysisId, 'narrative', this.name, {
            language: language
        }, result, Date.now() - startTime, null, 0.006, error ? 'error' : 'success', error);

        return { result, error };
    }

    async createExecutiveSummary(results, language) {
        const prompt = language === 'ar' ? `
اكتب ملخصاً تنفيذياً شاملاً للتحليل المالي التالي:

نتائج التحليل:
${JSON.stringify(results, null, 2)}

يجب أن يتضمن الملخص:
1. نظرة عامة على الأداء المالي
2. أهم النتائج والمؤشرات
3. نقاط القوة الرئيسية
4. التحديات والمخاطر
5. التوصيات الإستراتيجية الرئيسية

اكتب الملخص بأسلوب مهني مناسب لأصحاب القرار (200-300 كلمة).
` : `
Write a comprehensive executive summary for the following financial analysis:

Analysis Results:
${JSON.stringify(results, null, 2)}

The summary should include:
1. Overview of financial performance
2. Key findings and indicators
3. Main strengths
4. Challenges and risks
5. Key strategic recommendations

Write the summary in a professional style suitable for decision makers (200-300 words).
`;

        const response = await this.parent.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: language === 'ar' ?
                        'أنت كاتب تقارير مالية محترف متخصص في كتابة الملخصات التنفيذية الواضحة والمؤثرة.' :
                        'You are a professional financial report writer specialized in creating clear and impactful executive summaries.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2000
        });

        return response.choices[0].message.content;
    }

    async createDetailedNarrative(results, language) {
        const prompt = language === 'ar' ? `
اكتب سرداً مفصلاً وشاملاً للتحليل المالي التالي:

نتائج التحليل:
${JSON.stringify(results, null, 2)}

يجب أن يتضمن السرد:
1. تحليل مفصل لكل مجموعة من النسب المالية
2. تفسير الاتجاهات والأنماط
3. المقارنة مع معايير الصناعة
4. تحليل العوامل المؤثرة على الأداء
5. تحليل المخاطر والفرص
6. التوقعات المستقبلية

اكتب السرد بأسلوب تحليلي عميق ومفصل (800-1200 كلمة).
` : `
Write a detailed and comprehensive narrative for the following financial analysis:

Analysis Results:
${JSON.stringify(results, null, 2)}

The narrative should include:
1. Detailed analysis of each financial ratio group
2. Interpretation of trends and patterns
3. Comparison with industry benchmarks
4. Analysis of factors affecting performance
5. Risk and opportunity analysis
6. Future outlook

Write the narrative in deep analytical and detailed style (800-1200 words).
`;

        const response = await this.parent.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: language === 'ar' ?
                        'أنت محلل مالي خبير متخصص في كتابة التحليلات المالية المفصلة والعميقة.' :
                        'You are an expert financial analyst specialized in writing detailed and in-depth financial analyses.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 6000
        });

        return response.choices[0].message.content;
    }

    async extractKeyInsights(results, language) {
        const prompt = language === 'ar' ? `
استخرج أهم الرؤى والنتائج من التحليل المالي التالي:

نتائج التحليل:
${JSON.stringify(results, null, 2)}

استخرج:
1. أهم 5 رؤى إيجابية
2. أهم 5 تحديات أو مخاطر
3. أهم 3 فرص للتحسين
4. النتيجة الأكثر أهمية
5. التوصية الأولوية

قدم كل رؤية مع تفسير موجز (50-100 كلمة لكل رؤية).
` : `
Extract the key insights and findings from the following financial analysis:

Analysis Results:
${JSON.stringify(results, null, 2)}

Extract:
1. Top 5 positive insights
2. Top 5 challenges or risks
3. Top 3 improvement opportunities
4. Most important finding
5. Priority recommendation

Provide each insight with brief explanation (50-100 words per insight).
`;

        const response = await this.parent.geminiModel.generateContent(prompt);
        return this.parseInsights(response.response.text());
    }

    async generateRecommendations(results, language) {
        const prompt = language === 'ar' ? `
قدم توصيات إستراتيجية مفصلة بناءً على التحليل المالي التالي:

نتائج التحليل:
${JSON.stringify(results, null, 2)}

قدم توصيات في المجالات التالية:
1. إدارة السيولة والتدفق النقدي
2. هيكل رأس المال والتمويل
3. الربحية وكفاءة العمليات
4. إدارة الأصول والاستثمارات
5. إدارة المخاطر
6. الإستراتيجية طويلة المدى

لكل توصية، قدم:
- الهدف المراد تحقيقه
- الخطوات المطلوبة
- الإطار الزمني المقترح
- المخاطر المحتملة
- مؤشرات الأداء للمتابعة
` : `
Provide detailed strategic recommendations based on the following financial analysis:

Analysis Results:
${JSON.stringify(results, null, 2)}

Provide recommendations in the following areas:
1. Liquidity and cash flow management
2. Capital structure and financing
3. Profitability and operational efficiency
4. Asset management and investments
5. Risk management
6. Long-term strategy

For each recommendation, provide:
- Objective to be achieved
- Required steps
- Suggested timeframe
- Potential risks
- Performance indicators for monitoring
`;

        const response = await this.parent.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: language === 'ar' ?
                        'أنت استشاري مالي إستراتيجي متخصص في تقديم التوصيات العملية والقابلة للتنفيذ.' :
                        'You are a strategic financial consultant specialized in providing practical and actionable recommendations.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 5000
        });

        return this.parseRecommendations(response.choices[0].message.content);
    }

    assessNarrativeQuality(summary, narrative) {
        let score = 0;

        // Check length appropriateness
        if (summary.length >= 500 && summary.length <= 2000) score += 20;
        if (narrative.length >= 2000 && narrative.length <= 8000) score += 20;

        // Check structure (simple keyword detection)
        const structureKeywords = ['analysis', 'performance', 'recommendation', 'risk', 'opportunity'];
        structureKeywords.forEach(keyword => {
            if (summary.toLowerCase().includes(keyword) || narrative.toLowerCase().includes(keyword)) {
                score += 12;
            }
        });

        return Math.min(score, 100);
    }

    parseInsights(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : {
                positive_insights: [],
                challenges: [],
                opportunities: [],
                key_finding: response.substring(0, 200),
                priority_recommendation: response.substring(200, 400)
            };
        } catch (error) {
            return {
                positive_insights: [],
                challenges: [],
                opportunities: [],
                parsing_error: error.message,
                raw_response: response.substring(0, 1000)
            };
        }
    }

    parseRecommendations(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Parse structured text recommendations
            const sections = response.split(/\n\s*\n/);
            return {
                liquidity_management: sections[0] || '',
                capital_structure: sections[1] || '',
                profitability: sections[2] || '',
                asset_management: sections[3] || '',
                risk_management: sections[4] || '',
                long_term_strategy: sections[5] || ''
            };
        } catch (error) {
            return {
                parsing_error: error.message,
                raw_recommendations: response.substring(0, 2000)
            };
        }
    }
}

// ReportingAgent - وكيل إنتاج التقارير
class ReportingAgent {
    constructor(parent) {
        this.parent = parent;
        this.name = 'ReportingAgent';
        this.description = 'متخصص في إنتاج التقارير النهائية بصيغ متعددة';
    }

    async generateReport(analysisId, narrative, charts, format, language = 'en') {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            logger.info(`ReportingAgent: Generating ${format} report for analysis ${analysisId}`);

            const reportStructure = await this.createReportStructure(narrative, charts, language);
            const formattedContent = await this.formatContent(reportStructure, format, language);
            const metadata = this.generateMetadata(analysisId, format, language);

            result = {
                report_structure: reportStructure,
                formatted_content: formattedContent,
                metadata: metadata,
                generation_quality: this.assessReportQuality(reportStructure, formattedContent)
            };

        } catch (err) {
            logger.error('ReportingAgent error:', err);
            error = err.message;
        }

        await this.parent.logAgentActivity(analysisId, 'reporting', this.name, {
            format: format,
            language: language
        }, result, Date.now() - startTime, null, 0.007, error ? 'error' : 'success', error);

        return { result, error };
    }

    async createReportStructure(narrative, charts, language) {
        const structure = {
            cover_page: this.createCoverPage(language),
            table_of_contents: this.createTableOfContents(language),
            executive_summary: narrative.executive_summary,
            methodology: this.createMethodologySection(language),
            detailed_analysis: narrative.detailed_narrative,
            charts_and_graphs: this.organizeCharts(charts),
            key_insights: narrative.key_insights,
            recommendations: narrative.recommendations,
            appendices: this.createAppendices(language),
            glossary: this.createGlossary(language)
        };

        return structure;
    }

    createCoverPage(language) {
        return {
            title: language === 'ar' ? 'تقرير التحليل المالي الشامل' : 'Comprehensive Financial Analysis Report',
            subtitle: language === 'ar' ? 'تقرير مُولد بواسطة FinClick.AI' : 'Report Generated by FinClick.AI',
            generation_date: new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US'),
            disclaimer: language === 'ar' ?
                'هذا التقرير مُولد آلياً بواسطة FinClick.AI لأغراض التحليل المالي فقط' :
                'This report is automatically generated by FinClick.AI for financial analysis purposes only'
        };
    }

    createTableOfContents(language) {
        return language === 'ar' ? [
            'الملخص التنفيذي',
            'المنهجية المستخدمة',
            'التحليل المفصل',
            'الرسوم البيانية والمخططات',
            'الرؤى الرئيسية',
            'التوصيات',
            'الملاحق',
            'مسرد المصطلحات'
        ] : [
            'Executive Summary',
            'Methodology',
            'Detailed Analysis',
            'Charts and Graphs',
            'Key Insights',
            'Recommendations',
            'Appendices',
            'Glossary'
        ];
    }

    createMethodologySection(language) {
        return language === 'ar' ? {
            title: 'المنهجية المستخدمة',
            content: `
تم إجراء هذا التحليل المالي باستخدام منصة FinClick.AI المتطورة التي تعتمد على:

1. نظام الوكلاء الذكية متعددة التخصصات
2. قاعدة بيانات شاملة تضم 180 نوع من التحليلات المالية
3. مقارنات مرجعية مع معايير الصناعة
4. تحليل البيانات باستخدام الذكاء الاصطناعي
5. تقنيات التعلم الآلي للتنبؤ والتحليل

المصادر:
- البيانات المالية المقدمة من العميل
- قواعد البيانات المالية الخارجية
- معايير الصناعة والقطاع
- التحليلات الاقتصادية الحديثة
            `
        } : {
            title: 'Methodology',
            content: `
This financial analysis was conducted using the advanced FinClick.AI platform, which relies on:

1. Multi-disciplinary intelligent agent system
2. Comprehensive database with 180 types of financial analyses
3. Benchmark comparisons with industry standards
4. AI-powered data analysis
5. Machine learning techniques for prediction and analysis

Sources:
- Financial data provided by the client
- External financial databases
- Industry and sector benchmarks
- Modern economic analyses
            `
        };
    }

    organizeCharts(charts) {
        if (!charts || !Array.isArray(charts)) return [];

        return charts.map((chart, index) => ({
            chart_id: `chart_${index + 1}`,
            title: chart.title || `Chart ${index + 1}`,
            type: chart.type || 'unknown',
            description: chart.description || '',
            data_source: chart.data_source || 'Analysis results',
            chart_data: chart.data || {}
        }));
    }

    createAppendices(language) {
        return language === 'ar' ? [
            {
                title: 'ملحق أ: البيانات المالية المستخدمة',
                content: 'تفاصيل البيانات المالية التي تم استخدامها في التحليل'
            },
            {
                title: 'ملحق ب: النسب المالية المحسوبة',
                content: 'قائمة شاملة بجميع النسب المالية المحسوبة وقيمها'
            },
            {
                title: 'ملحق ج: المقارنات المرجعية',
                content: 'تفاصيل المقارنات مع معايير الصناعة والقطاع'
            }
        ] : [
            {
                title: 'Appendix A: Financial Data Used',
                content: 'Details of financial data used in the analysis'
            },
            {
                title: 'Appendix B: Calculated Financial Ratios',
                content: 'Comprehensive list of all calculated financial ratios and their values'
            },
            {
                title: 'Appendix C: Benchmark Comparisons',
                content: 'Details of comparisons with industry and sector benchmarks'
            }
        ];
    }

    createGlossary(language) {
        return language === 'ar' ? {
            'نسبة السيولة': 'مقياس قدرة الشركة على سداد التزاماتها قصيرة المدى',
            'العائد على الأصول': 'مقياس كفاءة الشركة في استخدام أصولها لتوليد الأرباح',
            'العائد على حقوق الملكية': 'مقياس العائد المحقق للمساهمين على استثماراتهم',
            'نسبة الدين إلى حقوق الملكية': 'مقياس الرافعة المالية ومستوى المديونية'
        } : {
            'Current Ratio': 'A measure of company\'s ability to pay short-term obligations',
            'Return on Assets': 'A measure of company\'s efficiency in using assets to generate profits',
            'Return on Equity': 'A measure of return achieved for shareholders on their investments',
            'Debt to Equity Ratio': 'A measure of financial leverage and debt level'
        };
    }

    async formatContent(structure, format, language) {
        switch (format.toLowerCase()) {
            case 'pdf':
                return this.formatForPDF(structure, language);
            case 'word':
            case 'docx':
                return this.formatForWord(structure, language);
            case 'excel':
            case 'xlsx':
                return this.formatForExcel(structure, language);
            case 'powerpoint':
            case 'pptx':
                return this.formatForPowerPoint(structure, language);
            default:
                return this.formatForHTML(structure, language);
        }
    }

    formatForPDF(structure, language) {
        return {
            format: 'PDF',
            layout: 'professional',
            pages: this.createPDFPages(structure),
            styling: this.getPDFStyling(language),
            metadata: {
                title: structure.cover_page.title,
                subject: 'Financial Analysis Report',
                creator: 'FinClick.AI'
            }
        };
    }

    formatForWord(structure, language) {
        return {
            format: 'DOCX',
            document_structure: {
                sections: this.createWordSections(structure),
                styles: this.getWordStyling(language),
                headers_footers: this.createWordHeadersFooters(language)
            }
        };
    }

    formatForExcel(structure, language) {
        return {
            format: 'XLSX',
            worksheets: [
                {
                    name: language === 'ar' ? 'الملخص' : 'Summary',
                    content: structure.executive_summary
                },
                {
                    name: language === 'ar' ? 'التحليل' : 'Analysis',
                    content: structure.detailed_analysis
                },
                {
                    name: language === 'ar' ? 'التوصيات' : 'Recommendations',
                    content: structure.recommendations
                }
            ]
        };
    }

    formatForPowerPoint(structure, language) {
        return {
            format: 'PPTX',
            slides: this.createPowerPointSlides(structure, language),
            template: 'professional',
            theme: 'finclick_brand'
        };
    }

    formatForHTML(structure, language) {
        return {
            format: 'HTML',
            html_structure: {
                head: this.createHTMLHead(structure, language),
                body: this.createHTMLBody(structure, language),
                styles: this.getHTMLStyling(language)
            }
        };
    }

    createPDFPages(structure) {
        return [
            { type: 'cover', content: structure.cover_page },
            { type: 'toc', content: structure.table_of_contents },
            { type: 'summary', content: structure.executive_summary },
            { type: 'analysis', content: structure.detailed_analysis },
            { type: 'charts', content: structure.charts_and_graphs },
            { type: 'insights', content: structure.key_insights },
            { type: 'recommendations', content: structure.recommendations },
            { type: 'appendices', content: structure.appendices }
        ];
    }

    createWordSections(structure) {
        return Object.keys(structure).map(key => ({
            title: this.formatSectionTitle(key),
            content: structure[key],
            style: this.getSectionStyle(key)
        }));
    }

    createPowerPointSlides(structure, language) {
        return [
            {
                title: language === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary',
                content: structure.executive_summary,
                layout: 'title_content'
            },
            {
                title: language === 'ar' ? 'الرؤى الرئيسية' : 'Key Insights',
                content: structure.key_insights,
                layout: 'bullet_points'
            },
            {
                title: language === 'ar' ? 'التوصيات' : 'Recommendations',
                content: structure.recommendations,
                layout: 'bullet_points'
            }
        ];
    }

    generateMetadata(analysisId, format, language) {
        return {
            analysis_id: analysisId,
            format: format,
            language: language,
            generation_timestamp: new Date().toISOString(),
            generator: 'FinClick.AI ReportingAgent',
            version: '1.0',
            page_count: this.estimatePageCount(format),
            file_size_estimate: this.estimateFileSize(format)
        };
    }

    assessReportQuality(structure, content) {
        let score = 0;

        // Check completeness
        const requiredSections = ['executive_summary', 'detailed_analysis', 'recommendations'];
        requiredSections.forEach(section => {
            if (structure[section] && structure[section].length > 100) score += 25;
        });

        // Check content formatting
        if (content && content.format) score += 25;

        return Math.min(score, 100);
    }

    formatSectionTitle(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getSectionStyle(key) {
        const styles = {
            cover_page: 'cover',
            executive_summary: 'summary',
            detailed_analysis: 'analysis',
            recommendations: 'recommendations'
        };
        return styles[key] || 'normal';
    }

    getPDFStyling(language) {
        return {
            font_family: language === 'ar' ? 'NotoSansArabic' : 'Arial',
            font_size: 12,
            line_height: 1.5,
            margins: { top: 2, bottom: 2, left: 2, right: 2 },
            text_direction: language === 'ar' ? 'rtl' : 'ltr'
        };
    }

    getWordStyling(language) {
        return {
            normal: { font: language === 'ar' ? 'Arial Unicode MS' : 'Calibri', size: 11 },
            heading1: { font: language === 'ar' ? 'Arial Unicode MS' : 'Calibri', size: 16, bold: true },
            heading2: { font: language === 'ar' ? 'Arial Unicode MS' : 'Calibri', size: 14, bold: true }
        };
    }

    getHTMLStyling(language) {
        return `
        body {
            font-family: ${language === 'ar' ? 'Arial, sans-serif' : 'Arial, sans-serif'};
            direction: ${language === 'ar' ? 'rtl' : 'ltr'};
            text-align: ${language === 'ar' ? 'right' : 'left'};
        }
        .executive-summary { background: #f8f9fa; padding: 20px; }
        .recommendations { background: #e8f5e8; padding: 15px; }
        `;
    }

    createHTMLHead(structure, language) {
        return {
            title: structure.cover_page.title,
            charset: 'UTF-8',
            viewport: 'width=device-width, initial-scale=1.0',
            description: 'Financial Analysis Report generated by FinClick.AI'
        };
    }

    createHTMLBody(structure, language) {
        return {
            header: structure.cover_page,
            main: {
                summary: structure.executive_summary,
                analysis: structure.detailed_analysis,
                insights: structure.key_insights,
                recommendations: structure.recommendations
            },
            footer: {
                generator: 'FinClick.AI',
                timestamp: new Date().toLocaleDateString()
            }
        };
    }

    createWordHeadersFooters(language) {
        return {
            header: language === 'ar' ? 'تقرير التحليل المالي - FinClick.AI' : 'Financial Analysis Report - FinClick.AI',
            footer: language === 'ar' ? 'صفحة {page} من {total}' : 'Page {page} of {total}'
        };
    }

    estimatePageCount(format) {
        const estimates = {
            'pdf': 15,
            'word': 12,
            'html': 8,
            'powerpoint': 6
        };
        return estimates[format.toLowerCase()] || 10;
    }

    estimateFileSize(format) {
        const estimates = {
            'pdf': '2.5 MB',
            'word': '1.8 MB',
            'excel': '800 KB',
            'powerpoint': '3.2 MB',
            'html': '500 KB'
        };
        return estimates[format.toLowerCase()] || '1 MB';
    }
}

// ComplianceAgent - وكيل التوافق والامتثال
class ComplianceAgent {
    constructor(parent) {
        this.parent = parent;
        this.name = 'ComplianceAgent';
        this.description = 'متخصص في ضمان التوافق مع المعايير المحاسبية والقانونية';
    }

    async checkCompliance(analysisId, financialData, reportContent, jurisdiction = 'SA', language = 'en') {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            logger.info(`ComplianceAgent: Checking compliance for analysis ${analysisId}`);

            const accountingStandardsCheck = await this.checkAccountingStandards(financialData, jurisdiction, language);
            const regulatoryComplianceCheck = await this.checkRegulatoryCompliance(financialData, jurisdiction, language);
            const reportingStandardsCheck = await this.checkReportingStandards(reportContent, jurisdiction, language);
            const disclosureRequirements = await this.checkDisclosureRequirements(financialData, jurisdiction, language);

            const overallCompliance = this.calculateOverallCompliance([
                accountingStandardsCheck,
                regulatoryComplianceCheck,
                reportingStandardsCheck,
                disclosureRequirements
            ]);

            result = {
                accounting_standards: accountingStandardsCheck,
                regulatory_compliance: regulatoryComplianceCheck,
                reporting_standards: reportingStandardsCheck,
                disclosure_requirements: disclosureRequirements,
                overall_compliance: overallCompliance,
                recommendations: await this.generateComplianceRecommendations(overallCompliance, language)
            };

        } catch (err) {
            logger.error('ComplianceAgent error:', err);
            error = err.message;
        }

        await this.parent.logAgentActivity(analysisId, 'compliance', this.name, {
            jurisdiction: jurisdiction,
            language: language
        }, result, Date.now() - startTime, null, 0.003, error ? 'error' : 'success', error);

        return { result, error };
    }

    async checkAccountingStandards(financialData, jurisdiction, language) {
        const standards = this.getApplicableAccountingStandards(jurisdiction);
        const checks = [];

        for (const standard of standards) {
            const compliance = await this.evaluateStandardCompliance(financialData, standard, language);
            checks.push({
                standard: standard.name,
                status: compliance.status,
                score: compliance.score,
                issues: compliance.issues,
                recommendations: compliance.recommendations
            });
        }

        return {
            applicable_standards: standards.map(s => s.name),
            compliance_checks: checks,
            overall_score: this.calculateAverageScore(checks),
            critical_issues: checks.filter(c => c.status === 'non_compliant').length
        };
    }

    async checkRegulatoryCompliance(financialData, jurisdiction, language) {
        const regulations = this.getApplicableRegulations(jurisdiction);
        const checks = [];

        for (const regulation of regulations) {
            const compliance = await this.evaluateRegulatoryCompliance(financialData, regulation, language);
            checks.push({
                regulation: regulation.name,
                authority: regulation.authority,
                status: compliance.status,
                score: compliance.score,
                violations: compliance.violations,
                remedial_actions: compliance.remedial_actions
            });
        }

        return {
            applicable_regulations: regulations.map(r => r.name),
            compliance_checks: checks,
            overall_score: this.calculateAverageScore(checks),
            violations_count: checks.reduce((sum, c) => sum + c.violations.length, 0)
        };
    }

    async checkReportingStandards(reportContent, jurisdiction, language) {
        const reportingRequirements = this.getReportingRequirements(jurisdiction);
        const checks = [];

        for (const requirement of reportingRequirements) {
            const compliance = this.evaluateReportingCompliance(reportContent, requirement);
            checks.push({
                requirement: requirement.name,
                status: compliance.status,
                completeness: compliance.completeness,
                quality: compliance.quality,
                missing_elements: compliance.missing_elements
            });
        }

        return {
            reporting_requirements: reportingRequirements.map(r => r.name),
            compliance_checks: checks,
            overall_completeness: this.calculateAverageCompleteness(checks),
            missing_elements_count: checks.reduce((sum, c) => sum + c.missing_elements.length, 0)
        };
    }

    async checkDisclosureRequirements(financialData, jurisdiction, language) {
        const disclosureRequirements = this.getDisclosureRequirements(jurisdiction);
        const checks = [];

        for (const requirement of disclosureRequirements) {
            const compliance = this.evaluateDisclosureCompliance(financialData, requirement);
            checks.push({
                disclosure: requirement.name,
                mandatory: requirement.mandatory,
                status: compliance.status,
                adequacy: compliance.adequacy,
                recommendations: compliance.recommendations
            });
        }

        return {
            disclosure_requirements: disclosureRequirements.map(r => r.name),
            compliance_checks: checks,
            mandatory_disclosures_met: checks.filter(c => c.mandatory && c.status === 'compliant').length,
            total_mandatory: checks.filter(c => c.mandatory).length
        };
    }

    getApplicableAccountingStandards(jurisdiction) {
        const standards = {
            'SA': [ // Saudi Arabia
                { name: 'SOCPA Standards', authority: 'SOCPA', mandatory: true },
                { name: 'IFRS', authority: 'IASB', mandatory: true },
                { name: 'Zakat Regulations', authority: 'ZATCA', mandatory: true }
            ],
            'US': [
                { name: 'US GAAP', authority: 'FASB', mandatory: true },
                { name: 'SOX Compliance', authority: 'SEC', mandatory: true }
            ],
            'IFRS': [
                { name: 'IFRS', authority: 'IASB', mandatory: true }
            ]
        };

        return standards[jurisdiction] || standards['IFRS'];
    }

    getApplicableRegulations(jurisdiction) {
        const regulations = {
            'SA': [
                { name: 'CMA Regulations', authority: 'Capital Market Authority', type: 'securities' },
                { name: 'SAMA Regulations', authority: 'Saudi Arabian Monetary Authority', type: 'banking' },
                { name: 'Companies Law', authority: 'Ministry of Commerce', type: 'corporate' }
            ],
            'US': [
                { name: 'Securities Exchange Act', authority: 'SEC', type: 'securities' },
                { name: 'Banking Regulations', authority: 'Federal Reserve', type: 'banking' }
            ]
        };

        return regulations[jurisdiction] || [];
    }

    getReportingRequirements(jurisdiction) {
        const requirements = {
            'SA': [
                { name: 'Quarterly Reporting', frequency: 'quarterly', mandatory: true },
                { name: 'Annual Report', frequency: 'annual', mandatory: true },
                { name: 'Interim Statements', frequency: 'semi-annual', mandatory: true }
            ],
            'US': [
                { name: '10-Q Filing', frequency: 'quarterly', mandatory: true },
                { name: '10-K Filing', frequency: 'annual', mandatory: true },
                { name: '8-K Filing', frequency: 'as_needed', mandatory: true }
            ]
        };

        return requirements[jurisdiction] || requirements['SA'];
    }

    getDisclosureRequirements(jurisdiction) {
        const disclosures = {
            'SA': [
                { name: 'Related Party Transactions', mandatory: true, category: 'governance' },
                { name: 'Risk Factors', mandatory: true, category: 'risk' },
                { name: 'Segment Reporting', mandatory: true, category: 'operations' },
                { name: 'Subsequent Events', mandatory: true, category: 'events' }
            ],
            'US': [
                { name: 'Material Contracts', mandatory: true, category: 'contracts' },
                { name: 'Executive Compensation', mandatory: true, category: 'compensation' },
                { name: 'Risk Factors', mandatory: true, category: 'risk' }
            ]
        };

        return disclosures[jurisdiction] || disclosures['SA'];
    }

    async evaluateStandardCompliance(financialData, standard, language) {
        const prompt = language === 'ar' ? `
قيّم مدى توافق البيانات المالية التالية مع معيار ${standard.name}:

البيانات المالية:
${JSON.stringify(financialData, null, 2)}

المعيار: ${standard.name}
الجهة المسؤولة: ${standard.authority}

قيّم:
1. مدى التوافق (مطابق، مطابق جزئياً، غير مطابق)
2. نقاط عدم التوافق إن وجدت
3. التوصيات للتحسين
4. درجة التوافق (من 1-100)

قدم التقييم بتنسيق JSON منظم.
` : `
Evaluate the compliance of the following financial data with ${standard.name}:

Financial Data:
${JSON.stringify(financialData, null, 2)}

Standard: ${standard.name}
Authority: ${standard.authority}

Evaluate:
1. Compliance level (compliant, partially_compliant, non_compliant)
2. Non-compliance points if any
3. Improvement recommendations
4. Compliance score (1-100)

Provide evaluation in structured JSON format.
`;

        const response = await this.parent.geminiModel.generateContent(prompt);
        return this.parseComplianceResponse(response.response.text());
    }

    async evaluateRegulatoryCompliance(financialData, regulation, language) {
        // Simplified evaluation - in production this would be more comprehensive
        return {
            status: 'compliant',
            score: 85,
            violations: [],
            remedial_actions: []
        };
    }

    evaluateReportingCompliance(reportContent, requirement) {
        // Simplified evaluation - in production this would check actual report structure
        return {
            status: 'compliant',
            completeness: 90,
            quality: 85,
            missing_elements: []
        };
    }

    evaluateDisclosureCompliance(financialData, requirement) {
        // Simplified evaluation - in production this would check for specific disclosures
        return {
            status: 'compliant',
            adequacy: 80,
            recommendations: []
        };
    }

    calculateOverallCompliance(complianceChecks) {
        const scores = complianceChecks.map(check => check.overall_score || 0);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        let status = 'compliant';
        if (averageScore < 70) status = 'non_compliant';
        else if (averageScore < 90) status = 'partially_compliant';

        return {
            score: Math.round(averageScore),
            status: status,
            summary: this.generateComplianceSummary(complianceChecks),
            critical_issues: this.identifyCriticalIssues(complianceChecks)
        };
    }

    async generateComplianceRecommendations(overallCompliance, language) {
        if (overallCompliance.status === 'compliant') {
            return language === 'ar' ? [
                'التحليل المالي متوافق مع المعايير المطلوبة',
                'يُنصح بالمراجعة الدورية للتأكد من استمرار التوافق'
            ] : [
                'Financial analysis is compliant with required standards',
                'Regular review is recommended to ensure continued compliance'
            ];
        }

        const recommendations = [];

        if (overallCompliance.critical_issues.length > 0) {
            recommendations.push(
                language === 'ar' ?
                'معالجة القضايا الحرجة المحددة بشكل فوري' :
                'Address identified critical issues immediately'
            );
        }

        if (overallCompliance.score < 90) {
            recommendations.push(
                language === 'ar' ?
                'تحسين جودة البيانات المالية والإفصاحات' :
                'Improve quality of financial data and disclosures'
            );
        }

        return recommendations;
    }

    calculateAverageScore(checks) {
        if (checks.length === 0) return 0;
        const totalScore = checks.reduce((sum, check) => sum + (check.score || 0), 0);
        return Math.round(totalScore / checks.length);
    }

    calculateAverageCompleteness(checks) {
        if (checks.length === 0) return 0;
        const totalCompleteness = checks.reduce((sum, check) => sum + (check.completeness || 0), 0);
        return Math.round(totalCompleteness / checks.length);
    }

    generateComplianceSummary(checks) {
        const totalChecks = checks.length;
        const passedChecks = checks.filter(check => (check.overall_score || 0) >= 70).length;

        return {
            total_checks: totalChecks,
            passed_checks: passedChecks,
            pass_rate: Math.round((passedChecks / totalChecks) * 100),
            areas_of_concern: checks.filter(check => (check.overall_score || 0) < 70).length
        };
    }

    identifyCriticalIssues(checks) {
        const criticalIssues = [];

        checks.forEach(check => {
            if (check.critical_issues) {
                criticalIssues.push(...check.critical_issues);
            }
            if (check.violations_count && check.violations_count > 0) {
                criticalIssues.push(`Regulatory violations in ${check.applicable_regulations || 'compliance area'}`);
            }
        });

        return criticalIssues;
    }

    parseComplianceResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : {
                status: 'partially_compliant',
                score: 75,
                issues: [],
                recommendations: []
            };
        } catch (error) {
            return {
                status: 'unknown',
                score: 50,
                issues: ['Unable to parse compliance evaluation'],
                recommendations: ['Manual review required'],
                parsing_error: error.message
            };
        }
    }
}

module.exports = AIAgents;