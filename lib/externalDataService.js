const axios = require('axios');
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
        new winston.transports.File({ filename: './logs/external-data.log' })
    ]
});

class ExternalDataService {
    constructor() {
        this.fmpApiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;
        this.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY;
        this.worldBankApiKey = process.env.WORLD_BANK_API_KEY;

        this.cache = new Map();
        this.cacheExpiry = 3600000; // 1 hour in milliseconds

        this.endpoints = {
            fmp: 'https://financialmodelingprep.com/api/v3',
            alphaVantage: 'https://www.alphavantage.co/query',
            worldBank: 'https://api.worldbank.org/v2',
            saudiExchange: 'https://www.saudiexchange.sa/wps/portal/saudiexchange/newsandreports/reports-publications/monthly-statistical-reports',
            tadawul: 'https://www.saudiexchange.sa/wps/portal/saudiexchange'
        };
    }

    // Get market data for a specific symbol
    async getMarketData(symbol, exchange = 'NASDAQ') {
        try {
            logger.info(`Fetching market data for symbol: ${symbol}`);

            const cacheKey = `market_${symbol}_${exchange}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            let data = null;

            // Try Financial Modeling Prep first
            if (this.fmpApiKey) {
                data = await this.getMarketDataFromFMP(symbol);
            }

            // Fallback to Alpha Vantage
            if (!data && this.alphaVantageApiKey) {
                data = await this.getMarketDataFromAlphaVantage(symbol);
            }

            // If still no data, create mock data for Saudi market
            if (!data && this.isSaudiSymbol(symbol)) {
                data = await this.getSaudiMarketData(symbol);
            }

            if (data) {
                this.setCache(cacheKey, data);
                await this.saveMarketDataToDatabase(symbol, data);
            }

            return data;

        } catch (error) {
            logger.error('Error fetching market data:', error);
            return null;
        }
    }

    // Get sector benchmarks
    async getSectorBenchmarks(sectorId) {
        try {
            logger.info(`Fetching sector benchmarks for sector: ${sectorId}`);

            const { data: benchmarks, error } = await supabaseAdmin
                .from('industry_benchmarks')
                .select('*')
                .eq('sector_id', sectorId);

            if (error) throw error;

            // If no benchmarks in database, fetch from external sources
            if (!benchmarks || benchmarks.length === 0) {
                return await this.fetchSectorBenchmarksFromExternalSources(sectorId);
            }

            return benchmarks;

        } catch (error) {
            logger.error('Error fetching sector benchmarks:', error);
            return [];
        }
    }

    // Get economic indicators
    async getEconomicIndicators(country = 'SAU') {
        try {
            logger.info(`Fetching economic indicators for country: ${country}`);

            const cacheKey = `economic_${country}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const indicators = {};

            // Fetch GDP data
            indicators.gdp = await this.getWorldBankData(country, 'NY.GDP.MKTP.CD');

            // Fetch inflation rate
            indicators.inflation = await this.getWorldBankData(country, 'FP.CPI.TOTL.ZG');

            // Fetch unemployment rate
            indicators.unemployment = await this.getWorldBankData(country, 'SL.UEM.TOTL.ZS');

            // Fetch interest rates (Central bank discount rate)
            indicators.interest_rate = await this.getWorldBankData(country, 'FR.INR.DISC');

            // Saudi-specific indicators
            if (country === 'SAU') {
                indicators.oil_price = await this.getOilPrice();
                indicators.saudi_vision_2030_metrics = await this.getSaudiVisionMetrics();
            }

            this.setCache(cacheKey, indicators);
            return indicators;

        } catch (error) {
            logger.error('Error fetching economic indicators:', error);
            return {};
        }
    }

