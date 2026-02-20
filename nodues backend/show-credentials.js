const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const connectDB = require('./config/database');

async function showLoginCredentials() {
    try {
        await connectDB();

        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║           📋 AVAILABLE LOGIN CREDENTIALS                 ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        const users = await User.find({}).select('name email role').lean();

        if (users.length === 0) {
            console.log('❌ No users found in database!');
            console.log('\n💡 Run this command to create test users:');
            console.log('   node seed-users.js\n');
            process.exit(1);
        }

        // Group users by role
        const roleGroups = {
            'Student': [],
            'SuperAdmin': [],
            'Faculty': [],
            'ClassCoordinator': [],
            'HOD': [],
            'HostelWarden': [],
            'LibraryAdmin': [],
            'WorkshopAdmin': [],
            'TPOfficer': [],
            'GeneralOffice': [],
            'AccountsOfficer': []
        };

        users.forEach(user => {
            if (roleGroups[user.role]) {
                roleGroups[user.role].push(user);
            }
        });

        // Display credentials
        console.log('🎓 STUDENTS:\n');
        if (roleGroups['Student'].length > 0) {
            roleGroups['Student'].forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.name}`);
                console.log(`      📧 Email:    ${user.email}`);
                console.log(`      🔑 Password: Student@123`);
                console.log('');
            });
        } else {
            console.log('   ⚠️  No students found\n');
        }

        console.log('👨‍💼 APPROVERS:\n');
        const approverRoles = ['Faculty', 'ClassCoordinator', 'HOD', 'HostelWarden',
            'LibraryAdmin', 'WorkshopAdmin', 'TPOfficer',
            'GeneralOffice', 'AccountsOfficer'];

        let hasApprovers = false;
        approverRoles.forEach(role => {
            if (roleGroups[role].length > 0) {
                hasApprovers = true;
                roleGroups[role].forEach(user => {
                    console.log(`   ${user.role}: ${user.name}`);
                    console.log(`      📧 Email:    ${user.email}`);
                    console.log(`      🔑 Password: ${role}@123`);
                    console.log('');
                });
            }
        });

        if (!hasApprovers) {
            console.log('   ⚠️  No approvers found\n');
        }

        console.log('🔐 ADMIN:\n');
        if (roleGroups['SuperAdmin'].length > 0) {
            roleGroups['SuperAdmin'].forEach(user => {
                console.log(`   ${user.name}`);
                console.log(`      📧 Email:    ${user.email}`);
                console.log(`      🔑 Password: Admin@123`);
                console.log('');
            });
        } else {
            console.log('   ⚠️  No admin found\n');
        }

        console.log('═══════════════════════════════════════════════════════════');
        console.log(`Total Users: ${users.length}`);
        console.log('═══════════════════════════════════════════════════════════\n');

        console.log('💡 NOTE: All passwords follow the pattern: [Role]@123');
        console.log('   Example: Student@123, Faculty@123, Admin@123\n');

        // Check for student profiles
        const profiles = await StudentProfile.find({}).lean();
        console.log(`📝 Student Profiles Created: ${profiles.length}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

showLoginCredentials();
