const mongoose = require('mongoose');
require('dotenv').config();

const NoDuesApplication = require('./models/NoDuesApplication');
const ApprovalStage = require('./models/ApprovalStage');
const User = require('./models/User');

async function checkApplications() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check applications
        const applications = await NoDuesApplication.find({}).sort({ createdAt: -1 }).limit(5);
        console.log(`📋 Total Applications: ${applications.length}\n`);

        if (applications.length > 0) {
            applications.forEach((app, index) => {
                console.log(`Application ${index + 1}:`);
                console.log(`  ID: ${app._id}`);
                console.log(`  Status: ${app.status}`);
                console.log(`  Current Stage: ${app.currentStage}`);
                console.log(`  Created: ${app.createdAt}`);
                console.log('');
            });

            // Check approval stages for the latest application
            const latestApp = applications[0];
            console.log(`🔍 Checking approval stages for application: ${latestApp._id}\n`);

            const stages = await ApprovalStage.find({ applicationId: latestApp._id }).sort({ stageOrder: 1 });
            console.log(`Total Stages: ${stages.length}\n`);

            stages.forEach((stage, index) => {
                console.log(`Stage ${index + 1}:`);
                console.log(`  Office: ${stage.officeName}`);
                console.log(`  Role: ${stage.role}`);
                console.log(`  Status: ${stage.status}`);
                console.log(`  Order: ${stage.stageOrder}`);
                console.log('');
            });
        }

        // Check users with approver roles
        console.log('👥 Checking approver users:\n');
        const approvers = await User.find({
            role: { $nin: ['Student', 'SuperAdmin'] }
        }).select('name email role');

        approvers.forEach(user => {
            console.log(`${user.name}:`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Role: ${user.role}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkApplications();
