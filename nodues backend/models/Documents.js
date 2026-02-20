const mongoose = require('mongoose');

const documentsSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NoDuesApplication',
        required: true,
        unique: true
    },
    feeReceiptsPDF: {
        filename: String,
        path: String,
        size: Number,
        uploadedAt: Date
    },
    marksheetsPDF: {
        filename: String,
        path: String,
        size: Number,
        uploadedAt: Date
    },
    bankProofImage: {
        filename: String,
        path: String,
        size: Number,
        uploadedAt: Date
    },
    idProofImage: {
        filename: String,
        path: String,
        size: Number,
        uploadedAt: Date
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

// Index
documentsSchema.index({ applicationId: 1 });

module.exports = mongoose.model('Documents', documentsSchema);
