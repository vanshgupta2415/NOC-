const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  role: {
    type: String,
    enum: [
      'Student',
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
    ],
    required: [true, 'Role is required']
  },
  department: {
    type: String,
    enum: [
      'Computer Science',
      'Electronics',
      'Mechanical',
      'Civil',
      'Electrical',
      'Information Technology',
      'Central'
    ],
    required: function () {
      return ['faculty', 'class_coordinator', 'hod'].includes(this.role);
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshToken: {
    type: String,
    select: false
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

// Index for faster queries
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
