require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');

async function seedUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing users (optional - comment out if you want to keep existing)
        console.log('🗑️  Clearing existing users...');
        await User.deleteMany({});
        await StudentProfile.deleteMany({});
        console.log('✅ Cleared existing data\n');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        console.log('👥 Creating users...\n');

        // 1. Create Super Admin
        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'admin@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'SuperAdmin',  // PascalCase
            isActive: true
        });
        console.log('✅ Created Super Admin');
        console.log('   📧 Email: admin@mitsgwl.ac.in');
        console.log('   🔑 Password: password123\n');

        // 2. Create Student
        const student = await User.create({
            name: 'Test Student',
            email: 'student@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'Student',  // PascalCase
            isActive: true
        });
        console.log('✅ Created Student');
        console.log('   📧 Email: student@mitsgwl.ac.in');
        console.log('   🔑 Password: password123\n');

        // Create student profile
        await StudentProfile.create({
            userId: student._id,
            enrollmentNumber: '0827CS211001',
            fatherName: 'Test Father',
            dateOfBirth: new Date('2000-01-01'),
            branch: 'Computer Science',
            address: 'Test Address, Gwalior, MP',
            passOutYear: 2024,
            phoneNumber: '9876543210'
        });
        console.log('✅ Created Student Profile\n');

        // 3. Create Faculty
        const faculty = await User.create({
            name: 'Test Faculty',
            email: 'faculty@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'Faculty',  // PascalCase
            department: 'Computer Science',
            isActive: true
        });
        console.log('✅ Created Faculty');
        console.log('   📧 Email: faculty@mitsgwl.ac.in');
        console.log('   🔑 Password: password123\n');

        // 4. Create Class Coordinator
        const coordinator = await User.create({
            name: 'Class Coordinator',
            email: 'coordinator@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'ClassCoordinator',  // PascalCase
            department: 'Computer Science',
            isActive: true
        });
        console.log('✅ Created Class Coordinator');
        console.log('   📧 Email: coordinator@mitsgwl.ac.in');
        console.log('   🔑 Password: password123\n');

        // 5. Create HOD
        const hod = await User.create({
            name: 'HOD Computer Science',
            email: 'hod@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'HOD',  // PascalCase
            department: 'Computer Science',
            isActive: true
        });
        console.log('✅ Created HOD');
        console.log('   📧 Email: hod@mitsgwl.ac.in');
        console.log('   🔑 Password: password123\n');

        // 6. Create Library Admin
        const libraryAdmin = await User.create({
            name: 'Library Admin',
            email: 'library@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'LibraryAdmin',  // PascalCase
            isActive: true
        });
        console.log('✅ Created Library Admin');
        console.log('   📧 Email: library@mitsgwl.ac.in');
        console.log('   🔑 Password: password123\n');

        // 7. Create Workshop Admin
        const workshopAdmin = await User.create({
            name: 'Workshop Admin',
            email: 'workshop@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'WorkshopAdmin',  // PascalCase
            isActive: true
        });
        console.log('✅ Created Workshop Admin');
        console.log('   📧 Email: workshop@mitsgwl.ac.in');
        console.log('   🔑 Password: password123\n');

        // 8. Create T&P Officer
        const tpOfficer = await User.create({
            name: 'Training & Placement Officer',
            email: 'tp@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'TPOfficer',  // PascalCase
            isActive: true
        });
        console.log('✅ Created T&P Officer');
        console.log('   📧 Email: tp@mitsgwl.ac.in');
        console.log('   🔑 Password: password123\n');

        // 9. Create General Office
        const generalOffice = await User.create({
            name: 'General Office Admin',
            email: 'general@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'GeneralOffice',  // PascalCase
            isActive: true
        });
        console.log('✅ Created General Office');
        console.log('   📧 Email: general@mitsgwl.ac.in');
        console.log('   🔑 Password: password123\n');

        // 10. Create Accounts Officer
        const accountsOfficer = await User.create({
            name: 'Accounts Officer',
            email: 'accounts@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'AccountsOfficer',  // PascalCase
            isActive: true
        });
        console.log('✅ Created Accounts Officer');
        console.log('   📧 Email: accounts@mitsgwl.ac.in');
        console.log('   🔑 Password: password123\n');

        console.log('═══════════════════════════════════════════════════════════');
        console.log('🎉 SUCCESS! All users created with correct roles!');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('📋 LOGIN CREDENTIALS (Password: password123 for all)\n');
        console.log('1. 👨‍🎓 Student:           student@mitsgwl.ac.in');
        console.log('2. 🔐 Super Admin:       admin@mitsgwl.ac.in');
        console.log('3. 👨‍🏫 Faculty:           faculty@mitsgwl.ac.in');
        console.log('4. 📚 Class Coordinator: coordinator@mitsgwl.ac.in');
        console.log('5. 👔 HOD:               hod@mitsgwl.ac.in');
        console.log('6. 📖 Library Admin:     library@mitsgwl.ac.in');
        console.log('7. 🔧 Workshop Admin:    workshop@mitsgwl.ac.in');
        console.log('8. 💼 T&P Officer:       tp@mitsgwl.ac.in');
        console.log('9. 🏢 General Office:    general@mitsgwl.ac.in');
        console.log('10. 💰 Accounts Officer: accounts@mitsgwl.ac.in');
        console.log('═══════════════════════════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

seedUsers();
