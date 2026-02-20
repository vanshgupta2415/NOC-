const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'user_created',
            'user_updated',
            'user_deleted',
            'application_submitted',
            'application_approved',
            'application_paused',
            'application_rejected',
            'application_resubmitted',
            'certificate_generated',
            'certificate_emailed',
            'certificate_regenerated',
            'login',
            'logout',
            'password_changed',
            'workflow_configured',
            'role_assigned',
            'PROFILE_CREATED',
            'PROFILE_UPDATED',
            'APPLICATION_SUBMITTED',
            'APPLICATION_RESUBMITTED'
        ]
    },
    targetType: {
        type: String,
        enum: ['User', 'NoDuesApplication', 'Certificate', 'System']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

// Indexes
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
