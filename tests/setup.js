const { supabaseAdmin } = require('../lib/supabase');

// Test database setup
beforeAll(async () => {
    // Ensure test database is clean
    try {
        // Clean up any existing test data
        await cleanupTestData();

        // Initialize test data if needed
        await seedTestData();

        console.log('Test environment setup completed');
    } catch (error) {
        console.error('Test setup failed:', error);
        process.exit(1);
    }
});

// Cleanup after all tests
afterAll(async () => {
    try {
        await cleanupTestData();
        console.log('Test environment cleanup completed');
    } catch (error) {
        console.error('Test cleanup failed:', error);
    }
});

// Clean up test data
async function cleanupTestData() {
    const testEmailPattern = '%test@finclick.ai%';
    const testEmailPattern2 = '%payment-test@finclick.ai%';

    try {
        // Delete test users and related data
        const { data: testUsers } = await supabaseAdmin
            .from('users')
            .select('id')
            .or(`email.like.${testEmailPattern},email.like.${testEmailPattern2}`);

        if (testUsers && testUsers.length > 0) {
            const userIds = testUsers.map(user => user.id);

            // Delete related data first (due to foreign key constraints)
            await supabaseAdmin
                .from('ai_agent_logs')
                .delete()
                .in('analysis_id',
                    supabaseAdmin
                        .from('analyses')
                        .select('id')
                        .in('user_id', userIds)
                );

            await supabaseAdmin
                .from('reports')
                .delete()
                .in('analysis_id',
                    supabaseAdmin
                        .from('analyses')
                        .select('id')
                        .in('user_id', userIds)
                );

            await supabaseAdmin
                .from('analyses')
                .delete()
                .in('user_id', userIds);

            await supabaseAdmin
                .from('documents')
                .delete()
                .in('user_id', userIds);

            await supabaseAdmin
                .from('payments')
                .delete()
                .in('user_id', userIds);

            await supabaseAdmin
                .from('subscriptions')
                .delete()
                .in('user_id', userIds);

            // Finally delete users
            await supabaseAdmin
                .from('users')
                .delete()
                .in('id', userIds);
        }

        // Clean up any orphaned test records
        await supabaseAdmin
            .from('documents')
            .delete()
            .like('filename', '%test%');

        await supabaseAdmin
            .from('analyses')
            .delete()
            .like('analysis_name', '%Test%');

    } catch (error) {
        console.warn('Cleanup warning:', error.message);
        // Don't fail tests due to cleanup issues
    }
}

// Seed basic test data
async function seedTestData() {
    try {
        // Ensure analysis types exist
        const { data: existingTypes } = await supabaseAdmin
            .from('analysis_types')
            .select('id')
            .limit(1);

        if (!existingTypes || existingTypes.length === 0) {
            // Insert basic analysis types for testing
            const basicAnalysisTypes = [
                {
                    name_en: 'Current Ratio',
                    name_ar: 'نسبة التداول',
                    description_en: 'Test current ratio',
                    description_ar: 'اختبار نسبة التداول',
                    category: 'Liquidity',
                    subcategory: 'Basic Ratios',
                    formula: 'Current Assets / Current Liabilities',
                    calculation_logic: { formula: 'current_assets / current_liabilities' },
                    required_fields: ['current_assets', 'current_liabilities'],
                    output_format: { type: 'ratio', unit: 'times' }
                },
                {
                    name_en: 'Return on Equity (ROE)',
                    name_ar: 'العائد على حقوق الملكية',
                    description_en: 'Test ROE',
                    description_ar: 'اختبار العائد على حقوق الملكية',
                    category: 'Profitability',
                    subcategory: 'Return Ratios',
                    formula: 'Net Income / Total Equity * 100',
                    calculation_logic: { formula: 'net_income / total_equity * 100' },
                    required_fields: ['net_income', 'total_equity'],
                    output_format: { type: 'percentage', unit: '%' }
                }
            ];

            await supabaseAdmin
                .from('analysis_types')
                .insert(basicAnalysisTypes);
        }

        // Ensure sectors exist
        const { data: existingSectors } = await supabaseAdmin
            .from('company_sectors')
            .select('id')
            .limit(1);

        if (!existingSectors || existingSectors.length === 0) {
            const basicSectors = [
                {
                    name_en: 'Test Sector',
                    name_ar: 'قطاع الاختبار',
                    code: 'TEST',
                    description_en: 'Test sector for testing',
                    description_ar: 'قطاع اختبار للاختبار'
                }
            ];

            await supabaseAdmin
                .from('company_sectors')
                .insert(basicSectors);
        }

        // Ensure legal entities exist
        const { data: existingEntities } = await supabaseAdmin
            .from('legal_entities')
            .select('id')
            .limit(1);

        if (!existingEntities || existingEntities.length === 0) {
            const basicEntities = [
                {
                    name_en: 'Test LLC',
                    name_ar: 'شركة اختبار محدودة المسؤولية',
                    code: 'TEST_LLC',
                    description_en: 'Test legal entity',
                    description_ar: 'كيان قانوني للاختبار'
                }
            ];

            await supabaseAdmin
                .from('legal_entities')
                .insert(basicEntities);
        }

    } catch (error) {
        console.warn('Seeding warning:', error.message);
        // Don't fail tests due to seeding issues
    }
}

