const winston = require('winston');
const { supabaseAdmin } = require('./supabase');
const FinancialCalculations = require('./financialCalculations');
const AIAgents = require('./aiAgents');
const DocumentProcessor = require('./documentProcessor');
const ExternalDataService = require('./externalDataService');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './logs/analysis-engine.log' })
    ]
});

class AnalysisEngine {
    constructor() {
        this.calculator = new FinancialCalculations();
        this.aiAgents = new AIAgents();
        this.documentProcessor = new DocumentProcessor();
        this.externalDataService = new ExternalDataService();
        this.currentAnalysis = null;
    }

    // Main analysis orchestrator
    async runFullAnalysis(analysisId, userId, language = 'en') {
        try {
            logger.info(`Starting full analysis for analysis ID: ${analysisId}`);

            // Update analysis status
            await this.updateAnalysisStatus(analysisId, 'processing', { started_at: new Date() });

            // Step 1: Load analysis configuration
            const analysisConfig = await this.loadAnalysisConfiguration(analysisId);
            if (!analysisConfig) {
                throw new Error('Analysis configuration not found');
            }

            this.currentAnalysis = analysisConfig;
            const results = {
                analysis_id: analysisId,
                user_id: userId,
                steps_completed: [],
                errors: [],
                processing_time: { start: Date.now() },
                costs: { total: 0, breakdown: {} }
            };

            // Step 2: Process uploaded document
            logger.info(`Processing document for analysis ${analysisId}`);
            const documentResult = await this.processDocument(analysisConfig.document);
            results.document_processing = documentResult;
            results.steps_completed.push('document_processing');
            if (documentResult.error) results.errors.push(`Document Processing: ${documentResult.error}`);

            // Step 3: Extract and validate financial data
            logger.info(`Extracting financial data for analysis ${analysisId}`);
            const financialData = await this.extractFinancialData(analysisConfig.document, documentResult.extracted_data);
            results.financial_data = financialData;
            results.steps_completed.push('financial_extraction');

            // Step 4: Fetch external data
            logger.info(`Fetching external data for analysis ${analysisId}`);
            const externalData = await this.fetchExternalData(analysisConfig);
            results.external_data = externalData;
            results.steps_completed.push('external_data');

            // Step 5: Run financial calculations
            logger.info(`Running financial calculations for analysis ${analysisId}`);
            const calculationResults = await this.runFinancialCalculations(
                financialData,
                analysisConfig.selected_analysis_types
            );
            results.calculations = calculationResults;
            results.steps_completed.push('calculations');

            // Step 6: AI Analysis and Insights
            logger.info(`Running AI analysis for analysis ${analysisId}`);
            const aiResults = await this.runAIAnalysis(
                analysisId,
                analysisConfig,
                financialData,
                calculationResults,
                externalData,
                language
            );
            results.ai_analysis = aiResults;
            results.steps_completed.push('ai_analysis');

            // Step 7: Generate charts and visualizations
            logger.info(`Generating charts for analysis ${analysisId}`);
            const chartsData = await this.generateChartsData(calculationResults, externalData);
            results.charts = chartsData;
            results.steps_completed.push('charts_generation');

            // Step 8: Industry benchmarking
            logger.info(`Running benchmarking for analysis ${analysisId}`);
            const benchmarkData = await this.runBenchmarking(
                analysisConfig.sector_id,
                analysisConfig.activity_id,
                calculationResults
            );
            results.benchmarking = benchmarkData;
            results.steps_completed.push('benchmarking');

            // Step 9: Generate recommendations
            logger.info(`Generating recommendations for analysis ${analysisId}`);
            const recommendations = await this.generateRecommendations(
                calculationResults,
                aiResults,
                benchmarkData,
                language
            );
            results.recommendations = recommendations;
            results.steps_completed.push('recommendations');

            // Calculate total costs and processing time
            results.costs.total = this.aiAgents.getCosts().total;
            results.costs.breakdown = this.aiAgents.getCosts();
            results.processing_time.end = Date.now();
            results.processing_time.duration = results.processing_time.end - results.processing_time.start;

            // Step 10: Save final results
            await this.saveFinalResults(analysisId, results);
            await this.updateAnalysisStatus(analysisId, 'completed', {
                completed_at: new Date(),
                processing_time: results.processing_time.duration,
                total_cost: results.costs.total
            });

            logger.info(`Analysis completed successfully for ID: ${analysisId}. Duration: ${results.processing_time.duration}ms, Cost: $${results.costs.total.toFixed(4)}`);

            return {
                success: true,
                results,
                message: 'Analysis completed successfully'
            };

        } catch (error) {
            logger.error(`Error in full analysis for ID ${analysisId}:`, error);

            await this.updateAnalysisStatus(analysisId, 'error', {
                error_message: error.message,
                error_at: new Date()
            });

            return {
                success: false,
                error: error.message,
                analysis_id: analysisId
            };
        }
    }

