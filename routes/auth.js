const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { generateToken, verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const router = express.Router();

// Rate limiting for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 registration attempts per hour
    message: {
        success: false,
        message: 'Too many accounts created from this IP, please try again after an hour.'
    }
});

// Configure nodemailer
const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Validation rules
const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('phone')
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    body('companyName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Company name must be between 2 and 100 characters')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerLimiter, registerValidation, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const { email, password, firstName, lastName, phone, companyName, language } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email'
        });
    }

    // Create user
    const user = new User({
        email,
        password,
        firstName,
        lastName,
        phone,
        companyName,
        preferences: {
            language: language || 'en'
        },
        verification: {
            emailVerificationToken: crypto.randomBytes(20).toString('hex')
        }
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Send verification email
    try {
        const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email/${user.verification.emailVerificationToken}`;

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: user.email,
            subject: language === 'ar' ? 'تفعيل حساب FinClick.AI' : 'FinClick.AI Account Verification',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #B48500;">${language === 'ar' ? 'مرحباً بك في FinClick.AI' : 'Welcome to FinClick.AI'}</h2>
                    <p>${language === 'ar' ? 'شكراً لك على التسجيل في منصة FinClick.AI للتحليل المالي الذكي.' : 'Thank you for registering with FinClick.AI - Revolutionary Intelligent Financial Analysis Platform.'}</p>
                    <p>${language === 'ar' ? 'الرجاء الضغط على الرابط أدناه لتفعيل حسابك:' : 'Please click the link below to verify your account:'}</p>
                    <a href="${verificationUrl}" style="display: inline-block; background-color: #B48500; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                        ${language === 'ar' ? 'تفعيل الحساب' : 'Verify Account'}
                    </a>
                    <p>${language === 'ar' ? 'إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد الإلكتروني.' : 'If you did not create this account, please ignore this email.'}</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        FinClick.AI - ${language === 'ar' ? 'منصة التحليل المالي الذكية والثورية' : 'Revolutionary Intelligent Financial Analysis Platform'}<br>
                        ${language === 'ar' ? 'المملكة العربية السعودية، جدة' : 'Kingdom of Saudi Arabia, Jeddah'}
                    </p>
                </div>
            `
        });
    } catch (emailError) {
        console.error('Error sending verification email:', emailError);
    }

    res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                subscription: user.subscription
            },
            token
        }
    });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, loginValidation, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const { email, password, rememberMe } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check if account is active
    if (!user.isActive) {
        return res.status(403).json({
            success: false,
            message: 'Account is deactivated. Please contact support.'
        });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Update last login
    user.analytics.lastLogin = new Date();
    user.analytics.loginCount += 1;
    await user.save();

    // Generate JWT token
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: tokenExpiry });

    // Set cookie if remember me is selected
    if (rememberMe) {
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            sameSite: 'strict'
        });
    }

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                role: user.role,
                subscription: user.subscription,
                preferences: user.preferences,
                isSubscriptionActive: user.isSubscriptionActive()
            },
            token
        }
    });
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', asyncHandler(async (req, res) => {
    // Clear cookie
    res.clearCookie('token');

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', require('../middleware/auth').authenticate, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                phone: user.phone,
                companyName: user.companyName,
                role: user.role,
                subscription: user.subscription,
                preferences: user.preferences,
                profile: user.profile,
                analytics: user.analytics,
                isSubscriptionActive: user.isSubscriptionActive(),
                createdAt: user.createdAt
            }
        }
    });
}));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
    require('../middleware/auth').authenticate,
    [
        body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
        body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
        body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/),
        body('companyName').optional().trim().isLength({ min: 2, max: 100 }),
        body('preferences.language').optional().isIn(['ar', 'en'])
    ],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const allowedUpdates = ['firstName', 'lastName', 'phone', 'companyName', 'preferences', 'profile'];
        const updates = {};

        // Filter allowed updates
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    })
);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password',
    require('../middleware/auth').authenticate,
    [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
    ],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    })
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password',
    authLimiter,
    [body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.verification.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.verification.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // Send reset email
        try {
            const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: user.email,
                subject: user.preferences.language === 'ar' ? 'إعادة تعيين كلمة المرور - FinClick.AI' : 'Password Reset - FinClick.AI',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #B48500;">${user.preferences.language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Password Reset Request'}</h2>
                        <p>${user.preferences.language === 'ar' ? 'لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في FinClick.AI.' : 'We received a request to reset your password for your FinClick.AI account.'}</p>
                        <p>${user.preferences.language === 'ar' ? 'الرجاء الضغط على الرابط أدناه لإعادة تعيين كلمة المرور (صالح لمدة 10 دقائق):' : 'Please click the link below to reset your password (valid for 10 minutes):'}</p>
                        <a href="${resetUrl}" style="display: inline-block; background-color: #B48500; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                            ${user.preferences.language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                        </a>
                        <p>${user.preferences.language === 'ar' ? 'إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.' : 'If you did not request a password reset, please ignore this email.'}</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            user.verification.passwordResetToken = undefined;
            user.verification.passwordResetExpires = undefined;
            await user.save();

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent'
            });
        }

        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    })
);

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.put('/reset-password/:token',
    [
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
    ],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            'verification.passwordResetToken': hashedToken,
            'verification.passwordResetExpires': { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token is invalid or has expired'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.verification.passwordResetToken = undefined;
        user.verification.passwordResetExpires = undefined;

        await user.save();

        // Generate new token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Password has been reset successfully',
            data: { token }
        });
    })
);

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', asyncHandler(async (req, res) => {
    const user = await User.findOne({
        'verification.emailVerificationToken': req.params.token
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'Invalid verification token'
        });
    }

    user.verification.emailVerified = true;
    user.verification.emailVerificationToken = undefined;
    await user.save();

    res.json({
        success: true,
        message: 'Email verified successfully'
    });
}));

module.exports = router;