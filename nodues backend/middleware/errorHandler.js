const logger = require('../config/logger');
const { Prisma } = require('@prisma/client');

// Global error handler
const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        user: req.user?.email
    });

    // Prisma error handling
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint failed
        if (err.code === 'P2002') {
            const field = err.meta?.target?.[0] || 'Field';
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }
        // P2025: Record to update/delete not found
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Record not found'
            });
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            success: false,
            message: 'Database validation failed',
            details: err.message
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? message : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// 404 handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = {
    errorHandler,
    notFound
};
