const mongoose = require('mongoose');

const AnalysisResultSchema = new mongoose.Schema({
  analysisType: {
    type: String,
    required: true
  },
  analysisCategory: {
    type: String,
    enum: ['basic_classical', 'applied_intermediate', 'advanced_complex'],
    required: true
  },
  analysisSubcategory: {
    type: String,
    required: true
  },
  results: {
    numericValue: mongoose.Schema.Types.Mixed,
    interpretation: String,
    industryBenchmark: Number,
    comparisonResult: String,
    rating: {
      type: String,
      enum: ['excellent', 'very_good', 'good', 'acceptable', 'poor']
    },
    ratingColor: {
      type: String,
      enum: ['green', 'blue', 'orange', 'yellow', 'red']
    }
  },
  calculations: {
    formula: String,
    inputs: mongoose.Schema.Types.Mixed,
    steps: [String]
  },
  benchmarkData: {
    localAverage: Number,
    regionalAverage: Number,
    globalAverage: Number,
    competitors: [Number],
    industryMedian: Number
  },
  insights: {
    strengths: [String],
    weaknesses: [String],
    opportunities: [String],
    threats: [String],
    recommendations: [String]
  },
  charts: [{
    type: String,
    data: mongoose.Schema.Types.Mixed,
    config: mongoose.Schema.Types.Mixed
  }]
});

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  analysisId: {
    type: String,
    unique: true,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  analysisConfig: {
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'en'
    },
    sector: String,
    activity: String,
    legalEntity: String,
    comparisonLevel: {
      type: String,
      enum: ['local_saudi', 'gulf', 'arab', 'asia', 'africa', 'europe', 'north_america', 'south_america', 'australia', 'global']
    },
    yearsAnalyzed: [Number],
    analysisTypes: [String]
  },

  // Executive Summary
  executiveSummary: {
    overallRating: {
      type: String,
      enum: ['excellent', 'very_good', 'good', 'acceptable', 'poor']
    },
    keyFindings: [String],
    criticalIssues: [String],
    opportunities: [String],
    recommendations: [String],
    swotAnalysis: {
      strengths: [String],
      weaknesses: [String],
      opportunities: [String],
      threats: [String]
    },
    riskAssessment: {
      overallRiskLevel: {
        type: String,
        enum: ['low', 'moderate', 'high', 'critical']
      },
      keyRisks: [String]
    },
    forecasts: {
      revenueGrowth: String,
      profitabilityTrend: String,
      liquidityOutlook: String,
      recommendations: [String]
    }
  },

  // Detailed Analysis Results (180 types)
  analysisResults: [AnalysisResultSchema],

  // Performance Summary
  performanceSummary: {
    totalAnalysesPerformed: Number,
    analysisCompletionStatus: {
      type: String,
      enum: ['complete', 'partial', 'in_progress', 'failed'],
      default: 'in_progress'
    },
    processingTime: Number, // in seconds
    dataQualityScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Market Comparison Data
  marketComparison: {
    industryAverage: mongoose.Schema.Types.Mixed,
    peerComparison: mongoose.Schema.Types.Mixed,
    marketPosition: String,
    competitiveAdvantage: [String]
  },

  // Report Generation
  reportGenerated: {
    pdf: {
      generated: { type: Boolean, default: false },
      path: String,
      size: Number,
      pages: Number
    },
    word: {
      generated: { type: Boolean, default: false },
      path: String,
      size: Number,
      pages: Number
    },
    excel: {
      generated: { type: Boolean, default: false },
      path: String,
      size: Number,
      sheets: Number
    },
    powerpoint: {
      generated: { type: Boolean, default: false },
      path: String,
      size: Number,
      slides: Number
    }
  },

  // Analysis Metadata
  analysisDate: {
    type: Date,
    default: Date.now
  },
  completionDate: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  version: {
    type: String,
    default: '1.0'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error'],
    default: 'pending'
  },
  errorLog: [String],

  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
AnalysisSchema.index({ userId: 1 });
AnalysisSchema.index({ companyId: 1 });
AnalysisSchema.index({ analysisId: 1 });
AnalysisSchema.index({ analysisDate: -1 });
AnalysisSchema.index({ status: 1 });
AnalysisSchema.index({ 'analysisConfig.sector': 1 });

// Methods
AnalysisSchema.methods.getAnalysisByType = function(type) {
  return this.analysisResults.filter(result => result.analysisType === type);
};

AnalysisSchema.methods.getAnalysisByCategory = function(category) {
  return this.analysisResults.filter(result => result.analysisCategory === category);
};

AnalysisSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.lastUpdated = new Date();
  if (newStatus === 'completed') {
    this.completionDate = new Date();
  }
  return this.save();
};

AnalysisSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

AnalysisSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

// Static methods
AnalysisSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ analysisDate: -1 });
};

AnalysisSchema.statics.findByCompany = function(companyId) {
  return this.find({ companyId }).sort({ analysisDate: -1 });
};

AnalysisSchema.statics.getAnalyticsData = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        completedAnalyses: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalViews: { $sum: '$viewCount' },
        totalDownloads: { $sum: '$downloadCount' },
        avgProcessingTime: { $avg: '$performanceSummary.processingTime' }
      }
    }
  ]);
};

module.exports = mongoose.model('Analysis', AnalysisSchema);