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

// Define User Schema matches backend/models/User.js
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    department: String,
    isActive: { type: Boolean, default: true },
    refreshToken: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Define StudentProfile Schema matches backend/models/StudentProfile.js
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

async function createSpecificStudent() {
    try {
        const email = '24eo10va34@mitsgwl.ac.in';
        const enrollment = '24EO10VA34'; // Derived from email

        console.log(`\n🔧 configuring user: ${email}...\n`);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. Find or Create User
        let user = await User.findOne({ email });

        if (user) {
            console.log('ℹ️  User already exists. Updating role to student...');
            user.role = 'student';
            user.isActive = true;
            user.passwordHash = hashedPassword; // Reset password to ensure access
            await user.save();
            console.log('✅ User updated.');
        } else {
            console.log('ℹ️  Creating new user...');
            user = await User.create({
                name: 'Student 24EO10VA34',
                email: email,
                passwordHash: hashedPassword,
                role: 'student',
                department: 'Electronics', // Default
                isActive: true
            });
            console.log('✅ User created.');
        }

        // 2. Ensure Student Profile exists
        let profile = await StudentProfile.findOne({ userId: user._id });

        if (profile) {
            console.log('ℹ️  Student profile already exists.');
        } else {
            console.log('ℹ️  Creating student profile...');
            await StudentProfile.create({
                userId: user._id,
                enrollmentNumber: enrollment,
                fatherName: 'Not Provided',
                dateOfBirth: new Date('2000-01-01'),
                branch: 'Electronics',
                address: 'MITS Gwalior',
                passOutYear: 2028
            });
            console.log('✅ Student profile created.');
        }

        console.log('\n🎉 SUCCESS! Account configured.');
        console.log('═══════════════════════════════════════════');
        console.log(`Email:    ${email}`);
        console.log(`Password: password123`);
        console.log(`Role:     Student`);
        console.log('═══════════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createSpecificStudent();