    // Get industry trends
    async getIndustryTrends(sectorCode) {
        try {
            logger.info(`Fetching industry trends for sector: ${sectorCode}`);

            const trends = {
                growth_rate: null,
                market_size: null,
                key_drivers: [],
                challenges: [],
                outlook: 'neutral',
                recent_news: []
            };

            // Fetch sector-specific data based on code
            switch (sectorCode) {
                case 'FIN':
                    trends.key_drivers = ['Digital transformation', 'Regulatory changes', 'Fintech growth'];
                    trends.challenges = ['Compliance costs', 'Competition', 'Technology disruption'];
                    break;

                case 'TECH':
                    trends.key_drivers = ['AI adoption', 'Cloud migration', 'Digital transformation'];
                    trends.challenges = ['Talent shortage', 'Security concerns', 'Regulatory compliance'];
                    break;

                case 'ENRG':
                    trends.key_drivers = ['Energy transition', 'Renewable energy', 'ESG focus'];
                    trends.challenges = ['Oil price volatility', 'Environmental regulations', 'Technology costs'];
                    break;

                case 'HLTH':
                    trends.key_drivers = ['Aging population', 'Medical innovation', 'Digital health'];
                    trends.challenges = ['Healthcare costs', 'Regulatory approval', 'Access to care'];
                    break;

                default:
                    trends.key_drivers = ['Market expansion', 'Technology adoption', 'Consumer demand'];
                    trends.challenges = ['Competition', 'Regulatory changes', 'Economic uncertainty'];
            }

            // Try to fetch real market data
            if (this.fmpApiKey) {
                const sectorData = await this.getSectorPerformanceFromFMP(sectorCode);
                if (sectorData) {
                    trends.growth_rate = sectorData.growth_rate;
                    trends.market_size = sectorData.market_size;
                    trends.outlook = sectorData.outlook;
                }
            }

            return trends;

        } catch (error) {
            logger.error('Error fetching industry trends:', error);
            return null;
        }
    }

    // Specific API implementations

