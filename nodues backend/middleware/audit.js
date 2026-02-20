const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

// Create audit log entry
const createAuditLog = async (arg1, arg2, arg3, arg4) => {
    try {
        let logData;
        if (typeof arg1 === 'object' && !arg2) {
            // Standard object argument
            logData = arg1;
        } else {
            // Positional arguments: action, userId, targetId, details
            logData = {
                action: arg1?.toLowerCase(),
                userId: arg2,
                targetId: arg3,
                details: arg4
            };
        }

        // Validate action against enum (basic check)
        const validActions = [
            'user_created', 'user_updated', 'user_deleted',
            'application_submitted', 'application_approved', 'application_paused',
            'application_rejected', 'application_resubmitted',
            'certificate_generated', 'certificate_emailed', 'certificate_regenerated',
            'login', 'logout', 'password_changed', 'workflow_configured', 'role_assigned',
            'PROFILE_CREATED', 'PROFILE_UPDATED', 'APPLICATION_SUBMITTED', 'APPLICATION_RESUBMITTED'
        ];

        let actionToLog = 'system_activity';
        if (logData.action) {
            if (validActions.includes(logData.action)) {
                actionToLog = logData.action;
            } else if (validActions.includes(logData.action.toLowerCase())) {
                actionToLog = logData.action.toLowerCase();
            }
        }

        const auditLog = await AuditLog.create({
            userId: logData.userId,
            userName: logData.userName || 'System',
            userEmail: logData.userEmail || 'system@mitsgwl.ac.in',
            userRole: logData.userRole || 'system',
            action: actionToLog,
            targetType: logData.targetType,
            targetId: logData.targetId,
            details: logData.details,
            ipAddress: logData.ipAddress,
            userAgent: logData.userAgent,
            timestamp: new Date()
        });

        logger.info(`Audit log created: ${logData.action} by ${logData.userEmail || 'System'}`);
        return auditLog;
    } catch (error) {
        logger.error(`Failed to create audit log: ${error.message}`);
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
                    userId: req.user._id,
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