    // Load analysis configuration from database
    async loadAnalysisConfiguration(analysisId) {
        try {
            const { data: analysis, error } = await supabaseAdmin
                .from('analyses')
                .select(`
                    *,
                    documents(*),
                    company_sectors(*),
                    company_activities(*),
                    legal_entities(*)
                `)
                .eq('id', analysisId)
                .single();

            if (error) throw error;

            // Load selected analysis types
            const analysisTypeIds = analysis.selected_analysis_types || [];
            const { data: analysisTypes, error: typesError } = await supabaseAdmin
                .from('analysis_types')
                .select('*')
                .in('id', analysisTypeIds);

            if (typesError) throw typesError;

            analysis.analysis_types = analysisTypes;
            return analysis;

        } catch (error) {
            logger.error('Error loading analysis configuration:', error);
            throw error;
        }
    }

    // Process uploaded document
    async processDocument(documentData) {
        try {
            if (!documentData) {
                return { error: 'No document provided' };
            }

            // Use document processor to extract data
            const processedData = await this.documentProcessor.processDocument(
                documentData.file_path,
                documentData.mime_type
            );

            return {
                extracted_data: processedData.extracted_data,
                confidence_score: processedData.confidence_score,
                processing_notes: processedData.processing_notes,
                ocr_data: processedData.ocr_data,
                tables: processedData.tables
            };

        } catch (error) {
            logger.error('Error processing document:', error);
            return { error: error.message };
        }
    }

    // Extract and validate financial data
    async extractFinancialData(documentData, extractedData) {
        try {
            const financialData = {};

            // Map extracted data to standardized financial fields
            const fieldMappings = {
                'current_assets': ['current assets', 'أصول متداولة', 'current_assets'],
                'current_liabilities': ['current liabilities', 'خصوم متداولة', 'current_liabilities'],
                'total_assets': ['total assets', 'إجمالي الأصول', 'total_assets'],
                'total_equity': ['total equity', 'إجمالي حقوق الملكية', 'shareholders_equity'],
                'revenue': ['revenue', 'sales', 'إيرادات', 'مبيعات'],
                'cogs': ['cost of goods sold', 'تكلفة البضاعة المباعة', 'cogs'],
                'operating_income': ['operating income', 'دخل تشغيلي', 'operating_income'],
                'net_income': ['net income', 'صافي الدخل', 'net_income'],
                'ebit': ['ebit', 'earnings before interest and taxes'],
                'interest_expense': ['interest expense', 'مصاريف الفوائد'],
                'operating_cash_flow': ['operating cash flow', 'التدفق النقدي التشغيلي'],
                'capital_expenditures': ['capital expenditures', 'نفقات رأسمالية']
            };

            // Extract values using field mappings
            for (const [standardField, variations] of Object.entries(fieldMappings)) {
                let value = null;

                // Try to find value in extracted data
                for (const variation of variations) {
                    if (extractedData && extractedData[variation] !== undefined) {
                        value = this.parseNumericValue(extractedData[variation]);
                        break;
                    }
                }

                if (value !== null && !isNaN(value)) {
                    financialData[standardField] = value;
                }
            }

            // Calculate derived fields
            if (financialData.current_assets && financialData.current_liabilities) {
                financialData.working_capital = financialData.current_assets - financialData.current_liabilities;
            }

            if (financialData.revenue && financialData.cogs) {
                financialData.gross_profit = financialData.revenue - financialData.cogs;
            }

            if (financialData.operating_cash_flow && financialData.capital_expenditures) {
                financialData.free_cash_flow = financialData.operating_cash_flow - financialData.capital_expenditures;
            }

            logger.info(`Extracted ${Object.keys(financialData).length} financial data points`);
            return financialData;

        } catch (error) {
            logger.error('Error extracting financial data:', error);
            throw error;
        }
    }

    // Fetch external data (market data, benchmarks, etc.)
    async fetchExternalData(analysisConfig) {
        try {
            const externalData = {};

            // Fetch market data if company is public
            if (analysisConfig.company_symbol) {
                externalData.market_data = await this.externalDataService.getMarketData(
                    analysisConfig.company_symbol
                );
            }

            // Fetch sector benchmarks
            if (analysisConfig.sector_id) {
                externalData.sector_benchmarks = await this.externalDataService.getSectorBenchmarks(
                    analysisConfig.sector_id
                );
            }

            // Fetch economic indicators
            externalData.economic_indicators = await this.externalDataService.getEconomicIndicators();

            // Fetch industry trends
            if (analysisConfig.company_sectors && analysisConfig.company_sectors.code) {
                externalData.industry_trends = await this.externalDataService.getIndustryTrends(
                    analysisConfig.company_sectors.code
                );
            }

            return externalData;

        } catch (error) {
            logger.error('Error fetching external data:', error);
            return { error: error.message };
        }
    }

