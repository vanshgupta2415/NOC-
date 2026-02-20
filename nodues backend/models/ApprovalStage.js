const mongoose = require('mongoose');

const approvalStageSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NoDuesApplication',
        required: true
    },
    officeName: {
        type: String,
        required: true,
        enum: [
            'Faculty',
            'Class Coordinator',
            'HOD',
            'Hostel Administration',
            'Library',
            'Workshop/Lab',
            'Training & Placement Cell',
            'General Office',
            'Accounts Office'
        ]
    },
    role: {
        type: String,
        required: true,
        enum: [
            'Faculty',
            'ClassCoordinator',
            'HOD',
            'HostelWarden',
            'LibraryAdmin',
            'WorkshopAdmin',
            'TPOfficer',
            'GeneralOffice',
            'AccountsOfficer'
        ]
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Paused', 'Skipped'],
        default: 'Pending'
    },
    stageOrder: {
        type: Number,
        required: true
    },
    remarks: {
        type: String,
        trim: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedByName: {
        type: String
    },
    approvedByEmail: {
        type: String
    },
    approvedAt: {
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
approvalStageSchema.index({ status: 1 });
approvalStageSchema.index({ role: 1 });

// Compound index (covers applicationId queries too)
approvalStageSchema.index({ applicationId: 1, role: 1 });

module.exports = mongoose.model('ApprovalStage', approvalStageSchema);