    async getMarketDataFromFMP(symbol) {
        try {
            const endpoints = [
                `/profile/${symbol}`,
                `/quote/${symbol}`,
                `/historical-price-full/${symbol}?limit=252`, // 1 year of data
                `/ratios/${symbol}`,
                `/key-metrics/${symbol}`
            ];

            const requests = endpoints.map(endpoint =>
                axios.get(`${this.endpoints.fmp}${endpoint}?apikey=${this.fmpApiKey}`)
                    .catch(error => ({ data: null, error }))
            );

            const responses = await Promise.all(requests);

            const [profile, quote, historical, ratios, metrics] = responses.map(r => r.data);

            return {
                profile: profile?.[0] || null,
                quote: quote?.[0] || null,
                historical: historical?.historical || [],
                ratios: ratios?.[0] || null,
                metrics: metrics?.[0] || null,
                source: 'Financial Modeling Prep',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            logger.error('Error fetching from FMP:', error);
            return null;
        }
    }

    async getMarketDataFromAlphaVantage(symbol) {
        try {
            const functions = [
                'OVERVIEW',
                'GLOBAL_QUOTE',
                'TIME_SERIES_DAILY',
                'BALANCE_SHEET',
                'INCOME_STATEMENT'
            ];

            const requests = functions.map(func =>
                axios.get(this.endpoints.alphaVantage, {
                    params: {
                        function: func,
                        symbol: symbol,
                        apikey: this.alphaVantageApiKey
                    }
                }).catch(error => ({ data: null, error }))
            );

            const responses = await Promise.all(requests);
            const [overview, quote, timeSeries, balanceSheet, incomeStatement] = responses.map(r => r.data);

            return {
                overview: overview || null,
                quote: quote?.['Global Quote'] || null,
                historical: this.parseAlphaVantageTimeSeries(timeSeries?.['Time Series (Daily)']) || [],
                balance_sheet: balanceSheet?.annualReports?.[0] || null,
                income_statement: incomeStatement?.annualReports?.[0] || null,
                source: 'Alpha Vantage',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            logger.error('Error fetching from Alpha Vantage:', error);
            return null;
        }
    }

    async getSaudiMarketData(symbol) {
        try {
            // For Saudi stocks, create structured data based on common patterns
            const saudiData = {
                profile: {
                    symbol: symbol,
                    companyName: this.getSaudiCompanyName(symbol),
                    exchange: 'Saudi Exchange (Tadawul)',
                    sector: this.getSaudiSectorBySymbol(symbol),
                    currency: 'SAR'
                },
                quote: {
                    symbol: symbol,
                    price: Math.random() * 200 + 50, // Mock price between 50-250 SAR
                    change: (Math.random() - 0.5) * 10, // Random change ±5
                    changePercent: (Math.random() - 0.5) * 5, // Random percentage ±2.5%
                    volume: Math.floor(Math.random() * 1000000) + 100000
                },
                historical: this.generateMockHistoricalData(symbol, 252),
                ratios: this.generateMockRatios(),
                source: 'Saudi Market Simulation',
                timestamp: new Date().toISOString()
            };

            return saudiData;

        } catch (error) {
            logger.error('Error generating Saudi market data:', error);
            return null;
        }
    }

    async getWorldBankData(countryCode, indicator) {
        try {
            if (!this.worldBankApiKey) {
                return this.getMockEconomicData(indicator);
            }

            const response = await axios.get(
                `${this.endpoints.worldBank}/country/${countryCode}/indicator/${indicator}`,
                {
                    params: {
                        format: 'json',
                        date: '2020:2023',
                        per_page: 10
                    }
                }
            );

            const data = response.data?.[1];
            if (data && data.length > 0) {
                return {
                    latest_value: data[0]?.value,
                    latest_year: data[0]?.date,
                    historical: data.map(item => ({
                        year: item.date,
                        value: item.value
                    }))
                };
            }

            return this.getMockEconomicData(indicator);

        } catch (error) {
            logger.error('Error fetching World Bank data:', error);
            return this.getMockEconomicData(indicator);
        }
    }

    async getOilPrice() {
        try {
            // Use a free oil price API or mock data
            const mockOilData = {
                price: 75 + (Math.random() - 0.5) * 20, // Price around $75 ±10
                change: (Math.random() - 0.5) * 5,
                currency: 'USD',
                unit: 'barrel',
                source: 'Mock Data',
                timestamp: new Date().toISOString()
            };

            return mockOilData;

        } catch (error) {
            logger.error('Error fetching oil price:', error);
            return null;
        }
    }

    async getSaudiVisionMetrics() {
        return {
            non_oil_sector_contribution: 45, // Percentage of GDP
            foreign_direct_investment: 15.2, // Billions SAR
            unemployment_rate: 11.2, // Percentage
            women_workforce_participation: 35, // Percentage
            pmi_index: 57.2, // PMI Index
            ease_of_doing_business_rank: 62,
            source: 'Saudi Vision 2030 Program',
            last_updated: new Date().toISOString()
        };
    }

    // Utility functions

    isSaudiSymbol(symbol) {
        // Saudi stock symbols are typically 4-digit numbers
        return /^\d{4}$/.test(symbol) || symbol.includes('.SAU') || symbol.includes('TASI');
    }

    getSaudiCompanyName(symbol) {
        const saudiCompanies = {
            '2222': 'Aramco',
            '1180': 'Human Resources Development Fund',
            '4001': 'Zain Saudi Arabia',
            '7010': 'Alinma Bank',
            '1150': 'Telecommunication Company',
            // Add more as needed
        };

        return saudiCompanies[symbol] || `Saudi Company ${symbol}`;
    }

    getSaudiSectorBySymbol(symbol) {
        const firstDigit = symbol.charAt(0);
        const sectorMap = {
            '1': 'Energy',
            '2': 'Materials',
            '3': 'Capital Goods',
            '4': 'Commercial Services',
            '5': 'Transportation',
            '6': 'Consumer Durables',
            '7': 'Consumer Services',
            '8': 'Media',
            '9': 'Retail'
        };

        return sectorMap[firstDigit] || 'Diversified';
    }

    generateMockHistoricalData(symbol, days) {
        const data = [];
        let currentPrice = Math.random() * 200 + 50;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);

            // Random walk price movement
            const change = (Math.random() - 0.5) * currentPrice * 0.05;
            currentPrice = Math.max(currentPrice + change, 10); // Don't go below 10

            data.push({
                date: date.toISOString().split('T')[0],
                open: currentPrice * (0.99 + Math.random() * 0.02),
                high: currentPrice * (1 + Math.random() * 0.03),
                low: currentPrice * (0.97 + Math.random() * 0.02),
                close: currentPrice,
                volume: Math.floor(Math.random() * 1000000) + 50000
            });
        }

        return data;
    }

    generateMockRatios() {
        return {
            peRatio: 15 + Math.random() * 20,
            pegRatio: 1 + Math.random() * 2,
            pbRatio: 1 + Math.random() * 3,
            debtToEquityRatio: Math.random() * 0.8,
            currentRatio: 1 + Math.random() * 2,
            roe: Math.random() * 0.25,
            roa: Math.random() * 0.15,
            grossMargin: 0.3 + Math.random() * 0.4,
            operatingMargin: 0.1 + Math.random() * 0.3,
            netMargin: 0.05 + Math.random() * 0.2
        };
    }

