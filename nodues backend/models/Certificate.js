const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NoDuesApplication',
        required: true,
        unique: true
    },
    certificateNumber: {
        type: String,
        required: true,
        unique: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    enrollmentNumber: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    passOutYear: {
        type: Number,
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    pdfPath: {
        type: String,
        required: true
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentAt: {
        type: Date
    },
    emailError: {
        type: String
    },
    regenerationCount: {
        type: Number,
        default: 0
    },
    lastRegeneratedAt: {
        type: Date
    },
    regeneratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes (applicationId and certificateNumber are already unique)
certificateSchema.index({ studentId: 1 });
certificateSchema.index({ issuedAt: -1 });

module.exports = mongoose.model('Certificate', certificateSchema);
