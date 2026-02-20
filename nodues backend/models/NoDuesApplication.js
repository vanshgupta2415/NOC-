const mongoose = require('mongoose');

const noDuesApplicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile',
        required: true
    },
    status: {
        type: String,
        enum: ['Submitted', 'UnderReview', 'Paused', 'Approved', 'CertificateIssued', 'Rejected'],
        default: 'Submitted'
    },
    currentStage: {
        type: String,
        enum: [
            'Faculty',
            'ClassCoordinator',
            'HOD',
            'HostelWarden',
            'LibraryAdmin',
            'WorkshopAdmin',
            'TPOfficer',
            'GeneralOffice',
            'AccountsOfficer',
            'completed'
        ],
        default: 'Faculty'
    },
    hostelInvolved: {
        type: Boolean,
        required: true,
        default: false
    },
    cautionMoneyRefund: {
        type: Boolean,
        default: false
    },
    exitSurveyCompleted: {
        type: Boolean,
        required: [true, 'Please confirm you have filled the exit survey'],
        default: false
    },
    feeDuesCleared: {
        type: Boolean,
        required: [true, 'Please confirm you have cleared all fee dues'],
        default: false
    },
    projectReportSubmitted: {
        type: Boolean,
        required: [true, 'Please confirm you have submitted your project/internship report'],
        default: false
    },
    declarationAccepted: {
        type: Boolean,
        required: [true, 'Please accept the declaration'],
        default: false
    },
    remarks: {
        type: String,
        trim: true
    },
    pausedAt: {
        type: Date
    },
    pausedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectedAt: {
        type: Date
    },
    // Authority Specific Data (from MITS Gwalior Requirements)
    libraryDues: {
        type: String,
        default: 'Nil'
    },
    tcNumber: {
        type: String
    },
    tcDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
noDuesApplicationSchema.index({ studentId: 1 });
noDuesApplicationSchema.index({ status: 1 });
noDuesApplicationSchema.index({ currentStage: 1 });
noDuesApplicationSchema.index({ createdAt: -1 });

// Compound index for efficient queries
noDuesApplicationSchema.index({ status: 1, currentStage: 1 });

module.exports = mongoose.model('NoDuesApplication', noDuesApplicationSchema);
