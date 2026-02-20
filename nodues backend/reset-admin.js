require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema definition
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    isActive: { type: Boolean, default: true }
});

const User = mongoose.connection.models.User || mongoose.model('User', userSchema);

async function resetAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        // Delete existing admin if any
        await User.deleteOne({ email: 'admin@mitsgwl.ac.in' });

        // Create new admin
        await User.create({
            name: 'MITS Admin',
            email: 'admin@mitsgwl.ac.in',
            passwordHash: hashedPassword,
            role: 'super_admin',
            isActive: true
        });

        console.log('Admin user has been RESET successfully!');
        console.log('Login: admin@mitsgwl.ac.in');
        console.log('Password: Admin@123');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

resetAdmin();
