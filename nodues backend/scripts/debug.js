console.log('Start debug');
try {
    const User = require('../models/User');
    console.log('User model loaded');
} catch (e) {
    console.error('User model failed', e);
}

try {
    const connectDB = require('../config/database');
    console.log('DB loaded');
} catch (e) {
    console.error('DB failed', e);
}
console.log('End debug');
