const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guest'],
    default: 'user'
  },
  subscription: {
    type: {
      type: String,
      enum: ['monthly', 'yearly', 'guest', 'trial'],
      default: 'trial'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired', 'cancelled'],
      default: 'inactive'
    },
    startDate: Date,
    endDate: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  preferences: {
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'en'
    },
    currency: {
      type: String,
      default: 'SAR'
    },
    timezone: {
      type: String,
      default: 'Asia/Riyadh'
    }
  },
  profile: {
    sector: String,
    activity: String,
    legalEntity: String,
    comparisonLevel: {
      type: String,
      enum: ['local_saudi', 'gulf', 'arab', 'asia', 'africa', 'europe', 'north_america', 'south_america', 'australia', 'global'],
      default: 'local_saudi'
    }
  },
  verification: {
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  analytics: {
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    },
    analysisCount: {
      type: Number,
      default: 0
    },
    totalFilesUploaded: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ 'subscription.status': 1 });
UserSchema.index({ role: 1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if subscription is active
UserSchema.methods.isSubscriptionActive = function() {
  if (this.role === 'admin' || this.role === 'guest') return true;

  return this.subscription.status === 'active' &&
         this.subscription.endDate > new Date();
};

// Get full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialised
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.verification.passwordResetToken;
    delete ret.verification.emailVerificationToken;
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);