// Mock external services for testing
jest.mock('../lib/externalDataService', () => {
    return class MockExternalDataService {
        constructor() {
            this.cache = new Map();
        }

        async getMarketData(symbol) {
            return {
                quote: { price: 100 + Math.random() * 50 },
                profile: { symbol, companyName: `Mock Company ${symbol}` },
                source: 'Mock Data'
            };
        }

        async getSectorBenchmarks(sectorId) {
            return [
                {
                    metric_name: 'Current Ratio',
                    percentile_50: 1.5,
                    percentile_25: 1.0,
                    percentile_75: 2.0
                }
            ];
        }

        async getEconomicIndicators() {
            return {
                gdp: { latest_value: 700000000000 },
                inflation: { latest_value: 2.8 },
                unemployment: { latest_value: 11.2 }
            };
        }

        getApiStatus() {
            return {
                financial_modeling_prep: true,
                alpha_vantage: true,
                world_bank: true
            };
        }
    };
});

// Mock AI services for testing
jest.mock('openai', () => {
    return class MockOpenAI {
        constructor() {
            this.chat = {
                completions: {
                    create: jest.fn().mockResolvedValue({
                        choices: [{
                            message: {
                                content: JSON.stringify({
                                    insights: 'Mock AI insights',
                                    recommendations: ['Mock recommendation 1', 'Mock recommendation 2']
                                })
                            }
                        }],
                        usage: {
                            prompt_tokens: 100,
                            completion_tokens: 50
                        }
                    })
                }
            };
        }
    };
});

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: class MockGemini {
            constructor() {}

            getGenerativeModel() {
                return {
                    generateContent: jest.fn().mockResolvedValue({
                        response: {
                            text: () => JSON.stringify({
                                analysis: 'Mock Gemini analysis',
                                recommendations: ['Mock Gemini recommendation']
                            })
                        }
                    })
                };
            }
        }
    };
});

// Mock PayTabs API
jest.mock('axios', () => ({
    post: jest.fn((url, data) => {
        // Mock PayTabs response
        if (url.includes('paytabs.com')) {
            return Promise.resolve({
                data: {
                    response_status: 'A',
                    payment_url: 'https://secure-global.paytabs.com/payment/page/mock123',
                    tran_ref: `TST_${Date.now()}`,
                    payment_token: 'mock_token_123'
                }
            });
        }

        // Mock other API calls
        return Promise.resolve({
            data: {
                success: true,
                data: {}
            }
        });
    }),
    get: jest.fn().mockResolvedValue({
        data: {
            success: true,
            data: []
        }
    })
}));

// Global test utilities
global.testUtils = {
    createMockUser: () => ({
        email: 'test@finclick.ai',
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User',
        company_name: 'Test Company'
    }),

    createMockAnalysisData: () => ({
        analysis_name: 'Test Analysis',
        company_name: 'Test Company Ltd',
        sector_id: '1',
        analysis_period: 'Q4 2024',
        selected_analysis_types: ['1', '2']
    }),

    createMockFinancialData: () => ({
        current_assets: 100000,
        current_liabilities: 50000,
        total_assets: 200000,
        total_equity: 100000,
        revenue: 150000,
        net_income: 20000
    }),

    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Suppress console logs during tests unless specifically needed
if (process.env.NODE_ENV === 'test' && !process.env.VERBOSE_TESTS) {
    console.log = jest.fn();
    console.info = jest.fn();
    // Keep console.error and console.warn for debugging
}

// Handle uncaught exceptions in tests
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

module.exports = {
    cleanupTestData,
    seedTestData
};