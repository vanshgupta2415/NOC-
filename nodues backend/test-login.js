const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/database');
const User = require('./models/User');

async function testLogin() {
    try {
        await connectDB();

        console.log('\n🔍 Testing Login Functionality...\n');

        // Find all users
        const users = await User.find({}).select('+passwordHash');
        console.log(`📊 Total users in database: ${users.length}\n`);

        if (users.length === 0) {
            console.log('❌ No users found! Run seed-users.js first.\n');
            process.exit(1);
        }

        // Display all users
        console.log('👥 Available Users:\n');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Active: ${user.isActive}`);
            console.log('');
        });

        // Test password for student
        const testEmail = 'student@mitsgwl.ac.in';
        const testPassword = 'password123';

        console.log('🧪 Testing Login Credentials:\n');
        console.log(`   Email: ${testEmail}`);
        console.log(`   Password: ${testPassword}\n`);

        const user = await User.findOne({ email: testEmail }).select('+passwordHash');

        if (!user) {
            console.log(`❌ User not found with email: ${testEmail}\n`);
            console.log('Available emails:');
            users.forEach(u => console.log(`   - ${u.email}`));
            process.exit(1);
        }

        console.log(`✅ User found: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}\n`);

        // Test password
        const isMatch = await bcrypt.compare(testPassword, user.passwordHash);

        if (isMatch) {
            console.log('✅ Password matches! Login should work.\n');
        } else {
            console.log('❌ Password does NOT match!\n');
            console.log('Trying alternative passwords...\n');

            const alternatives = ['Student@123', 'student123', 'Password123', 'admin123'];
            for (const alt of alternatives) {
                const match = await bcrypt.compare(alt, user.passwordHash);
                if (match) {
                    console.log(`✅ Found matching password: ${alt}\n`);
                    break;
                }
            }
        }

        // Check role format
        console.log('🔍 Checking Role Format:\n');
        console.log(`   Database role: "${user.role}"`);
        console.log(`   Expected by backend: One of these formats`);
        console.log(`   - Lowercase with underscore: student, faculty, etc.`);
        console.log(`   - PascalCase: Student, Faculty, etc.\n`);

        // Check User model schema
        const UserModel = mongoose.model('User');
        const roleEnum = UserModel.schema.path('role').enumValues;
        console.log('📋 Valid roles in User model:');
        roleEnum.forEach(role => console.log(`   - ${role}`));
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

testLogin();