    // Run financial calculations
    async runFinancialCalculations(financialData, selectedAnalysisTypes) {
        try {
            logger.info(`Running calculations for ${selectedAnalysisTypes.length} analysis types`);

            const calculationResults = this.calculator.calculateAllRatios(
                financialData,
                selectedAnalysisTypes
            );

            // Generate summary
            const summary = this.calculator.generateSummary(calculationResults.results);
            calculationResults.summary = summary;

            return calculationResults;

        } catch (error) {
            logger.error('Error running financial calculations:', error);
            throw error;
        }
    }

    // Run AI analysis
    async runAIAnalysis(analysisId, analysisConfig, financialData, calculationResults, externalData, language) {
        try {
            const aiResults = await this.aiAgents.runFullAnalysis(
                analysisId,
                analysisConfig.documents,
                financialData,
                analysisConfig.analysis_types,
                {
                    company_name: analysisConfig.company_name,
                    sector: analysisConfig.company_sectors,
                    activity: analysisConfig.company_activities
                },
                analysisConfig.company_sectors,
                language
            );

            return aiResults;

        } catch (error) {
            logger.error('Error in AI analysis:', error);
            return { error: error.message };
        }
    }

    // Generate charts data
    async generateChartsData(calculationResults, externalData) {
        try {
            const chartsData = {
                financial_ratios: [],
                trend_analysis: [],
                benchmark_comparison: [],
                pie_charts: [],
                bar_charts: [],
                line_charts: []
            };

            // Generate ratio comparison charts
            if (calculationResults.results) {
                const categories = ['Liquidity', 'Leverage', 'Profitability', 'Activity'];

                for (const category of categories) {
                    const categoryRatios = Object.entries(calculationResults.results)
                        .filter(([name, result]) => result.category === category)
                        .map(([name, result]) => ({
                            name: name,
                            value: result.value,
                            interpretation: result.interpretation
                        }));

                    if (categoryRatios.length > 0) {
                        chartsData.financial_ratios.push({
                            category: category,
                            type: 'bar',
                            data: categoryRatios
                        });
                    }
                }
            }

            // Generate benchmark comparison if available
            if (externalData.sector_benchmarks) {
                chartsData.benchmark_comparison.push({
                    title: 'Industry Comparison',
                    type: 'radar',
                    data: this.prepareBenchmarkData(calculationResults.results, externalData.sector_benchmarks)
                });
            }

            // Generate trend analysis if historical data available
            if (externalData.market_data && externalData.market_data.historical) {
                chartsData.trend_analysis.push({
                    title: 'Stock Price Trend',
                    type: 'line',
                    data: this.prepareTrendData(externalData.market_data.historical)
                });
            }

            return chartsData;

        } catch (error) {
            logger.error('Error generating charts data:', error);
            return { error: error.message };
        }
    }

    // Run benchmarking analysis
    async runBenchmarking(sectorId, activityId, calculationResults) {
        try {
            const { data: benchmarks, error } = await supabaseAdmin
                .from('industry_benchmarks')
                .select('*')
                .or(`sector_id.eq.${sectorId},activity_id.eq.${activityId}`);

            if (error) throw error;

            const benchmarkAnalysis = {
                sector_comparison: {},
                percentile_ranking: {},
                peer_analysis: {}
            };

            // Compare with sector benchmarks
            if (benchmarks && benchmarks.length > 0) {
                for (const benchmark of benchmarks) {
                    const companyRatio = calculationResults.results[benchmark.metric_name];
                    if (companyRatio && companyRatio.value !== null) {
                        benchmarkAnalysis.sector_comparison[benchmark.metric_name] = {
                            company_value: companyRatio.value,
                            sector_median: benchmark.percentile_50,
                            sector_p25: benchmark.percentile_25,
                            sector_p75: benchmark.percentile_75,
                            performance: this.calculatePerformanceVsBenchmark(
                                companyRatio.value,
                                benchmark.percentile_50
                            )
                        };
                    }
                }
            }

            return benchmarkAnalysis;

        } catch (error) {
            logger.error('Error in benchmarking analysis:', error);
            return { error: error.message };
        }
    }

