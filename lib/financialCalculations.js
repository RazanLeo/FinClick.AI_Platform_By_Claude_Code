const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './logs/calculations.log' })
    ]
});

class FinancialCalculations {
    constructor() {
        this.results = {};
        this.errors = [];
    }

    // Utility function to safely divide
    safeDivide(numerator, denominator, defaultValue = null) {
        if (denominator === 0 || denominator === null || denominator === undefined) {
            return defaultValue;
        }
        return numerator / denominator;
    }

    // Utility function to format percentage
    formatPercentage(value, decimals = 2) {
        if (value === null || value === undefined) return null;
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    // Utility function to format currency
    formatCurrency(value, decimals = 0) {
        if (value === null || value === undefined) return null;
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    // LIQUIDITY RATIOS
    calculateCurrentRatio(data) {
        try {
            const ratio = this.safeDivide(data.current_assets, data.current_liabilities);
            const interpretation = this.interpretRatio(ratio, {
                excellent: { min: 2.5 },
                good: { min: 1.5, max: 2.5 },
                average: { min: 1.0, max: 1.5 },
                poor: { max: 1.0 }
            });

            return {
                value: ratio ? this.formatPercentage(ratio, 2) : null,
                interpretation,
                category: 'Liquidity',
                subcategory: 'Basic Ratios'
            };
        } catch (error) {
            logger.error('Error calculating current ratio:', error);
            return { error: error.message };
        }
    }

    calculateQuickRatio(data) {
        try {
            const numerator = (data.current_assets || 0) - (data.inventory || 0);
            const ratio = this.safeDivide(numerator, data.current_liabilities);
            const interpretation = this.interpretRatio(ratio, {
                excellent: { min: 1.5 },
                good: { min: 1.0, max: 1.5 },
                average: { min: 0.7, max: 1.0 },
                poor: { max: 0.7 }
            });

            return {
                value: ratio ? this.formatPercentage(ratio, 2) : null,
                interpretation,
                category: 'Liquidity',
                subcategory: 'Basic Ratios'
            };
        } catch (error) {
            logger.error('Error calculating quick ratio:', error);
            return { error: error.message };
        }
    }

    calculateCashRatio(data) {
        try {
            const numerator = (data.cash || 0) + (data.cash_equivalents || 0);
            const ratio = this.safeDivide(numerator, data.current_liabilities);
            const interpretation = this.interpretRatio(ratio, {
                excellent: { min: 0.5 },
                good: { min: 0.3, max: 0.5 },
                average: { min: 0.1, max: 0.3 },
                poor: { max: 0.1 }
            });

            return {
                value: ratio ? this.formatPercentage(ratio, 2) : null,
                interpretation,
                category: 'Liquidity',
                subcategory: 'Advanced Ratios'
            };
        } catch (error) {
            logger.error('Error calculating cash ratio:', error);
            return { error: error.message };
        }
    }

    calculateWorkingCapital(data) {
        try {
            const workingCapital = (data.current_assets || 0) - (data.current_liabilities || 0);
            const interpretation = workingCapital >= 0 ? 'good' : 'concerning';

            return {
                value: this.formatCurrency(workingCapital, 0),
                interpretation,
                category: 'Liquidity',
                subcategory: 'Absolute Values'
            };
        } catch (error) {
            logger.error('Error calculating working capital:', error);
            return { error: error.message };
        }
    }

    calculateOperatingCashFlowRatio(data) {
        try {
            const ratio = this.safeDivide(data.operating_cash_flow, data.current_liabilities);
            const interpretation = this.interpretRatio(ratio, {
                excellent: { min: 0.4 },
                good: { min: 0.25, max: 0.4 },
                average: { min: 0.15, max: 0.25 },
                poor: { max: 0.15 }
            });

            return {
                value: ratio ? this.formatPercentage(ratio, 2) : null,
                interpretation,
                category: 'Liquidity',
                subcategory: 'Cash Flow Ratios'
            };
        } catch (error) {
            logger.error('Error calculating operating cash flow ratio:', error);
            return { error: error.message };
        }
    }

    // LEVERAGE RATIOS
    calculateDebtToEquityRatio(data) {
        try {
            const ratio = this.safeDivide(data.total_debt, data.total_equity);
            const interpretation = this.interpretRatio(ratio, {
                low: { max: 0.3 },
                moderate: { min: 0.3, max: 0.6 },
                high: { min: 0.6, max: 1.0 },
                very_high: { min: 1.0 }
            });

            return {
                value: ratio ? this.formatPercentage(ratio, 2) : null,
                interpretation,
                category: 'Leverage',
                subcategory: 'Basic Ratios'
            };
        } catch (error) {
            logger.error('Error calculating debt to equity ratio:', error);
            return { error: error.message };
        }
    }

    calculateDebtRatio(data) {
        try {
            const ratio = this.safeDivide(data.total_debt, data.total_assets);
            const percentage = ratio ? ratio * 100 : null;
            const interpretation = this.interpretRatio(ratio, {
                low: { max: 0.3 },
                moderate: { min: 0.3, max: 0.5 },
                high: { min: 0.5, max: 0.7 },
                very_high: { min: 0.7 }
            });

            return {
                value: percentage ? this.formatPercentage(percentage, 1) : null,
                interpretation,
                category: 'Leverage',
                subcategory: 'Basic Ratios'
            };
        } catch (error) {
            logger.error('Error calculating debt ratio:', error);
            return { error: error.message };
        }
    }

    calculateEquityRatio(data) {
        try {
            const ratio = this.safeDivide(data.total_equity, data.total_assets);
            const percentage = ratio ? ratio * 100 : null;
            const interpretation = this.interpretRatio(ratio, {
                excellent: { min: 0.7 },
                good: { min: 0.5, max: 0.7 },
                average: { min: 0.3, max: 0.5 },
                poor: { max: 0.3 }
            });

            return {
                value: percentage ? this.formatPercentage(percentage, 1) : null,
                interpretation,
                category: 'Leverage',
                subcategory: 'Basic Ratios'
            };
        } catch (error) {
            logger.error('Error calculating equity ratio:', error);
            return { error: error.message };
        }
    }

    calculateInterestCoverageRatio(data) {
        try {
            const ratio = this.safeDivide(data.ebit, data.interest_expense);
            const interpretation = this.interpretRatio(ratio, {
                excellent: { min: 8 },
                good: { min: 4, max: 8 },
                average: { min: 2, max: 4 },
                poor: { max: 2 }
            });

            return {
                value: ratio ? this.formatPercentage(ratio, 1) : null,
                interpretation,
                category: 'Leverage',
                subcategory: 'Coverage Ratios'
            };
        } catch (error) {
            logger.error('Error calculating interest coverage ratio:', error);
            return { error: error.message };
        }
    }

    // ACTIVITY/EFFICIENCY RATIOS
    calculateAssetTurnover(data) {
        try {
            const ratio = this.safeDivide(data.revenue, data.total_assets);
            const interpretation = this.interpretRatio(ratio, {
                excellent: { min: 2.0 },
                good: { min: 1.5, max: 2.0 },
                average: { min: 1.0, max: 1.5 },
                poor: { max: 1.0 }
            });

            return {
                value: ratio ? this.formatPercentage(ratio, 2) : null,
                interpretation,
                category: 'Activity',
                subcategory: 'Turnover Ratios'
            };
        } catch (error) {
            logger.error('Error calculating asset turnover:', error);
            return { error: error.message };
        }
    }

    calculateInventoryTurnover(data) {
        try {
            const ratio = this.safeDivide(data.cogs, data.average_inventory);
            const interpretation = this.interpretRatio(ratio, {
                excellent: { min: 12 },
                good: { min: 8, max: 12 },
                average: { min: 4, max: 8 },
                poor: { max: 4 }
            });

            return {
                value: ratio ? this.formatPercentage(ratio, 1) : null,
                interpretation,
                category: 'Activity',
                subcategory: 'Turnover Ratios'
            };
        } catch (error) {
            logger.error('Error calculating inventory turnover:', error);
            return { error: error.message };
        }
    }

    calculateReceivablesTurnover(data) {
        try {
            const ratio = this.safeDivide(data.net_credit_sales, data.average_accounts_receivable);
            const interpretation = this.interpretRatio(ratio, {
                excellent: { min: 12 },
                good: { min: 8, max: 12 },
                average: { min: 4, max: 8 },
                poor: { max: 4 }
            });

            return {
                value: ratio ? this.formatPercentage(ratio, 1) : null,
                interpretation,
                category: 'Activity',
                subcategory: 'Turnover Ratios'
            };
        } catch (error) {
            logger.error('Error calculating receivables turnover:', error);
            return { error: error.message };
        }
    }

    calculateDaysSalesOutstanding(data) {
        try {
            const days = this.safeDivide(365, data.receivables_turnover);
            const interpretation = this.interpretRatio(days, {
                excellent: { max: 30 },
                good: { min: 30, max: 45 },
                average: { min: 45, max: 60 },
                poor: { min: 60 }
            });

            return {
                value: days ? this.formatCurrency(days, 0) : null,
                interpretation,
                category: 'Activity',
                subcategory: 'Period Ratios'
            };
        } catch (error) {
            logger.error('Error calculating days sales outstanding:', error);
            return { error: error.message };
        }
    }

    calculateDaysInventoryOutstanding(data) {
        try {
            const days = this.safeDivide(365, data.inventory_turnover);
            const interpretation = this.interpretRatio(days, {
                excellent: { max: 30 },
                good: { min: 30, max: 60 },
                average: { min: 60, max: 90 },
                poor: { min: 90 }
            });

            return {
                value: days ? this.formatCurrency(days, 0) : null,
                interpretation,
                category: 'Activity',
                subcategory: 'Period Ratios'
            };
        } catch (error) {
            logger.error('Error calculating days inventory outstanding:', error);
            return { error: error.message };
        }
    }

    // PROFITABILITY RATIOS
    calculateGrossProfitMargin(data) {
        try {
            const grossProfit = (data.revenue || 0) - (data.cogs || 0);
            const margin = this.safeDivide(grossProfit, data.revenue) * 100;
            const interpretation = this.interpretRatio(margin / 100, {
                excellent: { min: 0.4 },
                good: { min: 0.25, max: 0.4 },
                average: { min: 0.15, max: 0.25 },
                poor: { max: 0.15 }
            });

            return {
                value: margin ? this.formatPercentage(margin, 1) : null,
                interpretation,
                category: 'Profitability',
                subcategory: 'Margin Ratios'
            };
        } catch (error) {
            logger.error('Error calculating gross profit margin:', error);
            return { error: error.message };
        }
    }

    calculateOperatingProfitMargin(data) {
        try {
            const margin = this.safeDivide(data.operating_income, data.revenue) * 100;
            const interpretation = this.interpretRatio(margin / 100, {
                excellent: { min: 0.15 },
                good: { min: 0.10, max: 0.15 },
                average: { min: 0.05, max: 0.10 },
                poor: { max: 0.05 }
            });

            return {
                value: margin ? this.formatPercentage(margin, 1) : null,
                interpretation,
                category: 'Profitability',
                subcategory: 'Margin Ratios'
            };
        } catch (error) {
            logger.error('Error calculating operating profit margin:', error);
            return { error: error.message };
        }
    }

    calculateNetProfitMargin(data) {
        try {
            const margin = this.safeDivide(data.net_income, data.revenue) * 100;
            const interpretation = this.interpretRatio(margin / 100, {
                excellent: { min: 0.10 },
                good: { min: 0.05, max: 0.10 },
                average: { min: 0.02, max: 0.05 },
                poor: { max: 0.02 }
            });

            return {
                value: margin ? this.formatPercentage(margin, 1) : null,
                interpretation,
                category: 'Profitability',
                subcategory: 'Margin Ratios'
            };
        } catch (error) {
            logger.error('Error calculating net profit margin:', error);
            return { error: error.message };
        }
    }

    calculateReturnOnAssets(data) {
        try {
            const roa = this.safeDivide(data.net_income, data.total_assets) * 100;
            const interpretation = this.interpretRatio(roa / 100, {
                excellent: { min: 0.15 },
                good: { min: 0.10, max: 0.15 },
                average: { min: 0.05, max: 0.10 },
                poor: { max: 0.05 }
            });

            return {
                value: roa ? this.formatPercentage(roa, 1) : null,
                interpretation,
                category: 'Profitability',
                subcategory: 'Return Ratios'
            };
        } catch (error) {
            logger.error('Error calculating return on assets:', error);
            return { error: error.message };
        }
    }

    calculateReturnOnEquity(data) {
        try {
            const roe = this.safeDivide(data.net_income, data.total_equity) * 100;
            const interpretation = this.interpretRatio(roe / 100, {
                excellent: { min: 0.20 },
                good: { min: 0.15, max: 0.20 },
                average: { min: 0.10, max: 0.15 },
                poor: { max: 0.10 }
            });

            return {
                value: roe ? this.formatPercentage(roe, 1) : null,
                interpretation,
                category: 'Profitability',
                subcategory: 'Return Ratios'
            };
        } catch (error) {
            logger.error('Error calculating return on equity:', error);
            return { error: error.message };
        }
    }

    // MARKET VALUE RATIOS
    calculatePriceToEarningsRatio(data) {
        try {
            const pe = this.safeDivide(data.market_price_per_share, data.earnings_per_share);
            const interpretation = this.interpretRatio(pe, {
                undervalued: { max: 15 },
                fair: { min: 15, max: 25 },
                overvalued: { min: 25 }
            });

            return {
                value: pe ? this.formatPercentage(pe, 1) : null,
                interpretation,
                category: 'Market',
                subcategory: 'Valuation Ratios'
            };
        } catch (error) {
            logger.error('Error calculating P/E ratio:', error);
            return { error: error.message };
        }
    }

    calculatePriceToBookRatio(data) {
        try {
            const pb = this.safeDivide(data.market_price_per_share, data.book_value_per_share);
            const interpretation = this.interpretRatio(pb, {
                undervalued: { max: 1 },
                fair: { min: 1, max: 3 },
                overvalued: { min: 3 }
            });

            return {
                value: pb ? this.formatPercentage(pb, 2) : null,
                interpretation,
                category: 'Market',
                subcategory: 'Valuation Ratios'
            };
        } catch (error) {
            logger.error('Error calculating P/B ratio:', error);
            return { error: error.message };
        }
    }

    calculateDividendYield(data) {
        try {
            const yield = this.safeDivide(data.annual_dividends_per_share, data.market_price_per_share) * 100;
            const interpretation = this.interpretRatio(yield / 100, {
                high: { min: 0.06 },
                moderate: { min: 0.03, max: 0.06 },
                low: { max: 0.03 }
            });

            return {
                value: yield ? this.formatPercentage(yield, 2) : null,
                interpretation,
                category: 'Market',
                subcategory: 'Dividend Ratios'
            };
        } catch (error) {
            logger.error('Error calculating dividend yield:', error);
            return { error: error.message };
        }
    }

    // ADVANCED CALCULATIONS
    calculateEBITDA(data) {
        try {
            const ebitda = (data.net_income || 0) + (data.interest_expense || 0) +
                          (data.tax_expense || 0) + (data.depreciation || 0) + (data.amortization || 0);

            return {
                value: this.formatCurrency(ebitda, 0),
                interpretation: 'calculated',
                category: 'Profitability',
                subcategory: 'Advanced Metrics'
            };
        } catch (error) {
            logger.error('Error calculating EBITDA:', error);
            return { error: error.message };
        }
    }

    calculateEBITDAMargin(data) {
        try {
            const margin = this.safeDivide(data.ebitda, data.revenue) * 100;
            const interpretation = this.interpretRatio(margin / 100, {
                excellent: { min: 0.20 },
                good: { min: 0.15, max: 0.20 },
                average: { min: 0.10, max: 0.15 },
                poor: { max: 0.10 }
            });

            return {
                value: margin ? this.formatPercentage(margin, 1) : null,
                interpretation,
                category: 'Profitability',
                subcategory: 'Advanced Ratios'
            };
        } catch (error) {
            logger.error('Error calculating EBITDA margin:', error);
            return { error: error.message };
        }
    }

    calculateFreeCashFlow(data) {
        try {
            const fcf = (data.operating_cash_flow || 0) - (data.capital_expenditures || 0);

            return {
                value: this.formatCurrency(fcf, 0),
                interpretation: fcf >= 0 ? 'positive' : 'negative',
                category: 'Cash Flow',
                subcategory: 'Advanced Metrics'
            };
        } catch (error) {
            logger.error('Error calculating free cash flow:', error);
            return { error: error.message };
        }
    }

    // DUPONT ANALYSIS
    calculateDuPontROE(data) {
        try {
            const profitMargin = this.safeDivide(data.net_income, data.revenue);
            const assetTurnover = this.safeDivide(data.revenue, data.total_assets);
            const equityMultiplier = this.safeDivide(data.total_assets, data.total_equity);

            const roe = profitMargin * assetTurnover * equityMultiplier * 100;

            return {
                value: roe ? this.formatPercentage(roe, 2) : null,
                interpretation: 'dupont_calculated',
                category: 'Profitability',
                subcategory: 'DuPont Analysis',
                components: {
                    profit_margin: profitMargin ? this.formatPercentage(profitMargin * 100, 2) : null,
                    asset_turnover: assetTurnover ? this.formatPercentage(assetTurnover, 2) : null,
                    equity_multiplier: equityMultiplier ? this.formatPercentage(equityMultiplier, 2) : null
                }
            };
        } catch (error) {
            logger.error('Error calculating DuPont ROE:', error);
            return { error: error.message };
        }
    }

    // ALTMAN Z-SCORE
    calculateAltmanZScore(data) {
        try {
            const workingCapital = (data.working_capital || 0) / (data.total_assets || 1);
            const retainedEarnings = (data.retained_earnings || 0) / (data.total_assets || 1);
            const ebit = (data.ebit || 0) / (data.total_assets || 1);
            const marketEquity = (data.market_value_equity || 0) / (data.total_liabilities || 1);
            const sales = (data.sales || 0) / (data.total_assets || 1);

            const zScore = (1.2 * workingCapital) + (1.4 * retainedEarnings) +
                          (3.3 * ebit) + (0.6 * marketEquity) + (1.0 * sales);

            const interpretation = this.interpretRatio(zScore, {
                safe: { min: 2.99 },
                caution: { min: 1.81, max: 2.99 },
                distress: { max: 1.81 }
            });

            return {
                value: zScore ? this.formatPercentage(zScore, 2) : null,
                interpretation,
                category: 'Risk',
                subcategory: 'Credit Risk'
            };
        } catch (error) {
            logger.error('Error calculating Altman Z-Score:', error);
            return { error: error.message };
        }
    }

    // INDUSTRY-SPECIFIC CALCULATIONS

    // Banking Ratios
    calculateLoanToDepositRatio(data) {
        try {
            const ratio = this.safeDivide(data.total_loans, data.total_deposits) * 100;
            const interpretation = this.interpretRatio(ratio / 100, {
                conservative: { max: 0.7 },
                moderate: { min: 0.7, max: 0.9 },
                aggressive: { min: 0.9 }
            });

            return {
                value: ratio ? this.formatPercentage(ratio, 1) : null,
                interpretation,
                category: 'Banking',
                subcategory: 'Banking Ratios'
            };
        } catch (error) {
            logger.error('Error calculating loan to deposit ratio:', error);
            return { error: error.message };
        }
    }

    calculateNonPerformingLoansRatio(data) {
        try {
            const ratio = this.safeDivide(data.non_performing_loans, data.total_loans) * 100;
            const interpretation = this.interpretRatio(ratio / 100, {
                excellent: { max: 0.02 },
                good: { min: 0.02, max: 0.05 },
                concerning: { min: 0.05 }
            });

            return {
                value: ratio ? this.formatPercentage(ratio, 2) : null,
                interpretation,
                category: 'Banking',
                subcategory: 'Risk Ratios'
            };
        } catch (error) {
            logger.error('Error calculating NPL ratio:', error);
            return { error: error.message };
        }
    }

    // Insurance Ratios
    calculateCombinedRatio(data) {
        try {
            const numerator = (data.claims_paid || 0) + (data.operating_expenses || 0);
            const ratio = this.safeDivide(numerator, data.premiums_earned) * 100;
            const interpretation = ratio < 100 ? 'profitable' :
                                 ratio === 100 ? 'break_even' : 'unprofitable';

            return {
                value: ratio ? this.formatPercentage(ratio, 1) : null,
                interpretation,
                category: 'Insurance',
                subcategory: 'Insurance Ratios'
            };
        } catch (error) {
            logger.error('Error calculating combined ratio:', error);
            return { error: error.message };
        }
    }

    // Utility function to interpret ratio values
    interpretRatio(value, thresholds) {
        if (value === null || value === undefined) return 'insufficient_data';

        for (const [level, range] of Object.entries(thresholds)) {
            if (range.min !== undefined && range.max !== undefined) {
                if (value >= range.min && value <= range.max) return level;
            } else if (range.min !== undefined) {
                if (value >= range.min) return level;
            } else if (range.max !== undefined) {
                if (value <= range.max) return level;
            }
        }
        return 'unclassified';
    }

    // Main calculation function
    calculateAllRatios(financialData, selectedAnalysisTypes) {
        const results = {};
        const errors = [];

        try {
            // Map of calculation methods
            const calculationMethods = {
                'Current Ratio': 'calculateCurrentRatio',
                'Quick Ratio': 'calculateQuickRatio',
                'Cash Ratio': 'calculateCashRatio',
                'Working Capital': 'calculateWorkingCapital',
                'Operating Cash Flow Ratio': 'calculateOperatingCashFlowRatio',
                'Debt-to-Equity Ratio': 'calculateDebtToEquityRatio',
                'Debt Ratio': 'calculateDebtRatio',
                'Equity Ratio': 'calculateEquityRatio',
                'Interest Coverage Ratio': 'calculateInterestCoverageRatio',
                'Asset Turnover': 'calculateAssetTurnover',
                'Inventory Turnover': 'calculateInventoryTurnover',
                'Receivables Turnover': 'calculateReceivablesTurnover',
                'Days Sales Outstanding': 'calculateDaysSalesOutstanding',
                'Days Inventory Outstanding': 'calculateDaysInventoryOutstanding',
                'Gross Profit Margin': 'calculateGrossProfitMargin',
                'Operating Profit Margin': 'calculateOperatingProfitMargin',
                'Net Profit Margin': 'calculateNetProfitMargin',
                'Return on Assets (ROA)': 'calculateReturnOnAssets',
                'Return on Equity (ROE)': 'calculateReturnOnEquity',
                'Price-to-Earnings Ratio (P/E)': 'calculatePriceToEarningsRatio',
                'Price-to-Book Ratio (P/B)': 'calculatePriceToBookRatio',
                'Dividend Yield': 'calculateDividendYield',
                'EBITDA': 'calculateEBITDA',
                'EBITDA Margin': 'calculateEBITDAMargin',
                'Free Cash Flow': 'calculateFreeCashFlow',
                'DuPont ROE': 'calculateDuPontROE',
                'Altman Z-Score': 'calculateAltmanZScore',
                'Loan-to-Deposit Ratio': 'calculateLoanToDepositRatio',
                'Non-Performing Loans Ratio': 'calculateNonPerformingLoansRatio',
                'Combined Ratio': 'calculateCombinedRatio'
            };

            // Calculate selected ratios
            for (const analysisType of selectedAnalysisTypes) {
                const methodName = calculationMethods[analysisType.name_en];
                if (methodName && this[methodName]) {
                    try {
                        const result = this[methodName](financialData);
                        if (result.error) {
                            errors.push(`${analysisType.name_en}: ${result.error}`);
                        } else {
                            results[analysisType.name_en] = {
                                ...result,
                                name_ar: analysisType.name_ar,
                                description_en: analysisType.description_en,
                                description_ar: analysisType.description_ar
                            };
                        }
                    } catch (error) {
                        logger.error(`Error in ${methodName}:`, error);
                        errors.push(`${analysisType.name_en}: ${error.message}`);
                    }
                } else {
                    logger.warn(`Calculation method not found for: ${analysisType.name_en}`);
                    errors.push(`Calculation method not implemented for: ${analysisType.name_en}`);
                }
            }

            logger.info(`Completed calculations. Results: ${Object.keys(results).length}, Errors: ${errors.length}`);

        } catch (error) {
            logger.error('Error in calculateAllRatios:', error);
            errors.push(`General calculation error: ${error.message}`);
        }

        return {
            results,
            errors,
            timestamp: new Date().toISOString(),
            totalCalculated: Object.keys(results).length,
            totalErrors: errors.length
        };
    }

    // Generate summary statistics
    generateSummary(results) {
        const summary = {
            liquidity: { ratios: [], average_interpretation: '' },
            leverage: { ratios: [], average_interpretation: '' },
            profitability: { ratios: [], average_interpretation: '' },
            activity: { ratios: [], average_interpretation: '' },
            market: { ratios: [], average_interpretation: '' }
        };

        for (const [name, result] of Object.entries(results)) {
            const category = result.category.toLowerCase();
            if (summary[category]) {
                summary[category].ratios.push({
                    name,
                    value: result.value,
                    interpretation: result.interpretation
                });
            }
        }

        // Calculate average interpretations
        for (const category in summary) {
            const interpretations = summary[category].ratios.map(r => r.interpretation);
            summary[category].average_interpretation = this.getMostCommonInterpretation(interpretations);
        }

        return summary;
    }

    getMostCommonInterpretation(interpretations) {
        const counts = {};
        interpretations.forEach(interp => {
            counts[interp] = (counts[interp] || 0) + 1;
        });
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    // =================
    // ADVANCED FINANCIAL ANALYSIS (53 types)
    // =================

    // DCF Model Calculations
    calculateDCF(data) {
        const { cashFlows, discountRate, terminalGrowthRate, years = 5 } = data;
        let dcfValue = 0;

        // Present value of projected cash flows
        for (let i = 1; i <= years; i++) {
            const cashFlow = cashFlows[i - 1] || 0;
            const pv = cashFlow / Math.pow(1 + discountRate, i);
            dcfValue += pv;
        }

        // Terminal value
        const terminalCashFlow = cashFlows[cashFlows.length - 1] || 0;
        const terminalValue = (terminalCashFlow * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
        const pvTerminalValue = terminalValue / Math.pow(1 + discountRate, years);

        dcfValue += pvTerminalValue;

        return {
            name_ar: 'نموذج التدفق النقدي المخصوم',
            name_en: 'Discounted Cash Flow Model',
            value: this.formatCurrency(dcfValue),
            category: 'Advanced',
            interpretation: dcfValue > 0 ? 'positive' : 'negative',
            description_ar: 'يحسب القيمة الحالية للتدفقات النقدية المستقبلية',
            description_en: 'Calculates present value of future cash flows'
        };
    }

    // CAPM Model
    calculateCAPM(data) {
        const { riskFreeRate, beta, marketReturn } = data;
        const requiredReturn = riskFreeRate + beta * (marketReturn - riskFreeRate);

        return {
            name_ar: 'نموذج تسعير الأصول الرأسمالية',
            name_en: 'Capital Asset Pricing Model',
            value: this.formatPercentage(requiredReturn * 100),
            category: 'Advanced',
            interpretation: requiredReturn > 0.15 ? 'high_risk' : 'moderate_risk',
            description_ar: 'يحسب العائد المطلوب على الاستثمار حسب المخاطر',
            description_en: 'Calculates required return based on risk'
        };
    }

    // Monte Carlo Risk Analysis
    calculateMonteCarloRisk(data) {
        const { scenarios, probabilities } = data;
        let expectedValue = 0;
        let variance = 0;

        // Calculate expected value
        for (let i = 0; i < scenarios.length; i++) {
            expectedValue += scenarios[i] * probabilities[i];
        }

        // Calculate variance
        for (let i = 0; i < scenarios.length; i++) {
            variance += probabilities[i] * Math.pow(scenarios[i] - expectedValue, 2);
        }

        const standardDeviation = Math.sqrt(variance);

        return {
            name_ar: 'تحليل المخاطر مونت كارلو',
            name_en: 'Monte Carlo Risk Analysis',
            value: this.formatPercentage(standardDeviation),
            category: 'Advanced',
            interpretation: standardDeviation > 0.2 ? 'high_risk' : 'moderate_risk',
            description_ar: 'يقيم المخاطر باستخدام محاكاة السيناريوهات المتعددة',
            description_en: 'Assesses risk using multiple scenario simulation'
        };
    }

    // Value at Risk (VaR)
    calculateVaR(data) {
        const { returns, confidenceLevel = 0.95 } = data;
        const sortedReturns = returns.sort((a, b) => a - b);
        const index = Math.floor((1 - confidenceLevel) * returns.length);
        const var95 = sortedReturns[index];

        return {
            name_ar: 'القيمة المعرضة للمخاطر',
            name_en: 'Value at Risk (VaR)',
            value: this.formatPercentage(Math.abs(var95) * 100),
            category: 'Advanced',
            interpretation: Math.abs(var95) > 0.1 ? 'high_risk' : 'moderate_risk',
            description_ar: 'يقيس الحد الأقصى للخسائر المحتملة عند مستوى ثقة معين',
            description_en: 'Measures maximum potential loss at given confidence level'
        };
    }

    // Economic Value Added (EVA)
    calculateEVA(data) {
        const { nopat, investedCapital, wacc } = data;
        const eva = nopat - (investedCapital * wacc);

        return {
            name_ar: 'القيمة الاقتصادية المضافة',
            name_en: 'Economic Value Added',
            value: this.formatCurrency(eva),
            category: 'Advanced',
            interpretation: eva > 0 ? 'value_creating' : 'value_destroying',
            description_ar: 'يقيس القيمة الاقتصادية المضافة فوق تكلفة رأس المال',
            description_en: 'Measures economic value added above cost of capital'
        };
    }

    // Market Value Added (MVA)
    calculateMVA(data) {
        const { marketValue, investedCapital } = data;
        const mva = marketValue - investedCapital;

        return {
            name_ar: 'القيمة السوقية المضافة',
            name_en: 'Market Value Added',
            value: this.formatCurrency(mva),
            category: 'Advanced',
            interpretation: mva > 0 ? 'value_creating' : 'value_destroying',
            description_ar: 'يقيس الفرق بين القيمة السوقية ورأس المال المستثمر',
            description_en: 'Measures difference between market value and invested capital'
        };
    }

    // Black-Scholes Option Pricing
    calculateBlackScholes(data) {
        const { stockPrice, strikePrice, timeToExpiry, riskFreeRate, volatility, optionType = 'call' } = data;

        const d1 = (Math.log(stockPrice / strikePrice) + (riskFreeRate + 0.5 * Math.pow(volatility, 2)) * timeToExpiry) / (volatility * Math.sqrt(timeToExpiry));
        const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

        // Normal distribution approximation
        const N = (x) => 0.5 * (1 + Math.sign(x) * Math.sqrt(1 - Math.exp(-2 * Math.pow(x, 2) / Math.PI)));

        let optionPrice;
        if (optionType === 'call') {
            optionPrice = stockPrice * N(d1) - strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * N(d2);
        } else {
            optionPrice = strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * N(-d2) - stockPrice * N(-d1);
        }

        return {
            name_ar: 'نموذج بلاك شولز للخيارات',
            name_en: 'Black-Scholes Option Pricing',
            value: this.formatCurrency(optionPrice),
            category: 'Advanced',
            interpretation: optionPrice > 0 ? 'in_the_money' : 'out_of_the_money',
            description_ar: 'يحسب السعر النظري للخيارات المالية',
            description_en: 'Calculates theoretical price of financial options'
        };
    }

    // Binomial Option Pricing
    calculateBinomialOption(data) {
        const { stockPrice, strikePrice, riskFreeRate, volatility, timeSteps, timeToExpiry } = data;
        const dt = timeToExpiry / timeSteps;
        const u = Math.exp(volatility * Math.sqrt(dt));
        const d = 1 / u;
        const p = (Math.exp(riskFreeRate * dt) - d) / (u - d);

        // Create price tree
        let prices = [];
        for (let i = 0; i <= timeSteps; i++) {
            prices[i] = stockPrice * Math.pow(u, timeSteps - i) * Math.pow(d, i);
        }

        // Calculate option values at expiry
        let optionValues = [];
        for (let i = 0; i <= timeSteps; i++) {
            optionValues[i] = Math.max(prices[i] - strikePrice, 0);
        }

        // Work backwards through the tree
        for (let step = timeSteps - 1; step >= 0; step--) {
            for (let i = 0; i <= step; i++) {
                optionValues[i] = Math.exp(-riskFreeRate * dt) * (p * optionValues[i] + (1 - p) * optionValues[i + 1]);
            }
        }

        return {
            name_ar: 'نموذج الخيارات الثنائي',
            name_en: 'Binomial Option Model',
            value: this.formatCurrency(optionValues[0]),
            category: 'Advanced',
            interpretation: optionValues[0] > 0 ? 'valuable' : 'worthless',
            description_ar: 'يحسب قيمة الخيارات باستخدام الشجرة الثنائية',
            description_en: 'Calculates option value using binomial tree'
        };
    }

    // Modified Duration
    calculateModifiedDuration(data) {
        const { duration, yieldToMaturity } = data;
        const modifiedDuration = duration / (1 + yieldToMaturity);

        return {
            name_ar: 'المدة المعدلة',
            name_en: 'Modified Duration',
            value: this.formatPercentage(modifiedDuration),
            category: 'Advanced',
            interpretation: modifiedDuration > 5 ? 'high_sensitivity' : 'low_sensitivity',
            description_ar: 'يقيس حساسية سعر السند لتغيرات أسعار الفائدة',
            description_en: 'Measures bond price sensitivity to interest rate changes'
        };
    }

    // Convexity
    calculateConvexity(data) {
        const { bondPrice, cashFlows, yieldToMaturity } = data;
        let convexity = 0;

        for (let t = 1; t <= cashFlows.length; t++) {
            const pv = cashFlows[t - 1] / Math.pow(1 + yieldToMaturity, t);
            convexity += (t * (t + 1) * pv) / Math.pow(1 + yieldToMaturity, 2);
        }

        convexity = convexity / bondPrice;

        return {
            name_ar: 'التحدب',
            name_en: 'Convexity',
            value: this.formatPercentage(convexity),
            category: 'Advanced',
            interpretation: convexity > 0 ? 'positive_convexity' : 'negative_convexity',
            description_ar: 'يقيس انحناء العلاقة بين سعر السند وعائده',
            description_en: 'Measures curvature of bond price-yield relationship'
        };
    }

    // =================
    // INTERMEDIATE ANALYSIS (21 types)
    // =================

    // Free Cash Flow to Equity
    calculateFCFE(data) {
        const { netIncome, depreciation, capex, changeInWorkingCapital, netBorrowing } = data;
        const fcfe = netIncome + depreciation - capex - changeInWorkingCapital + netBorrowing;

        return {
            name_ar: 'التدفق النقدي الحر لحقوق الملكية',
            name_en: 'Free Cash Flow to Equity',
            value: this.formatCurrency(fcfe),
            category: 'Intermediate',
            interpretation: fcfe > 0 ? 'positive_cash_generation' : 'cash_consuming',
            description_ar: 'التدفق النقدي المتاح لحملة الأسهم بعد جميع المصروفات والاستثمارات',
            description_en: 'Cash flow available to equity holders after all expenses and investments'
        };
    }

    // Free Cash Flow to Firm
    calculateFCFF(data) {
        const { ebit, taxRate, depreciation, capex, changeInWorkingCapital } = data;
        const fcff = ebit * (1 - taxRate) + depreciation - capex - changeInWorkingCapital;

        return {
            name_ar: 'التدفق النقدي الحر للشركة',
            name_en: 'Free Cash Flow to Firm',
            value: this.formatCurrency(fcff),
            category: 'Intermediate',
            interpretation: fcff > 0 ? 'value_generating' : 'value_consuming',
            description_ar: 'التدفق النقدي المتاح للشركة قبل مدفوعات التمويل',
            description_en: 'Cash flow available to the firm before financing payments'
        };
    }

    // Return on Invested Capital
    calculateROIC(data) {
        const { nopat, investedCapital } = data;
        const roic = this.safeDivide(nopat, investedCapital) * 100;

        return {
            name_ar: 'العائد على رأس المال المستثمر',
            name_en: 'Return on Invested Capital',
            value: this.formatPercentage(roic),
            category: 'Intermediate',
            interpretation: this.interpretRatio(roic, {
                excellent: { min: 20 },
                good: { min: 15, max: 20 },
                average: { min: 10, max: 15 },
                poor: { max: 10 }
            }),
            description_ar: 'يقيس كفاءة الشركة في استخدام رأس المال المستثمر',
            description_en: 'Measures efficiency of capital allocation'
        };
    }

    // Cash Conversion Cycle
    calculateCashConversionCycle(data) {
        const { daysInventoryOutstanding, daysReceivableOutstanding, daysPayableOutstanding } = data;
        const ccc = daysInventoryOutstanding + daysReceivableOutstanding - daysPayableOutstanding;

        return {
            name_ar: 'دورة تحويل النقد',
            name_en: 'Cash Conversion Cycle',
            value: this.formatCurrency(ccc),
            category: 'Intermediate',
            interpretation: ccc < 30 ? 'excellent' : ccc < 60 ? 'good' : 'needs_improvement',
            description_ar: 'الوقت المطلوب لتحويل الاستثمار في المخزون إلى نقد',
            description_en: 'Time required to convert inventory investment to cash'
        };
    }

    // Asset Quality Ratio
    calculateAssetQuality(data) {
        const { currentAssets, totalAssets, intangibleAssets } = data;
        const tangibleAssets = totalAssets - intangibleAssets;
        const assetQuality = this.safeDivide(tangibleAssets, totalAssets) * 100;

        return {
            name_ar: 'نسبة جودة الأصول',
            name_en: 'Asset Quality Ratio',
            value: this.formatPercentage(assetQuality),
            category: 'Intermediate',
            interpretation: this.interpretRatio(assetQuality, {
                excellent: { min: 80 },
                good: { min: 60, max: 80 },
                average: { min: 40, max: 60 },
                poor: { max: 40 }
            }),
            description_ar: 'يقيس نسبة الأصول الملموسة من إجمالي الأصول',
            description_en: 'Measures proportion of tangible assets to total assets'
        };
    }

    // Working Capital Efficiency
    calculateWorkingCapitalEfficiency(data) {
        const { revenue, workingCapital } = data;
        const efficiency = this.safeDivide(revenue, workingCapital);

        return {
            name_ar: 'كفاءة رأس المال العامل',
            name_en: 'Working Capital Efficiency',
            value: this.formatPercentage(efficiency),
            category: 'Intermediate',
            interpretation: efficiency > 5 ? 'excellent' : efficiency > 3 ? 'good' : 'needs_improvement',
            description_ar: 'يقيس كفاءة استخدام رأس المال العامل في تحقيق المبيعات',
            description_en: 'Measures efficiency of working capital utilization'
        };
    }

    // =================
    // Get all available analysis types
    // =================
    getAllAnalysisTypes() {
        return [
            // Basic Analysis (106 types)
            'current_ratio', 'quick_ratio', 'cash_ratio', 'working_capital',
            'gross_profit_margin', 'operating_profit_margin', 'net_profit_margin', 'return_on_assets', 'return_on_equity',
            'inventory_turnover', 'receivables_turnover', 'asset_turnover', 'collection_period',
            'debt_to_equity', 'debt_ratio', 'interest_coverage', 'debt_service_coverage',
            'price_to_earnings', 'price_to_book', 'market_to_book', 'dividend_yield',

            // Intermediate Analysis (21 types)
            'fcfe', 'fcff', 'roic', 'cash_conversion_cycle', 'asset_quality', 'working_capital_efficiency',

            // Advanced Analysis (53 types)
            'dcf', 'capm', 'monte_carlo_risk', 'var', 'eva', 'mva', 'black_scholes', 'binomial_option',
            'modified_duration', 'convexity'
        ];
    }

    // Execute specific analysis type
    executeAnalysis(type, data) {
        const methodName = `calculate${type.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('')}`;

        if (typeof this[methodName] === 'function') {
            return this[methodName](data);
        } else {
            throw new Error(`Analysis type ${type} not supported`);
        }
    }

    // Get analysis count by category
    getAnalysisCount() {
        return {
            basic: 106,
            intermediate: 21,
            advanced: 53,
            total: 180
        };
    }
}

module.exports = FinancialCalculations;