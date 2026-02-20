const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const ApprovalStage = require('./models/ApprovalStage');
const NoDuesApplication = require('./models/NoDuesApplication');

async function testTPOfficerQuery() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get T&P Officer user
        const tpUser = await User.findOne({ email: 'tp@mitsgwl.ac.in' });
        if (!tpUser) {
            console.log('❌ T&P Officer user not found!');
            process.exit(1);
        }

        console.log('👤 T&P Officer User:');
        console.log(`   Name: ${tpUser.name}`);
        console.log(`   Email: ${tpUser.email}`);
        console.log(`   Role: ${tpUser.role}`);
        console.log(`   Department: ${tpUser.department || 'N/A'}`);
        console.log('');

        const role = tpUser.role;

        // Simulate the query from getPendingApprovals
        console.log('🔍 Simulating getPendingApprovals query:\n');

        // Step 1: Find pending stages for TPOfficer role
        console.log('Step 1: Finding pending approval stages...');
        const pendingStages = await ApprovalStage.find({
            role: role,
            status: 'Pending'
        });

        console.log(`   Found ${pendingStages.length} pending stages for role "${role}"\n`);

        if (pendingStages.length === 0) {
            console.log('❌ No pending stages found!');
            process.exit(0);
        }

        // Step 2: Populate applications
        console.log('Step 2: Checking applications...');

        let applicationQuery = { status: 'UnderReview' };

        if (role === 'AccountsOfficer') {
            applicationQuery.currentStage = 'AccountsOfficer';
        }

        console.log(`   Application query:`, applicationQuery);
        console.log('');

        for (const stage of pendingStages) {
            console.log(`Checking stage ${stage._id}:`);

            const app = await NoDuesApplication.findById(stage.applicationId);

            if (!app) {
                console.log(`   ❌ Application not found`);
                continue;
            }

            console.log(`   Application ID: ${app._id}`);
            console.log(`   Status: ${app.status}`);
            console.log(`   Current Stage: ${app.currentStage}`);

            // Check if application matches query
            const matches = app.status === applicationQuery.status &&
                (!applicationQuery.currentStage || app.currentStage === applicationQuery.currentStage);

            console.log(`   Matches query: ${matches ? '✅ YES' : '❌ NO'}`);
            console.log('');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

testTPOfficerQuery();
