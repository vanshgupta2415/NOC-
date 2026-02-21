const { prisma } = require('../config/database');
const logger = require('../config/logger');

// Create audit log entry
// Supports two call signatures:
// 1. createAuditLog({ userId, userName, userEmail, userRole, action, ... })
// 2. createAuditLog(action, userId, targetId, details)   ← positional (from controllers)
const createAuditLog = async (arg1, arg2, arg3, arg4) => {
    try {
        let logData;
        if (typeof arg1 === 'object' && !arg2) {
            logData = arg1;
        } else {
            // Positional call: fetch user to get name/email/role
            const userId = arg2;
            let userName = 'System', userEmail = 'system@mitsgwl.ac.in', userRole = 'system';
            if (userId) {
                try {
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { name: true, email: true, role: true }
                    });
                    if (user) { userName = user.name; userEmail = user.email; userRole = user.role; }
                } catch (_) { /* silently skip user lookup failures */ }
            }
            logData = {
                action: arg1,
                userId,
                userName,
                userEmail,
                userRole,
                targetId: arg3,
                details: arg4
            };
        }

        const auditLog = await prisma.auditLog.create({
            data: {
                userId: logData.userId,
                userName: logData.userName || 'System',
                userEmail: logData.userEmail || 'system@mitsgwl.ac.in',
                userRole: String(logData.userRole || 'system'),
                action: String(logData.action || 'system_activity'),
                targetType: logData.targetType || null,
                targetId: logData.targetId ? String(logData.targetId) : null,
                details: logData.details || null,
                ipAddress: logData.ipAddress || null,
                userAgent: logData.userAgent || null,
                timestamp: new Date()
            }
        });

        logger.info(`Audit: ${logData.action} by ${logData.userEmail || 'System'}`);
        return auditLog;
    } catch (error) {
        logger.error(`Failed to create audit log: ${error.message}`);
        // Don't throw — audit failures must never break the main flow
    }
};

// Audit middleware
const auditMiddleware = (action, targetType = null) => {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;

        // Override send function to capture response
        res.send = function (data) {
            // Only log successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                createAuditLog({
                    userId: req.user.id,
                    userName: req.user.name,
                    userEmail: req.user.email,
                    userRole: req.user.role,
                    action,
                    targetType,
                    targetId: req.params.id || req.params.applicationId || null,
                    details: {
                        method: req.method,
                        path: req.path,
                        body: req.body,
                        params: req.params
                    },
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent')
                });
            }

            // Call original send
            originalSend.call(this, data);
        };

        next();
    };
};

module.exports = {
    createAuditLog,
    auditMiddleware,
    logAudit: createAuditLog // Alias for controller usage
};
