const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const connectDB = require('../config/database');

/**
 * Seed script to create sample users for testing
 * Run with: node scripts/seedTestUsers.js
 */

const sampleUsers = [
    // Faculty
    {
        name: 'Dr. Rajesh Kumar',
        email: 'faculty1@mitsgwl.ac.in',
        password: 'faculty123',
        role: 'Faculty',
        department: 'Computer Science'
    },
    // Class Coordinator
    {
        name: 'Prof. Priya Sharma',
        email: 'coordinator1@mitsgwl.ac.in',
        password: 'coordinator123',
        role: 'ClassCoordinator',
        department: 'Computer Science'
    },
    // HOD
    {
        name: 'Dr. Amit Verma',
        email: 'hod.cs@mitsgwl.ac.in',
        password: 'hod123',
        role: 'HOD',
        department: 'Computer Science'
    },
    // Hostel Admin
    {
        name: 'Mr. Suresh Patel',
        email: 'hostel.admin@mitsgwl.ac.in',
        password: 'hostel123',
        role: 'HostelWarden',
        department: null
    },
    // Library Admin
    {
        name: 'Mrs. Kavita Singh',
        email: 'library.admin@mitsgwl.ac.in',
        password: 'library123',
        role: 'LibraryAdmin',
        department: null
    },
    // Workshop Admin
    {
        name: 'Mr. Ramesh Gupta',
        email: 'workshop.admin@mitsgwl.ac.in',
        password: 'workshop123',
        role: 'WorkshopAdmin',
        department: null
    },
    // T&P Cell Admin
    {
        name: 'Dr. Neha Agarwal',
        email: 'tnp.admin@mitsgwl.ac.in',
        password: 'tnp123',
        role: 'TPOfficer',
        department: null
    },
    // General Office Admin
    {
        name: 'Mr. Vijay Malhotra',
        email: 'office.admin@mitsgwl.ac.in',
        password: 'office123',
        role: 'GeneralOffice',
        department: null
    },
    // Accounts Office
    {
        name: 'CA Sunita Reddy',
        email: 'accounts@mitsgwl.ac.in',
        password: 'accounts123',
        role: 'AccountsOfficer',
        department: null
    },
    // Sample Students
    {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@mitsgwl.ac.in',
        password: 'student123',
        role: 'Student',
        department: null,
        studentProfile: {
            enrollmentNumber: '0801CS211001',
            fatherName: 'Mr. Mohan Sharma',
            dateOfBirth: new Date('2003-05-15'),
            branch: 'Computer Science',
            address: '123, Model Town, Gwalior, MP - 474001',
            passOutYear: 2025
        }
    },
    {
        name: 'Priya Patel',
        email: 'priya.patel@mitsgwl.ac.in',
        password: 'student123',
        role: 'Student',
        department: null,
        studentProfile: {
            enrollmentNumber: '0801CS211002',
            fatherName: 'Mr. Rakesh Patel',
            dateOfBirth: new Date('2003-08-22'),
            branch: 'Computer Science',
            address: '456, City Center, Gwalior, MP - 474002',
            passOutYear: 2025
        }
    },
    {
        name: 'Arjun Singh',
        email: 'arjun.singh@mitsgwl.ac.in',
        password: 'student123',
        role: 'Student',
        department: null,
        studentProfile: {
            enrollmentNumber: '0801ME211003',
            fatherName: 'Mr. Vikram Singh',
            dateOfBirth: new Date('2003-03-10'),
            branch: 'Mechanical',
            address: '789, Lashkar, Gwalior, MP - 474001',
            passOutYear: 2025
        }
    }
];

async function seedTestUsers() {
    try {
        // Connect to database
        await connectDB();
        console.log('Connected to database\n');

        const salt = await bcrypt.genSalt(10);
        let createdCount = 0;
        let skippedCount = 0;

        for (const userData of sampleUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`⚠️  User already exists: ${userData.email}`);
                skippedCount++;
                continue;
            }

            // Hash password
            const passwordHash = await bcrypt.hash(userData.password, salt);

            // Create user
            const user = await User.create({
                name: userData.name,
                email: userData.email,
                passwordHash,
                role: userData.role,
                department: userData.department,
                isActive: true
            });

            // Create student profile if student
            if (userData.role === 'Student' && userData.studentProfile) {
                await StudentProfile.create({
                    userId: user._id,
                    ...userData.studentProfile
                });
            }

            console.log(`✅ Created ${userData.role}: ${userData.email}`);
            createdCount++;
        }

        console.log('\n==========================================');
        console.log(`✅ Created ${createdCount} users`);
        console.log(`⚠️  Skipped ${skippedCount} existing users`);
        console.log('==========================================\n');

        console.log('Default Password for all users: student123, faculty123, etc.');
        console.log('(Check the script for specific passwords)\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error.message);
        process.exit(1);
    }
}

seedTestUsers();