    // Generate recommendations
    async generateRecommendations(calculationResults, aiResults, benchmarkData, language) {
        try {
            const recommendations = {
                priority_areas: [],
                action_items: [],
                strategic_initiatives: [],
                monitoring_metrics: []
            };

            // Analyze results and generate recommendations
            if (calculationResults.summary) {
                for (const [category, data] of Object.entries(calculationResults.summary)) {
                    if (data.average_interpretation === 'poor' || data.average_interpretation === 'concerning') {
                        recommendations.priority_areas.push({
                            category: category,
                            issue: `${category} ratios need improvement`,
                            priority: 'high'
                        });
                    }
                }
            }

            // Add AI-generated recommendations
            if (aiResults.financial_analysis && aiResults.financial_analysis.recommendations) {
                recommendations.ai_insights = aiResults.financial_analysis.recommendations;
            }

            // Add benchmark-based recommendations
            if (benchmarkData.sector_comparison) {
                for (const [metric, comparison] of Object.entries(benchmarkData.sector_comparison)) {
                    if (comparison.performance === 'below_average') {
                        recommendations.action_items.push({
                            metric: metric,
                            recommendation: `Focus on improving ${metric} to reach industry median`,
                            current: comparison.company_value,
                            target: comparison.sector_median
                        });
                    }
                }
            }

            return recommendations;

        } catch (error) {
            logger.error('Error generating recommendations:', error);
            return { error: error.message };
        }
    }

    // Save final results to database
    async saveFinalResults(analysisId, results) {
        try {
            const updateData = {
                results: results.calculations ? results.calculations.results : {},
                charts_data: results.charts || {},
                recommendations: results.recommendations || {},
                external_data: results.external_data || {},
                ai_insights: {
                    document_processing: results.ai_analysis?.document_processing,
                    financial_analysis: results.ai_analysis?.financial_analysis,
                    market_enrichment: results.ai_analysis?.market_enrichment,
                    risk_assessment: results.ai_analysis?.risk_assessment,
                    report_content: results.ai_analysis?.report_content
                },
                processing_completed_at: new Date(),
                updated_at: new Date()
            };

            const { error } = await supabaseAdmin
                .from('analyses')
                .update(updateData)
                .eq('id', analysisId);

            if (error) throw error;

            logger.info(`Final results saved for analysis ${analysisId}`);

        } catch (error) {
            logger.error('Error saving final results:', error);
            throw error;
        }
    }

    // Update analysis status
    async updateAnalysisStatus(analysisId, status, additionalData = {}) {
        try {
            const updateData = {
                status: status,
                updated_at: new Date(),
                ...additionalData
            };

            if (status === 'processing') {
                updateData.processing_started_at = new Date();
            } else if (status === 'completed') {
                updateData.processing_completed_at = new Date();
            }

            const { error } = await supabaseAdmin
                .from('analyses')
                .update(updateData)
                .eq('id', analysisId);

            if (error) throw error;

        } catch (error) {
            logger.error('Error updating analysis status:', error);
            throw error;
        }
    }

    // Utility functions
    parseNumericValue(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            // Remove commas, currency symbols, and whitespace
            const cleaned = value.replace(/[,\s$£€¥₹]/g, '');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? null : parsed;
        }
        return null;
    }

    prepareBenchmarkData(companyResults, benchmarks) {
        const data = [];

        for (const benchmark of benchmarks) {
            const companyRatio = companyResults[benchmark.metric_name];
            if (companyRatio && companyRatio.value !== null) {
                data.push({
                    metric: benchmark.metric_name,
                    company: companyRatio.value,
                    industry_median: benchmark.percentile_50,
                    industry_avg: (benchmark.percentile_25 + benchmark.percentile_75) / 2
                });
            }
        }

        return data;
    }

    prepareTrendData(historicalData) {
        return historicalData.map(point => ({
            date: point.date,
            value: point.close_price,
            volume: point.volume
        }));
    }

    calculatePerformanceVsBenchmark(companyValue, benchmarkValue) {
        if (!companyValue || !benchmarkValue) return 'unknown';

        const ratio = companyValue / benchmarkValue;
        if (ratio > 1.1) return 'above_average';
        if (ratio < 0.9) return 'below_average';
        return 'average';
    }

    // Get analysis status
    async getAnalysisStatus(analysisId) {
        try {
            const { data, error } = await supabaseAdmin
                .from('analyses')
                .select('status, processing_started_at, processing_completed_at')
                .eq('id', analysisId)
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            logger.error('Error getting analysis status:', error);
            throw error;
        }
    }

    // Cancel analysis
    async cancelAnalysis(analysisId, reason = 'User requested') {
        try {
            await this.updateAnalysisStatus(analysisId, 'cancelled', {
                cancelled_at: new Date(),
                cancellation_reason: reason
            });

            logger.info(`Analysis ${analysisId} cancelled: ${reason}`);
            return { success: true };

        } catch (error) {
            logger.error('Error cancelling analysis:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = AnalysisEngine;