const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const connectDB = require('../config/database');

/**
 * Seed script to create initial SuperAdmin user
 * Run with: node scripts/seedAdmin.js
 */

async function seedAdmin() {
    try {
        // Connect to database
        await connectDB();
        console.log('Connected to database');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'SuperAdmin' });
        if (existingAdmin) {
            console.log('⚠️  SuperAdmin already exists:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log('   Skipping creation...');
            process.exit(0);
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('admin123', salt);

        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@mitsgwl.ac.in',
            passwordHash,
            role: 'SuperAdmin',
            department: null,
            isActive: true
        });

        console.log('✅ SuperAdmin created successfully!');
        console.log('');
        console.log('Login Credentials:');
        console.log('==================');
        console.log(`Email: ${admin.email}`);
        console.log('Password: admin123');
        console.log('');
        console.log('⚠️  IMPORTANT: Change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
}

seedAdmin();
