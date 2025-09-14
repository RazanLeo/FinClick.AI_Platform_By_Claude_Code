const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: './logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Custom error class
class AppError extends Error {
    constructor(message, statusCode, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        user: req.user ? req.user._id : 'anonymous',
        userAgent: req.get('User-Agent'),
        ip: req.ip
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new AppError(message, 400, 'DUPLICATE_FIELD');
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, 400, 'VALIDATION_ERROR');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new AppError(message, 401, 'INVALID_TOKEN');
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new AppError(message, 401, 'TOKEN_EXPIRED');
    }

    // Multer errors (file upload)
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'File size too large';
        error = new AppError(message, 400, 'FILE_SIZE_LIMIT');
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        const message = 'Too many files uploaded';
        error = new AppError(message, 400, 'FILE_COUNT_LIMIT');
    }

    // Stripe errors
    if (err.type && err.type.startsWith('Stripe')) {
        const message = 'Payment processing error';
        error = new AppError(message, 400, 'PAYMENT_ERROR');
    }

    // API response
    if (req.path.startsWith('/api/')) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server Error',
            code: error.code,
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack,
                error: err
            })
        });
    }

    // Web response
    const errorData = {
        title: 'Error - FinClick.AI',
        errorCode: error.statusCode || 500,
        errorMessage: error.message || 'Something went wrong',
        user: req.user,
        language: req.language || 'en',
        t: req.t
    };

    // Different error pages based on status code
    switch (error.statusCode) {
        case 400:
            return res.status(400).render('pages/error', {
                ...errorData,
                title: 'Bad Request - FinClick.AI'
            });
        case 401:
            return res.redirect('/login?error=unauthorized');
        case 403:
            return res.status(403).render('pages/error', {
                ...errorData,
                title: 'Access Denied - FinClick.AI'
            });
        case 404:
            return res.status(404).render('pages/404', {
                ...errorData,
                title: 'Page Not Found - FinClick.AI'
            });
        case 429:
            return res.status(429).render('pages/error', {
                ...errorData,
                title: 'Too Many Requests - FinClick.AI'
            });
        case 500:
        default:
            return res.status(500).render('pages/error', {
                ...errorData,
                title: 'Server Error - FinClick.AI',
                errorMessage: process.env.NODE_ENV === 'production' ?
                    'Internal server error' :
                    error.message
            });
    }
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFound = (req, res, next) => {
    const error = new AppError(`Not found - ${req.originalUrl}`, 404);
    next(error);
};

// Development error response
const sendErrorDev = (err, res) => {
    return res.status(err.statusCode).json({
        success: false,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

// Production error response
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code
        });
    }

    // Log unknown errors
    logger.error('Unknown error:', err);

    return res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        code: 'INTERNAL_ERROR'
    });
};

// Global unhandled promise rejection handler
process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Promise Rejection:', {
        message: err.message,
        stack: err.stack
    });

    // Close server gracefully
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

// Global uncaught exception handler
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', {
        message: err.message,
        stack: err.stack
    });

    // Close server gracefully
    process.exit(1);
});

module.exports = {
    errorHandler,
    asyncHandler,
    notFound,
    AppError,
    sendErrorDev,
    sendErrorProd
};