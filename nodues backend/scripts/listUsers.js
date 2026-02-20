const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const connectDB = require('../config/database');

async function debug() {
    await connectDB();
    const users = await User.find({}, 'name email role');
    console.log('Users:', users);
    const profiles = await StudentProfile.find({});
    console.log('Profiles:', profiles);
    process.exit(0);
}
debug();