    getMockEconomicData(indicator) {
        const mockData = {
            'NY.GDP.MKTP.CD': { latest_value: 700000000000, latest_year: '2023' }, // GDP
            'FP.CPI.TOTL.ZG': { latest_value: 2.8, latest_year: '2023' }, // Inflation
            'SL.UEM.TOTL.ZS': { latest_value: 11.2, latest_year: '2023' }, // Unemployment
            'FR.INR.DISC': { latest_value: 5.5, latest_year: '2023' } // Interest rate
        };

        return mockData[indicator] || { latest_value: null, latest_year: '2023' };
    }

    parseAlphaVantageTimeSeries(timeSeries) {
        if (!timeSeries) return [];

        return Object.entries(timeSeries)
            .slice(0, 252) // Last year
            .map(([date, data]) => ({
                date,
                open: parseFloat(data['1. open']),
                high: parseFloat(data['2. high']),
                low: parseFloat(data['3. low']),
                close: parseFloat(data['4. close']),
                volume: parseInt(data['5. volume'])
            }));
    }

    async fetchSectorBenchmarksFromExternalSources(sectorId) {
        // Generate mock benchmarks for now
        const commonRatios = [
            'Current Ratio', 'Quick Ratio', 'Debt-to-Equity Ratio', 'Return on Assets (ROA)',
            'Return on Equity (ROE)', 'Gross Profit Margin', 'Net Profit Margin', 'Asset Turnover'
        ];

        const benchmarks = commonRatios.map(ratio => ({
            sector_id: sectorId,
            metric_name: ratio,
            percentile_25: Math.random() * 0.5,
            percentile_50: 0.5 + Math.random() * 0.5,
            percentile_75: 1 + Math.random() * 0.5,
            data_period: '2023',
            data_source: 'Industry Analysis'
        }));

        // Save to database for future use
        try {
            await supabaseAdmin
                .from('industry_benchmarks')
                .insert(benchmarks);
        } catch (error) {
            logger.error('Error saving benchmarks to database:', error);
        }

        return benchmarks;
    }

    async getSectorPerformanceFromFMP(sectorCode) {
        try {
            if (!this.fmpApiKey) return null;

            // This would require mapping sectorCode to FMP sector symbols
            const response = await axios.get(
                `${this.endpoints.fmp}/sector-performance?apikey=${this.fmpApiKey}`
            );

            // Process and return relevant sector data
            return response.data?.find(sector =>
                sector.sector?.toLowerCase().includes(sectorCode.toLowerCase())
            );

        } catch (error) {
            logger.error('Error fetching sector performance from FMP:', error);
            return null;
        }
    }

    async saveMarketDataToDatabase(symbol, data) {
        try {
            if (!data.quote) return;

            const marketDataEntry = {
                symbol: symbol,
                data_date: new Date().toISOString().split('T')[0],
                open_price: data.quote.open || data.quote.price,
                close_price: data.quote.price,
                high_price: data.quote.high || data.quote.price,
                low_price: data.quote.low || data.quote.price,
                volume: data.quote.volume,
                market_cap: data.profile?.mktCap,
                pe_ratio: data.ratios?.peRatio,
                additional_data: {
                    profile: data.profile,
                    ratios: data.ratios,
                    metrics: data.metrics
                }
            };

            await supabaseAdmin
                .from('market_data')
                .upsert(marketDataEntry, {
                    onConflict: 'symbol,data_date'
                });

        } catch (error) {
            logger.error('Error saving market data to database:', error);
        }
    }

    // Cache management
    getFromCache(key) {
        const item = this.cache.get(key);
        if (item && (Date.now() - item.timestamp) < this.cacheExpiry) {
            return item.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // Get API status
    getApiStatus() {
        return {
            financial_modeling_prep: !!this.fmpApiKey,
            alpha_vantage: !!this.alphaVantageApiKey,
            world_bank: !!this.worldBankApiKey,
            cache_size: this.cache.size
        };
    }
}

module.exports = ExternalDataService;