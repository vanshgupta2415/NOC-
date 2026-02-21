const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const logger = require('../config/logger');

// Verify JWT access token
const verifyToken = async (req, res, next) => {
    try {
        // ... (existing token logic)
        let token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please refresh your token.',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        logger.error(`Token verification error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};

// Role-based authorization middleware
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn(`Unauthorized access attempt by ${req.user.email} (${req.user.role}) to ${req.path}`);
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource.'
            });
        }

        next();
    };
};

// Check if user is student
const isStudent = authorize('Student');

// Check if user is any admin
const isAdmin = authorize(
    'Faculty',
    'ClassCoordinator',
    'HOD',
    'HostelWarden',
    'LibraryAdmin',
    'WorkshopAdmin',
    'TPOfficer',
    'GeneralOffice',
    'AccountsOfficer',
    'SuperAdmin'
);

// Check if user is super admin
const isSuperAdmin = authorize('SuperAdmin');

// Check if user can approve at specific stage
const canApproveStage = (stage) => {
    return (req, res, next) => {
        const roleStageMap = {
            'Faculty': 'Faculty',
            'ClassCoordinator': 'ClassCoordinator',
            'HOD': 'HOD',
            'HostelWarden': 'HostelWarden',
            'LibraryAdmin': 'LibraryAdmin',
            'WorkshopAdmin': 'WorkshopAdmin',
            'TPOfficer': 'TPOfficer',
            'GeneralOffice': 'GeneralOffice',
            'AccountsOfficer': 'AccountsOfficer'
        };

        const userStage = roleStageMap[req.user.role];

        if (req.user.role === 'SuperAdmin' || userStage === stage) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'You do not have permission to approve at this stage.'
        });
    };
};

module.exports = {
    verifyToken,
    authenticate: verifyToken, // Alias for consistency with route imports
    authorize,
    isStudent,
    isAdmin,
    isSuperAdmin,
    canApproveStage
};
