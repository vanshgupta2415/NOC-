const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const NoDuesApplication = require('./models/NoDuesApplication');
const ApprovalStage = require('./models/ApprovalStage');

async function debugTPOfficer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check if T&P Officer user exists
        console.log('🔍 Checking T&P Officer user:\n');
        const tpUsers = await User.find({
            $or: [
                { role: 'TPOfficer' },
                { role: 'TPO' },
                { role: 'tp_admin' },
                { email: /tp@/i }
            ]
        });

        if (tpUsers.length === 0) {
            console.log('❌ No T&P Officer user found!\n');
        } else {
            tpUsers.forEach(user => {
                console.log(`User found:`);
                console.log(`  Name: ${user.name}`);
                console.log(`  Email: ${user.email}`);
                console.log(`  Role: ${user.role}`);
                console.log(`  Active: ${user.isActive}`);
                console.log('');
            });
        }

        // Check applications
        console.log('📋 Checking applications:\n');
        const applications = await NoDuesApplication.find({}).sort({ createdAt: -1 }).limit(3);
        console.log(`Total applications: ${applications.length}\n`);

        if (applications.length > 0) {
            const latestApp = applications[0];
            console.log(`Latest application:`);
            console.log(`  ID: ${latestApp._id}`);
            console.log(`  Status: ${latestApp.status}`);
            console.log(`  Current Stage: ${latestApp.currentStage}`);
            console.log('');

            // Check approval stages for this application
            console.log('🔍 Approval stages for this application:\n');
            const stages = await ApprovalStage.find({ applicationId: latestApp._id }).sort({ stageOrder: 1 });

            stages.forEach(stage => {
                console.log(`${stage.officeName}:`);
                console.log(`  Role: ${stage.role}`);
                console.log(`  Status: ${stage.status}`);
                console.log(`  Order: ${stage.stageOrder}`);
                console.log('');
            });

            // Check specifically for TPOfficer stage
            const tpStage = stages.find(s => s.role === 'TPOfficer');
            if (tpStage) {
                console.log('✅ TPOfficer stage exists');
                console.log(`   Status: ${tpStage.status}`);
            } else {
                console.log('❌ TPOfficer stage NOT found!');
                console.log('   Available roles in stages:');
                stages.forEach(s => console.log(`   - ${s.role}`));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugTPOfficer();
