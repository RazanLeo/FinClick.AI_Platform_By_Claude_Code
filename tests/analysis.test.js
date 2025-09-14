const request = require('supertest');
const { supabaseAdmin } = require('../lib/supabase');
const app = require('../server');

describe('Analysis API', () => {
    let authToken;
    let userId;
    let documentId;
    let analysisId;

    beforeAll(async () => {
        // Create test user and get auth token
        const testUser = {
            email: 'test@finclick.ai',
            password: 'TestPassword123!',
            first_name: 'Test',
            last_name: 'User',
            company_name: 'Test Company'
        };

        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send(testUser)
            .expect(201);

        authToken = registerResponse.body.token;
        userId = registerResponse.body.user.id;

        // Create test document
        const { data: document } = await supabaseAdmin
            .from('documents')
            .insert({
                user_id: userId,
                filename: 'test-document.pdf',
                original_filename: 'test-document.pdf',
                file_path: '/test/path/test-document.pdf',
                file_size: 1024,
                mime_type: 'application/pdf',
                status: 'uploaded'
            })
            .select()
            .single();

        documentId = document.id;
    });

    afterAll(async () => {
        // Clean up test data
        if (analysisId) {
            await supabaseAdmin
                .from('analyses')
                .delete()
                .eq('id', analysisId);
        }

        if (documentId) {
            await supabaseAdmin
                .from('documents')
                .delete()
                .eq('id', documentId);
        }

        if (userId) {
            await supabaseAdmin
                .from('users')
                .delete()
                .eq('id', userId);
        }
    });

    describe('GET /api/analysis/types', () => {
        test('should return analysis types', async () => {
            const response = await request(app)
                .get('/api/analysis/types')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(typeof response.body.data).toBe('object');
            expect(response.body.total).toBeGreaterThan(0);
        });

        test('should require authentication', async () => {
            await request(app)
                .get('/api/analysis/types')
                .expect(401);
        });
    });

    describe('GET /api/analysis/sectors', () => {
        test('should return sectors', async () => {
            const response = await request(app)
                .get('/api/analysis/sectors')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('POST /api/analysis', () => {
        test('should create new analysis', async () => {
            const analysisData = {
                analysis_name: 'Test Analysis',
                company_name: 'Test Company Ltd',
                sector_id: '1',
                analysis_period: 'Q4 2024',
                selected_analysis_types: ['1', '2', '3'],
                document_id: documentId
            };

            const response = await request(app)
                .post('/api/analysis')
                .set('Authorization', `Bearer ${authToken}`)
                .send(analysisData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.analysis_name).toBe(analysisData.analysis_name);
            expect(response.body.data.status).toBe('pending');

            analysisId = response.body.data.id;
        });

        test('should validate required fields', async () => {
            const analysisData = {
                company_name: 'Test Company Ltd'
                // Missing required fields
            };

            await request(app)
                .post('/api/analysis')
                .set('Authorization', `Bearer ${authToken}`)
                .send(analysisData)
                .expect(400);
        });

        test('should require authentication', async () => {
            await request(app)
                .post('/api/analysis')
                .send({})
                .expect(401);
        });
    });

    describe('GET /api/analysis', () => {
        test('should return user analyses', async () => {
            const response = await request(app)
                .get('/api/analysis')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.pagination).toBeDefined();
        });

        test('should support pagination', async () => {
            const response = await request(app)
                .get('/api/analysis?page=1&limit=5')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(5);
        });

        test('should support filtering by status', async () => {
            const response = await request(app)
                .get('/api/analysis?status=pending')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/analysis/:id', () => {
        test('should return specific analysis', async () => {
            if (!analysisId) {
                // Create test analysis first
                const analysisData = {
                    analysis_name: 'Test Analysis',
                    company_name: 'Test Company Ltd',
                    sector_id: '1',
                    analysis_period: 'Q4 2024',
                    selected_analysis_types: ['1', '2'],
                    document_id: documentId
                };

                const createResponse = await request(app)
                    .post('/api/analysis')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(analysisData);

                analysisId = createResponse.body.data.id;
            }

            const response = await request(app)
                .get(`/api/analysis/${analysisId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.id).toBe(analysisId);
        });

        test('should return 404 for non-existent analysis', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';

            await request(app)
                .get(`/api/analysis/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });

        test('should not allow access to other user\'s analysis', async () => {
            // This test would require creating another user and analysis
            // For now, we'll test with a fake ID that would belong to another user
            const otherUserId = '11111111-1111-1111-1111-111111111111';

            await request(app)
                .get(`/api/analysis/${otherUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });

    describe('GET /api/analysis/:id/status', () => {
        test('should return analysis status', async () => {
            if (!analysisId) return; // Skip if no analysis created

            const response = await request(app)
                .get(`/api/analysis/${analysisId}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(['pending', 'processing', 'completed', 'error', 'cancelled'])
                .toContain(response.body.data.status);
        });
    });

    describe('POST /api/analysis/:id/cancel', () => {
        test('should cancel analysis', async () => {
            if (!analysisId) return; // Skip if no analysis created

            const response = await request(app)
                .post(`/api/analysis/${analysisId}/cancel`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('should not cancel completed analysis', async () => {
            // This test would require setting up an analysis in completed state
            // For now, we'll test the general case
        });
    });

    describe('DELETE /api/analysis/:id', () => {
        test('should delete analysis', async () => {
            if (!analysisId) return; // Skip if no analysis created

            const response = await request(app)
                .delete(`/api/analysis/${analysisId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Analysis deleted successfully');

            // Verify deletion
            await request(app)
                .get(`/api/analysis/${analysisId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            analysisId = null; // Reset so cleanup doesn't try to delete again
        });
    });

    describe('GET /api/analysis/stats/summary', () => {
        test('should return user statistics', async () => {
            const response = await request(app)
                .get('/api/analysis/stats/summary')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.total_analyses).toBeDefined();
            expect(response.body.data.completed_analyses).toBeDefined();
            expect(response.body.data.processing_analyses).toBeDefined();
            expect(response.body.data.failed_analyses).toBeDefined();
            expect(response.body.data.total_reports).toBeDefined();
        });
    });

    describe('File Upload', () => {
        test('should upload document', async () => {
            const response = await request(app)
                .post('/api/analysis/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('document', Buffer.from('test file content'), 'test.pdf')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.filename).toBeDefined();
            expect(response.body.data.original_filename).toBe('test.pdf');
        });

        test('should reject files that are too large', async () => {
            const largeBuffer = Buffer.alloc(60 * 1024 * 1024); // 60MB

            await request(app)
                .post('/api/analysis/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('document', largeBuffer, 'large.pdf')
                .expect(413); // Payload too large
        });

        test('should reject unsupported file types', async () => {
            await request(app)
                .post('/api/analysis/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('document', Buffer.from('test'), 'test.exe')
                .expect(400);
        });
    });
});

describe('Financial Calculations', () => {
    const FinancialCalculations = require('../lib/financialCalculations');
    let calculator;

    beforeEach(() => {
        calculator = new FinancialCalculations();
    });

    describe('Basic Ratio Calculations', () => {
        test('should calculate current ratio correctly', () => {
            const data = {
                current_assets: 100000,
                current_liabilities: 50000
            };

            const result = calculator.calculateCurrentRatio(data);

            expect(result.value).toBe(2.0);
            expect(result.interpretation).toBe('good');
            expect(result.category).toBe('Liquidity');
        });

        test('should handle zero denominator', () => {
            const data = {
                current_assets: 100000,
                current_liabilities: 0
            };

            const result = calculator.calculateCurrentRatio(data);

            expect(result.value).toBeNull();
        });

        test('should calculate debt to equity ratio', () => {
            const data = {
                total_debt: 60000,
                total_equity: 100000
            };

            const result = calculator.calculateDebtToEquityRatio(data);

            expect(result.value).toBe(0.6);
            expect(result.interpretation).toBe('moderate');
        });

        test('should calculate ROE correctly', () => {
            const data = {
                net_income: 20000,
                total_equity: 100000
            };

            const result = calculator.calculateReturnOnEquity(data);

            expect(result.value).toBe(20);
            expect(result.interpretation).toBe('excellent');
        });
    });

    describe('Complex Calculations', () => {
        test('should calculate EBITDA', () => {
            const data = {
                net_income: 50000,
                interest_expense: 5000,
                tax_expense: 15000,
                depreciation: 10000,
                amortization: 2000
            };

            const result = calculator.calculateEBITDA(data);

            expect(result.value).toBe(82000);
        });

        test('should calculate Altman Z-Score', () => {
            const data = {
                working_capital: 50000,
                total_assets: 200000,
                retained_earnings: 30000,
                ebit: 25000,
                market_value_equity: 150000,
                total_liabilities: 50000,
                sales: 100000
            };

            const result = calculator.calculateAltmanZScore(data);

            expect(result.value).toBeGreaterThan(0);
            expect(['safe', 'caution', 'distress']).toContain(result.interpretation);
        });
    });

    describe('Full Analysis', () => {
        test('should calculate multiple ratios', () => {
            const financialData = {
                current_assets: 100000,
                current_liabilities: 50000,
                total_assets: 200000,
                total_equity: 100000,
                total_debt: 50000,
                revenue: 150000,
                net_income: 20000,
                cogs: 90000
            };

            const selectedTypes = [
                { id: '1', name_en: 'Current Ratio', name_ar: 'نسبة التداول' },
                { id: '2', name_en: 'Debt-to-Equity Ratio', name_ar: 'نسبة الدين إلى حقوق الملكية' },
                { id: '3', name_en: 'Return on Equity (ROE)', name_ar: 'العائد على حقوق الملكية' }
            ];

            const result = calculator.calculateAllRatios(financialData, selectedTypes);

            expect(result.results).toBeDefined();
            expect(result.errors).toBeDefined();
            expect(result.totalCalculated).toBeGreaterThan(0);
            expect(Object.keys(result.results).length).toBeGreaterThan(0);
        });
    });
});

describe('AI Agents', () => {
    const AIAgents = require('../lib/aiAgents');

    // Mock OpenAI and Gemini responses
    jest.mock('openai');
    jest.mock('@google/generative-ai');

    describe('Document Processing', () => {
        test('should process document data', async () => {
            const agents = new AIAgents();
            const documentData = {
                id: '1',
                mime_type: 'application/pdf',
                original_filename: 'test.pdf',
                ocr_data: {
                    text: 'Sample financial document content'
                }
            };

            // This test would require mocking the AI services
            // For now, we'll test the structure
            expect(agents.processDocument).toBeDefined();
            expect(typeof agents.processDocument).toBe('function');
        });
    });

    describe('Cost Calculation', () => {
        test('should calculate OpenAI costs correctly', () => {
            const agents = new AIAgents();

            const cost = agents.calculateOpenAICost('gpt-4', 1000, 500);

            expect(cost).toBeGreaterThan(0);
            expect(typeof cost).toBe('number');
        });
    });
});

describe('Document Processor', () => {
    const DocumentProcessor = require('../lib/documentProcessor');
    let processor;

    beforeEach(() => {
        processor = new DocumentProcessor();
    });

    test('should support common file types', () => {
        const supportedTypes = processor.getSupportedTypes();

        expect(supportedTypes).toContain('application/pdf');
        expect(supportedTypes).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(supportedTypes).toContain('image/jpeg');
        expect(supportedTypes).toContain('text/csv');
    });

    test('should validate file types', () => {
        expect(processor.isSupported('application/pdf')).toBe(true);
        expect(processor.isSupported('application/exe')).toBe(false);
    });

    test('should parse numeric values', () => {
        expect(processor.parseNumericValue('1,234.56')).toBe(1234.56);
        expect(processor.parseNumericValue('$1,000')).toBe(1000);
        expect(processor.parseNumericValue('(500)')).toBe(-500);
        expect(processor.parseNumericValue('abc')).toBeNull();
    });

    test('should extract numbers from text', () => {
        const numbers = processor.extractNumbers('Total Assets: $1,234,567.89 and Revenue: 2,345,678');

        expect(numbers).toContain(1234567.89);
        expect(numbers).toContain(2345678);
    });
});

describe('Report Generator', () => {
    const ReportGenerator = require('../lib/reportGenerator');
    let generator;

    beforeEach(() => {
        generator = new ReportGenerator();
    });

    test('should support multiple formats', () => {
        const formats = generator.getSupportedFormats();

        expect(formats).toContain('pdf');
        expect(formats).toContain('word');
        expect(formats).toContain('excel');
        expect(formats).toContain('powerpoint');
    });

    test('should have available templates', () => {
        const templates = generator.getAvailableTemplates();

        expect(templates).toContain('standard');
        expect(templates).toContain('executive');
        expect(templates).toContain('detailed');
    });
});

describe('External Data Service', () => {
    const ExternalDataService = require('../lib/externalDataService');
    let service;

    beforeEach(() => {
        service = new ExternalDataService();
    });

    test('should identify Saudi symbols', () => {
        expect(service.isSaudiSymbol('2222')).toBe(true);
        expect(service.isSaudiSymbol('AAPL')).toBe(false);
        expect(service.isSaudiSymbol('1234')).toBe(true);
    });

    test('should map Saudi sectors', () => {
        const sector = service.getSaudiSectorBySymbol('2222');
        expect(sector).toBeDefined();
        expect(typeof sector).toBe('string');
    });

    test('should generate mock ratios', () => {
        const ratios = service.generateMockRatios();

        expect(ratios.peRatio).toBeGreaterThan(0);
        expect(ratios.currentRatio).toBeGreaterThan(0);
        expect(ratios.roe).toBeGreaterThanOrEqual(0);
        expect(ratios.roe).toBeLessThanOrEqual(1);
    });

    test('should generate historical data', () => {
        const historical = service.generateMockHistoricalData('2222', 10);

        expect(historical).toHaveLength(10);
        expect(historical[0]).toHaveProperty('date');
        expect(historical[0]).toHaveProperty('close');
        expect(historical[0]).toHaveProperty('volume');
    });
});

describe('Analysis Engine', () => {
    const AnalysisEngine = require('../lib/analysisEngine');

    test('should parse numeric values correctly', () => {
        const engine = new AnalysisEngine();

        expect(engine.parseNumericValue(123)).toBe(123);
        expect(engine.parseNumericValue('456')).toBe(456);
        expect(engine.parseNumericValue('1,234.56')).toBe(1234.56);
        expect(engine.parseNumericValue('$1,000')).toBe(1000);
        expect(engine.parseNumericValue('invalid')).toBeNull();
    });

    test('should calculate performance vs benchmark', () => {
        const engine = new AnalysisEngine();

        expect(engine.calculatePerformanceVsBenchmark(110, 100)).toBe('above_average');
        expect(engine.calculatePerformanceVsBenchmark(95, 100)).toBe('average');
        expect(engine.calculatePerformanceVsBenchmark(80, 100)).toBe('below_average');
        expect(engine.calculatePerformanceVsBenchmark(null, 100)).toBe('unknown');
    });
});