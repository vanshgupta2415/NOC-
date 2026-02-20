require('dotenv').config();

console.log('Testing server startup...');

try {
    console.log('1. Loading database config...');
    const connectDB = require('./config/database');

    console.log('2. Loading logger...');
    const logger = require('./config/logger');

    console.log('3. Loading error handler...');
    const errorHandler = require('./middleware/errorHandler');

    console.log('4. Loading auth routes...');
    const authRoutes = require('./routes/authRoutes');

    console.log('5. Loading student routes...');
    const studentRoutes = require('./routes/studentRoutes');

    console.log('6. Loading approval routes...');
    const approvalRoutes = require('./routes/approvalRoutes');

    console.log('7. Loading admin routes...');
    const adminRoutes = require('./routes/adminRoutes');

    console.log('✅ All modules loaded successfully!');

} catch (error) {
    console.error('❌ Error loading modules:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
}
