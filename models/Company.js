const mongoose = require('mongoose');

const FinancialStatementSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  balanceSheet: {
    // Assets
    currentAssets: {
      cash: { type: Number, default: 0 },
      shortTermInvestments: { type: Number, default: 0 },
      accountsReceivable: { type: Number, default: 0 },
      inventory: { type: Number, default: 0 },
      prepaidExpenses: { type: Number, default: 0 },
      otherCurrentAssets: { type: Number, default: 0 },
      totalCurrentAssets: { type: Number, default: 0 }
    },
    nonCurrentAssets: {
      propertyPlantEquipment: { type: Number, default: 0 },
      intangibleAssets: { type: Number, default: 0 },
      longTermInvestments: { type: Number, default: 0 },
      otherNonCurrentAssets: { type: Number, default: 0 },
      totalNonCurrentAssets: { type: Number, default: 0 }
    },
    totalAssets: { type: Number, default: 0 },

    // Liabilities
    currentLiabilities: {
      accountsPayable: { type: Number, default: 0 },
      shortTermDebt: { type: Number, default: 0 },
      accruedLiabilities: { type: Number, default: 0 },
      otherCurrentLiabilities: { type: Number, default: 0 },
      totalCurrentLiabilities: { type: Number, default: 0 }
    },
    nonCurrentLiabilities: {
      longTermDebt: { type: Number, default: 0 },
      deferredTaxLiabilities: { type: Number, default: 0 },
      otherNonCurrentLiabilities: { type: Number, default: 0 },
      totalNonCurrentLiabilities: { type: Number, default: 0 }
    },
    totalLiabilities: { type: Number, default: 0 },

    // Equity
    shareholdersEquity: {
      shareCapital: { type: Number, default: 0 },
      retainedEarnings: { type: Number, default: 0 },
      otherEquity: { type: Number, default: 0 },
      totalEquity: { type: Number, default: 0 }
    }
  },

  incomeStatement: {
    revenue: { type: Number, default: 0 },
    costOfGoodsSold: { type: Number, default: 0 },
    grossProfit: { type: Number, default: 0 },
    operatingExpenses: {
      sellingExpenses: { type: Number, default: 0 },
      administrativeExpenses: { type: Number, default: 0 },
      researchDevelopment: { type: Number, default: 0 },
      otherOperatingExpenses: { type: Number, default: 0 },
      totalOperatingExpenses: { type: Number, default: 0 }
    },
    operatingIncome: { type: Number, default: 0 },
    nonOperatingIncome: { type: Number, default: 0 },
    interestExpense: { type: Number, default: 0 },
    earningsBeforeTax: { type: Number, default: 0 },
    taxExpense: { type: Number, default: 0 },
    netIncome: { type: Number, default: 0 },
    ebitda: { type: Number, default: 0 }
  },

  cashFlowStatement: {
    operatingCashFlow: {
      netIncome: { type: Number, default: 0 },
      depreciation: { type: Number, default: 0 },
      workingCapitalChanges: { type: Number, default: 0 },
      otherOperatingActivities: { type: Number, default: 0 },
      totalOperatingCashFlow: { type: Number, default: 0 }
    },
    investingCashFlow: {
      capitalExpenditures: { type: Number, default: 0 },
      acquisitions: { type: Number, default: 0 },
      otherInvestingActivities: { type: Number, default: 0 },
      totalInvestingCashFlow: { type: Number, default: 0 }
    },
    financingCashFlow: {
      debtProceeds: { type: Number, default: 0 },
      debtRepayments: { type: Number, default: 0 },
      dividendsPaid: { type: Number, default: 0 },
      shareIssuance: { type: Number, default: 0 },
      otherFinancingActivities: { type: Number, default: 0 },
      totalFinancingCashFlow: { type: Number, default: 0 }
    },
    netCashFlow: { type: Number, default: 0 },
    beginningCash: { type: Number, default: 0 },
    endingCash: { type: Number, default: 0 }
  },

  // Market Data (if public company)
  marketData: {
    sharePrice: { type: Number, default: 0 },
    marketCap: { type: Number, default: 0 },
    sharesOutstanding: { type: Number, default: 0 },
    bookValuePerShare: { type: Number, default: 0 },
    earningsPerShare: { type: Number, default: 0 }
  }
});

const CompanySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  sector: {
    type: String,
    required: true
  },
  activity: {
    type: String,
    required: true
  },
  legalEntity: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'Saudi Arabia'
  },
  currency: {
    type: String,
    default: 'SAR'
  },
  fiscalYearEnd: {
    type: String,
    default: 'December'
  },
  companySize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  stockSymbol: String,

  // Financial Statements for multiple years
  financialStatements: [FinancialStatementSchema],

  // Budget/Forecast data
  budgets: [{
    year: Number,
    budgetData: {
      projectedRevenue: Number,
      projectedExpenses: Number,
      projectedNetIncome: Number,
      projectedCashFlow: Number,
      capitalExpenditureBudget: Number
    }
  }],

  // Analysis preferences
  analysisPreferences: {
    comparisonLevel: {
      type: String,
      enum: ['local_saudi', 'gulf', 'arab', 'asia', 'africa', 'europe', 'north_america', 'south_america', 'australia', 'global'],
      default: 'local_saudi'
    },
    yearsToAnalyze: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    analysisTypes: [{
      type: String,
      enum: ['basic_classical', 'applied_intermediate', 'advanced_complex', 'comprehensive']
    }],
    reportLanguage: {
      type: String,
      enum: ['ar', 'en'],
      default: 'en'
    }
  },

  // Metadata
  dataSource: {
    type: String,
    enum: ['upload', 'manual', 'api'],
    default: 'upload'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
CompanySchema.index({ userId: 1 });
CompanySchema.index({ companyName: 1 });
CompanySchema.index({ sector: 1, activity: 1 });
CompanySchema.index({ 'financialStatements.year': 1 });

// Virtual for getting latest financial year
CompanySchema.virtual('latestFinancialYear').get(function() {
  if (this.financialStatements && this.financialStatements.length > 0) {
    return Math.max(...this.financialStatements.map(fs => fs.year));
  }
  return null;
});

// Method to get financial data for specific year
CompanySchema.methods.getFinancialData = function(year) {
  return this.financialStatements.find(fs => fs.year === year);
};

// Method to get multiple years of financial data
CompanySchema.methods.getFinancialDataRange = function(startYear, endYear) {
  return this.financialStatements.filter(fs =>
    fs.year >= startYear && fs.year <= endYear
  ).sort((a, b) => a.year - b.year);
};

// Method to calculate key financial ratios
CompanySchema.methods.calculateBasicRatios = function(year) {
  const data = this.getFinancialData(year);
  if (!data) return null;

  const ratios = {};
  const bs = data.balanceSheet;
  const is = data.incomeStatement;
  const cf = data.cashFlowStatement;

  // Liquidity Ratios
  ratios.currentRatio = bs.currentAssets.totalCurrentAssets / bs.currentLiabilities.totalCurrentLiabilities;
  ratios.quickRatio = (bs.currentAssets.totalCurrentAssets - bs.currentAssets.inventory) / bs.currentLiabilities.totalCurrentLiabilities;
  ratios.cashRatio = bs.currentAssets.cash / bs.currentLiabilities.totalCurrentLiabilities;

  // Profitability Ratios
  ratios.grossProfitMargin = is.grossProfit / is.revenue;
  ratios.operatingMargin = is.operatingIncome / is.revenue;
  ratios.netProfitMargin = is.netIncome / is.revenue;
  ratios.roa = is.netIncome / bs.totalAssets;
  ratios.roe = is.netIncome / bs.shareholdersEquity.totalEquity;

  // Leverage Ratios
  ratios.debtToAssets = bs.totalLiabilities / bs.totalAssets;
  ratios.debtToEquity = bs.totalLiabilities / bs.shareholdersEquity.totalEquity;
  ratios.interestCoverage = is.operatingIncome / is.interestExpense;

  // Activity Ratios
  ratios.assetTurnover = is.revenue / bs.totalAssets;

  return ratios;
};

CompanySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Company', CompanySchema);