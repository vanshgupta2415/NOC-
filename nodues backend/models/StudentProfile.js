const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    enrollmentNumber: {
        type: String,
        required: [true, 'Enrollment number is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    fatherName: {
        type: String,
        required: [true, 'Father name is required'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    branch: {
        type: String,
        required: [true, 'Branch is required'],
        enum: [
            'Computer Science',
            'Electronics',
            'Mechanical',
            'Civil',
            'Electrical',
            'Information Technology'
        ]
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    passOutYear: {
        type: Number,
        required: [true, 'Pass out year is required'],
        min: 2020,
        max: 2050
    },
    phoneNumber: {
        type: String,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
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

// No additional indexes needed - userId and enrollmentNumber are already unique

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
