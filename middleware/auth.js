const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user middleware
const authenticate = async (req, res, next) => {
    try {
        let token = null;

        // Check for token in multiple places
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.session && req.session.token) {
            token = req.session.token;
        }

        if (!token) {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided, authorization denied'
                });
            } else {
                return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
            }
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    message: 'Token is not valid'
                });
            } else {
                return res.redirect('/login');
            }
        }

        // Check if user account is active
        if (!user.isActive) {
            if (req.path.startsWith('/api/')) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            } else {
                return res.redirect('/login?error=account_deactivated');
            }
        }

        // Check subscription status for non-admin/non-guest users
        if (user.role !== 'admin' && user.role !== 'guest' && !user.isSubscriptionActive()) {
            if (req.path.startsWith('/api/')) {
                return res.status(403).json({
                    success: false,
                    message: 'Subscription expired or inactive'
                });
            } else {
                return res.redirect('/subscribe?expired=true');
            }
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);

        if (req.path.startsWith('/api/')) {
            return res.status(401).json({
                success: false,
                message: 'Token is not valid'
            });
        } else {
            return res.redirect('/login?error=token_invalid');
        }
    }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        // First check if user is authenticated
        await authenticate(req, res, () => {});

        if (!req.user) {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            } else {
                return res.redirect('/login');
            }
        }

        // Check if user is admin
        if (req.user.role !== 'admin') {
            if (req.path.startsWith('/api/')) {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            } else {
                return res.redirect('/?error=access_denied');
            }
        }

        next();
    } catch (error) {
        console.error('Admin authentication error:', error);

        if (req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error during authentication'
            });
        } else {
            return res.redirect('/login?error=server_error');
        }
    }
};

// Guest user setup middleware
const setupGuestUser = (req, res, next) => {
    const guestUser = {
        _id: 'guest_user',
        email: 'Guest@FinClick.AI',
        firstName: 'Guest',
        lastName: 'User',
        role: 'guest',
        subscription: {
            type: 'guest',
            status: 'active'
        },
        isSubscriptionActive: () => true
    };

    req.user = guestUser;
    next();
};

// Optional authentication (for public pages that can show user info if logged in)
const optionalAuth = async (req, res, next) => {
    try {
        let token = null;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.session && req.session.token) {
            token = req.session.token;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('-password');

                if (user && user.isActive) {
                    req.user = user;
                }
            } catch (error) {
                // Invalid token, but continue without user
                console.log('Invalid token in optional auth:', error.message);
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next();
    }
};

// Check subscription status
const checkSubscription = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // Admin and guest users bypass subscription checks
    if (req.user.role === 'admin' || req.user.role === 'guest') {
        return next();
    }

    // Check if subscription is active
    if (!req.user.isSubscriptionActive()) {
        return res.status(403).json({
            success: false,
            message: 'Active subscription required',
            code: 'SUBSCRIPTION_REQUIRED'
        });
    }

    next();
};

// Rate limiting for specific user roles
const roleBasedRateLimit = (limits) => {
    return (req, res, next) => {
        if (!req.user) {
            return next();
        }

        const userRole = req.user.role;
        const limit = limits[userRole] || limits.default || 100;

        // This would integrate with a rate limiting service like Redis
        // For now, we'll just pass through
        // In production, implement actual rate limiting logic here

        req.rateLimit = {
            role: userRole,
            limit: limit,
            remaining: limit - 1 // Placeholder
        };

        next();
    };
};

// Middleware to update last login time
const updateLastLogin = async (req, res, next) => {
    if (req.user && req.user._id !== 'guest_user') {
        try {
            await User.findByIdAndUpdate(req.user._id, {
                'analytics.lastLogin': new Date(),
                $inc: { 'analytics.loginCount': 1 }
            });
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }
    next();
};

// Middleware to track user activity
const trackActivity = (activityType) => {
    return async (req, res, next) => {
        if (req.user && req.user._id !== 'guest_user') {
            try {
                const updateField = {};

                switch (activityType) {
                    case 'analysis':
                        updateField['$inc'] = { 'analytics.analysisCount': 1 };
                        break;
                    case 'file_upload':
                        updateField['$inc'] = { 'analytics.totalFilesUploaded': 1 };
                        break;
                    default:
                        break;
                }

                if (Object.keys(updateField).length > 0) {
                    await User.findByIdAndUpdate(req.user._id, updateField);
                }
            } catch (error) {
                console.error(`Error tracking ${activityType} activity:`, error);
            }
        }
        next();
    };
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

module.exports = {
    authenticate,
    authenticateAdmin,
    setupGuestUser,
    optionalAuth,
    checkSubscription,
    roleBasedRateLimit,
    updateLastLogin,
    trackActivity,
    generateToken,
    verifyToken
};