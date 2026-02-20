require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models (Simplified for Seeding)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    department: String,
    isActive: { type: Boolean, default: true }
});

const User = mongoose.connection.models.User || mongoose.model('User', userSchema);

const studentProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    enrollmentNumber: { type: String, required: true, unique: true },
    fatherName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    branch: { type: String, required: true },
    address: { type: String, required: true },
    passOutYear: { type: Number, required: true }
});

const StudentProfile = mongoose.connection.models.StudentProfile || mongoose.model('StudentProfile', studentProfileSchema);

const TEST_USERS = [
    { name: 'MITS Admin', email: 'admin@mitsgwl.ac.in', role: 'SuperAdmin' },
    { name: 'Test Student', email: 'student@mitsgwl.ac.in', role: 'Student', dept: 'Computer Science' },
    { name: 'Dr. Faculty', email: 'faculty@mitsgwl.ac.in', role: 'Faculty', dept: 'Computer Science' },
    { name: 'Prof. Coordinator', email: 'coordinator@mitsgwl.ac.in', role: 'ClassCoordinator', dept: 'Computer Science' },
    { name: 'HOD CSE', email: 'hod@mitsgwl.ac.in', role: 'HOD', dept: 'Computer Science' },
    { name: 'Hostel Manager', email: 'hostel@mitsgwl.ac.in', role: 'HostelWarden' },
    { name: 'Librarian', email: 'library@mitsgwl.ac.in', role: 'LibraryAdmin' },
    { name: 'Workshop In-charge', email: 'workshop@mitsgwl.ac.in', role: 'WorkshopAdmin' },
    { name: 'T&P Officer', email: 'tp@mitsgwl.ac.in', role: 'TPOfficer' },
    { name: 'Office Head', email: 'office@mitsgwl.ac.in', role: 'GeneralOffice' },
    { name: 'Accounts Officer', email: 'accounts@mitsgwl.ac.in', role: 'AccountsOfficer' }
];

async function seedAll() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing users and profiles
        const emails = TEST_USERS.map(u => u.email);
        await User.deleteMany({ email: { $in: emails } });
        await StudentProfile.deleteMany({}); // Clear all profiles to avoid duplicate enrollment numbers
        console.log('🧹 Cleared existing test users and student profiles');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        for (const userData of TEST_USERS) {
            const user = await User.create({
                name: userData.name,
                email: userData.email,
                role: userData.role,
                department: userData.dept || null,
                passwordHash: hashedPassword,
                isActive: true
            });
            console.log(`👤 Created ${userData.role}: ${userData.email}`);

            if (userData.role === 'Student') {
                await StudentProfile.deleteMany({ userId: user._id });
                await StudentProfile.create({
                    userId: user._id,
                    enrollmentNumber: '0827CS211001',
                    fatherName: 'Ram Singh',
                    dateOfBirth: new Date('2002-05-20'),
                    branch: 'Computer Science',
                    address: 'MITS Campus, Gwalior',
                    passOutYear: 2024
                });
                console.log(`   └─ Student Profile Created for ${userData.email}`);
            }
        }

        console.log('\n🎉 ALL 11 TEST USERS CREATED SUCCESSFULLY!');
        console.log('------------------------------------------');
        console.log('Password for ALL accounts: Admin@123');
        console.log('------------------------------------------\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seedAll();
