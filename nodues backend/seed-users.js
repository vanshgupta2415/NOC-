require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Define User Schema (simplified version)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ['student', 'faculty', 'class_coordinator', 'hod', 'hostel_admin',
            'library_admin', 'workshop_admin', 'tp_admin', 'general_office_admin',
            'accounts_office', 'super_admin']
    },
    department: String,
    isActive: { type: Boolean, default: true },
    refreshToken: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Define StudentProfile Schema
const studentProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    enrollmentNumber: { type: String, required: true, unique: true },
    fatherName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    branch: { type: String, required: true },
    address: { type: String, required: true },
    passOutYear: { type: Number, required: true }
}, { timestamps: true });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

async function createTestUsers() {
    try {
        console.log('\n🔧 Creating test users...\n');

        // Check if users already exist
        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            console.log(`⚠️  Database already has ${existingUsers} user(s).`);
            console.log('Do you want to continue? This will create additional users.');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. Create Super Admin
        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'admin@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'super_admin',
            isActive: true
        });
        console.log('✅ Created Super Admin');
        console.log('   Email: admin@mitsgwl.ac.in');
        console.log('   Password: password123\n');

        // 2. Create Student
        const student = await User.create({
            name: 'Test Student',
            email: 'student@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'student',
            department: 'Computer Science',
            isActive: true
        });
        console.log('✅ Created Student');
        console.log('   Email: student@mitsgwl.ac.in');
        console.log('   Password: password123\n');

        // Create student profile
        await StudentProfile.create({
            userId: student._id,
            enrollmentNumber: '0827CS211001',
            fatherName: 'Test Father',
            dateOfBirth: new Date('2000-01-01'),
            branch: 'Computer Science',
            address: 'Test Address, Gwalior',
            passOutYear: 2024
        });
        console.log('✅ Created Student Profile\n');

        // 3. Create Faculty
        const faculty = await User.create({
            name: 'Test Faculty',
            email: 'faculty@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'faculty',
            department: 'Computer Science',
            isActive: true
        });
        console.log('✅ Created Faculty');
        console.log('   Email: faculty@mitsgwl.ac.in');
        console.log('   Password: password123\n');

        // 4. Create HOD
        const hod = await User.create({
            name: 'Test HOD',
            email: 'hod@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'hod',
            department: 'Computer Science',
            isActive: true
        });
        console.log('✅ Created HOD');
        console.log('   Email: hod@mitsgwl.ac.in');
        console.log('   Password: password123\n');

        // 5. Create Library Admin
        const libraryAdmin = await User.create({
            name: 'Library Admin',
            email: 'library@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'library_admin',
            isActive: true
        });
        console.log('✅ Created Library Admin');
        console.log('   Email: library@mitsgwl.ac.in');
        console.log('   Password: password123\n');

        console.log('🎉 SUCCESS! All test users created!\n');
        console.log('═══════════════════════════════════════════');
        console.log('📋 LOGIN CREDENTIALS (All use same password)');
        console.log('═══════════════════════════════════════════');
        console.log('Password for all users: password123\n');
        console.log('1. Super Admin: admin@mitsgwl.ac.in');
        console.log('2. Student: student@mitsgwl.ac.in');
        console.log('3. Faculty: faculty@mitsgwl.ac.in');
        console.log('4. HOD: hod@mitsgwl.ac.in');
        console.log('5. Library Admin: library@mitsgwl.ac.in');
        console.log('═══════════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating users:', error.message);
        if (error.code === 11000) {
            console.error('\n⚠️  Some users already exist. Try using different emails or delete existing users first.');
        }
        process.exit(1);
    }
}

// Run the script
createTestUsers();
