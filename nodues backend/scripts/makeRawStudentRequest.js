const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const NoDuesApplication = require('../models/NoDuesApplication');
const Documents = require('../models/Documents');
const ApprovalStage = require('../models/ApprovalStage');
const AuditLog = require('../models/AuditLog');
const connectDB = require('../config/database');
const { getApplicableStages } = require('../config/workflow');

async function makeRawRequest() {
    try {
        await connectDB();
        console.log('Connected to database');

        // 1. Find or create the student
        const studentEmail = 'rahul.sharma@mitsgwl.ac.in';
        let student = await User.findOne({ email: studentEmail });

        if (!student) {
            console.log('Creating test student...');
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('student123', salt);

            student = await User.create({
                name: 'Rahul Sharma',
                email: studentEmail,
                passwordHash,
                role: 'Student',
                isActive: true
            });
        }

        let profile = await StudentProfile.findOne({ userId: student._id });
        if (!profile) {
            console.log('Creating test student profile...');
            profile = await StudentProfile.create({
                userId: student._id,
                enrollmentNumber: '0801CS211001',
                fatherName: 'Mr. Mohan Sharma',
                dateOfBirth: new Date('2003-05-15'),
                branch: 'Computer Science',
                address: '123, Model Town, Gwalior, MP - 474001',
                passOutYear: 2025
            });
        }

        // 2. Clean up existing applications for clean state
        await NoDuesApplication.deleteMany({ studentId: student._id });
        await Documents.deleteMany({ studentId: student._id }); // Actually Documents uses applicationId
        // We'll clean up by application ID later

        console.log(`Creating application for ${student.name} (${profile.enrollmentNumber})`);

        // 3. Create placeholder documents
        // Since we are mocking, we just use pseudo-paths
        const mockFileData = {
            filename: 'placeholder.pdf',
            path: 'uploads/placeholder.pdf',
            size: 1024,
            uploadedAt: new Date()
        };

        const isHostel = true;
        const workflowStages = getApplicableStages(isHostel);

        const application = await NoDuesApplication.create({
            studentId: student._id,
            studentProfileId: profile._id,
            status: 'UnderReview',
            currentStage: workflowStages[0].stage,
            hostelInvolved: isHostel,
            cautionMoneyRefund: true,
            exitSurveyCompleted: true,
            feeDuesCleared: true,
            projectReportSubmitted: true,
            declarationAccepted: true
        });

        await Documents.create({
            applicationId: application._id,
            feeReceiptsPDF: mockFileData,
            marksheetsPDF: mockFileData,
            bankProofImage: mockFileData,
            idProofImage: mockFileData
        });

        const approvalStages = workflowStages.map((stage, index) => ({
            applicationId: application._id,
            officeName: stage.officeName,
            role: stage.stage,
            status: 'Pending',
            stageOrder: index
        }));

        await ApprovalStage.insertMany(approvalStages);

        await AuditLog.create({
            action: 'APPLICATION_SUBMITTED',
            userId: student._id,
            userName: student.name,
            userEmail: student.email,
            userRole: student.role,
            targetType: 'NoDuesApplication',
            targetId: application._id,
            details: { hostelInvolved: isHostel, cautionMoneyRefund: true },
            ipAddress: '127.0.0.1',
            userAgent: 'Raw Script'
        });

        console.log('\n✅ Raw Application Created Successfully!');
        console.log(`ID: ${application._id}`);
        console.log(`Current Stage: ${application.currentStage} (${workflowStages[0].officeName})`);

        process.exit(0);
    } catch (error) {
        console.error('Error Details:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
}

makeRawRequest();
