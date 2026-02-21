const { prisma } = require('../config/database');
const { getApplicableStages } = require('../config/workflow');
const { logAudit } = require('../middleware/audit');
const { sendEmail } = require('../config/email');
const { applicationSubmittedTemplate, applicationPausedTemplate } = require('../utils/emailTemplates');

/**
 * @desc    Link personal account to institutional record
 * @route   POST /api/student/complete-profile
 * @access  Private (Student)
 */
exports.linkAndCompleteProfile = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const {
            enrollmentNumber,
            institutionalEmail
        } = req.body;

        if (!enrollmentNumber || !institutionalEmail) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both enrollment number and institutional email.'
            });
        }

        // 1. Verify against StudentRegistry
        const registryEntry = await prisma.studentRegistry.findFirst({
            where: {
                email: institutionalEmail.toLowerCase(),
                enrollmentNumber: enrollmentNumber.toUpperCase()
            }
        });

        if (!registryEntry) {
            return res.status(403).json({
                success: false,
                message: 'Verification failed. The provided email and enrollment number do not match our records.'
            });
        }

        // 2. Check if this enrollment is already linked to another account
        const existingProfile = await prisma.studentProfile.findUnique({
            where: { enrollmentNumber: registryEntry.enrollmentNumber }
        });

        if (existingProfile && existingProfile.userId !== studentId) {
            return res.status(400).json({
                success: false,
                message: 'This institutional record is already linked to another account.'
            });
        }

        // 3. Update User record with official registry data
        await prisma.user.update({
            where: { id: studentId },
            data: {
                name: registryEntry.name,
                department: registryEntry.branch
            }
        });

        // 4. Create/Update StudentProfile
        const profile = await prisma.studentProfile.upsert({
            where: { userId: studentId },
            update: {
                enrollmentNumber: registryEntry.enrollmentNumber,
                branch: registryEntry.branch || 'TBD',
            },
            create: {
                userId: studentId,
                enrollmentNumber: registryEntry.enrollmentNumber,
                branch: registryEntry.branch || 'TBD',
                fatherName: 'TBD',
                dateOfBirth: new Date('2000-01-01'),
                address: 'TBD',
                passOutYear: new Date().getFullYear(),
            }
        });

        await logAudit(
            'PROFILE_LINKED_VIA_REGISTRY',
            studentId,
            profile.id,
            { enrollmentNumber: registryEntry.enrollmentNumber, institutionalEmail }
        );

        res.status(200).json({
            success: true,
            message: 'Account linked and verified successfully',
            data: { profile, name: registryEntry.name }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create or update student profile
 * @route   POST /api/student/profile
 * @access  Private (Student)
 */
exports.createOrUpdateProfile = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const {
            enrollmentNumber,
            fatherName,
            dateOfBirth,
            branch,
            address,
            passOutYear,
            phoneNumber
        } = req.body;

        let profile = await prisma.studentProfile.findUnique({ where: { userId: studentId } });

        if (profile) {
            // Update existing profile
            profile = await prisma.studentProfile.update({
                where: { userId: studentId },
                data: {
                    enrollmentNumber: enrollmentNumber || profile.enrollmentNumber,
                    fatherName: fatherName || profile.fatherName,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : profile.dateOfBirth,
                    branch: branch || profile.branch,
                    address: address || profile.address,
                    passOutYear: passOutYear ? Number(passOutYear) : profile.passOutYear,
                    phoneNumber: phoneNumber || profile.phoneNumber
                }
            });

            await logAudit(
                'PROFILE_UPDATED',
                studentId,
                profile.id,
                { updatedFields: req.body }
            );

            return res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
                data: { profile }
            });
        }

        // Create new profile
        profile = await prisma.studentProfile.create({
            data: {
                userId: studentId,
                enrollmentNumber,
                fatherName,
                dateOfBirth: new Date(dateOfBirth),
                branch,
                address,
                passOutYear: Number(passOutYear),
                phoneNumber
            }
        });

        await logAudit(
            'PROFILE_CREATED',
            studentId,
            profile.id,
            { enrollmentNumber }
        );

        res.status(201).json({
            status: 'success',
            message: 'Profile created successfully',
            data: { profile }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get student profile
 * @route   GET /api/student/profile
 * @access  Private (Student)
 */
exports.getProfile = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const profile = await prisma.studentProfile.findUnique({ where: { userId: studentId } });

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { profile }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Submit new No Dues application
 * @route   POST /api/student/application
 * @access  Private (Student)
 */
exports.submitApplication = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        // Check if student profile exists
        const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
        if (!studentProfile) {
            return res.status(400).json({
                status: 'error',
                message: 'Student profile not found. Please complete your profile first.'
            });
        }

        // Check if student already has an active application
        const existingApplication = await prisma.noDuesApplication.findFirst({
            where: {
                studentId,
                status: { in: ['Submitted', 'UnderReview', 'Paused'] }
            }
        });

        if (existingApplication) {
            return res.status(400).json({
                status: 'error',
                message: 'You already have an active application. Please wait for it to be processed.'
            });
        }

        // ... (file validation logic remains same)
        const missingFiles = [];
        if (!req.files) {
            return res.status(400).json({
                status: 'error',
                message: 'No files were uploaded. Please upload all required documents.'
            });
        }

        if (!req.files.feeReceiptsPDF || !req.files.feeReceiptsPDF[0]) {
            missingFiles.push('Fee Receipts PDF');
        }
        if (!req.files.marksheetsPDF || !req.files.marksheetsPDF[0]) {
            missingFiles.push('Marksheets PDF');
        }
        if (!req.files.bankProofImage || !req.files.bankProofImage[0]) {
            missingFiles.push('Bank Proof Image');
        }
        if (!req.files.idProofImage || !req.files.idProofImage[0]) {
            missingFiles.push('ID Proof Image');
        }

        if (missingFiles.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: `Missing required documents: ${missingFiles.join(', ')}. Please upload all 4 documents.`
            });
        }

        const {
            hostelInvolved,
            cautionMoneyRefund,
            exitSurveyCompleted,
            feeDuesCleared,
            projectReportSubmitted,
            declarationAccepted
        } = req.body;

        // Create application and related records in a transaction
        const isHostel = hostelInvolved === 'true' || hostelInvolved === true;
        const workflowStages = getApplicableStages(isHostel);

        const application = await prisma.noDuesApplication.create({
            data: {
                studentId,
                studentProfileId: studentProfile.id,
                status: 'UnderReview', // Set directly to UnderReview as per workflow
                currentStage: workflowStages[0].stage,
                hostelInvolved: isHostel,
                cautionMoneyRefund: cautionMoneyRefund === 'true' || cautionMoneyRefund === true,
                exitSurveyCompleted: exitSurveyCompleted === 'true' || exitSurveyCompleted === true,
                feeDuesCleared: feeDuesCleared === 'true' || feeDuesCleared === true,
                projectReportSubmitted: projectReportSubmitted === 'true' || projectReportSubmitted === true,
                declarationAccepted: declarationAccepted === 'true' || declarationAccepted === true,
                documents: {
                    create: {
                        feeReceiptsPDF_filename: req.files.feeReceiptsPDF[0].filename,
                        feeReceiptsPDF_path: req.files.feeReceiptsPDF[0].path,
                        feeReceiptsPDF_size: req.files.feeReceiptsPDF[0].size,
                        feeReceiptsPDF_uploadedAt: new Date(),
                        marksheetsPDF_filename: req.files.marksheetsPDF[0].filename,
                        marksheetsPDF_path: req.files.marksheetsPDF[0].path,
                        marksheetsPDF_size: req.files.marksheetsPDF[0].size,
                        marksheetsPDF_uploadedAt: new Date(),
                        bankProofImage_filename: req.files.bankProofImage[0].filename,
                        bankProofImage_path: req.files.bankProofImage[0].path,
                        bankProofImage_size: req.files.bankProofImage[0].size,
                        bankProofImage_uploadedAt: new Date(),
                        idProofImage_filename: req.files.idProofImage[0].filename,
                        idProofImage_path: req.files.idProofImage[0].path,
                        idProofImage_size: req.files.idProofImage[0].size,
                        idProofImage_uploadedAt: new Date()
                    }
                },
                approvalStages: {
                    create: workflowStages.map((stage, index) => ({
                        officeName: stage.officeName,
                        role: stage.stage,
                        status: 'Pending',
                        stageOrder: index
                    }))
                }
            }
        });

        // Log audit
        await logAudit(
            'APPLICATION_SUBMITTED',
            studentId,
            application.id,
            { hostelInvolved, cautionMoneyRefund }
        );

        // Send confirmation email (best-effort)
        try {
            const user = req.user;
            const emailContent = applicationSubmittedTemplate({
                studentName: user.name,
                enrollmentNumber: studentProfile.enrollmentNumber
            });
            await sendEmail({ to: user.email, subject: emailContent.subject, html: emailContent.html });
        } catch (emailError) {
            console.error('Failed to send submission confirmation email:', emailError.message);
        }

        res.status(201).json({
            status: 'success',
            message: 'Application submitted successfully',
            data: {
                applicationId: application.id,
                status: application.status,
                currentStage: application.currentStage
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get application status
 * @route   GET /api/student/application/status
 * @access  Private (Student)
 */
exports.getApplicationStatus = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        const application = await prisma.noDuesApplication.findFirst({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            include: {
                approvalStages: {
                    orderBy: { stageOrder: 'asc' },
                    include: { approvedBy: { select: { name: true, email: true } } }
                },
                documents: true,
                certificate: true
            }
        });

        if (!application) {
            return res.status(404).json({
                status: 'error',
                message: 'No application found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                application,
                approvalStages: application.approvalStages,
                documents: application.documents,
                certificate: application.certificate
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Resubmit paused application
 * @route   PUT /api/student/application/resubmit
 * @access  Private (Student)
 */
exports.resubmitApplication = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const { applicationId } = req.body;

        const application = await prisma.noDuesApplication.findFirst({
            where: {
                id: applicationId,
                studentId,
                status: 'Paused'
            }
        });

        if (!application) {
            return res.status(404).json({
                status: 'error',
                message: 'Paused application not found'
            });
        }

        // Update documents if new files uploaded
        if (req.files) {
            const updateData = {};
            if (req.files.feeReceiptsPDF) {
                updateData.feeReceiptsPDF_filename = req.files.feeReceiptsPDF[0].filename;
                updateData.feeReceiptsPDF_path = req.files.feeReceiptsPDF[0].path;
                updateData.feeReceiptsPDF_size = req.files.feeReceiptsPDF[0].size;
                updateData.feeReceiptsPDF_uploadedAt = new Date();
            }
            if (req.files.marksheetsPDF) {
                updateData.marksheetsPDF_filename = req.files.marksheetsPDF[0].filename;
                updateData.marksheetsPDF_path = req.files.marksheetsPDF[0].path;
                updateData.marksheetsPDF_size = req.files.marksheetsPDF[0].size;
                updateData.marksheetsPDF_uploadedAt = new Date();
            }
            if (req.files.bankProofImage) {
                updateData.bankProofImage_filename = req.files.bankProofImage[0].filename;
                updateData.bankProofImage_path = req.files.bankProofImage[0].path;
                updateData.bankProofImage_size = req.files.bankProofImage[0].size;
                updateData.bankProofImage_uploadedAt = new Date();
            }
            if (req.files.idProofImage) {
                updateData.idProofImage_filename = req.files.idProofImage[0].filename;
                updateData.idProofImage_path = req.files.idProofImage[0].path;
                updateData.idProofImage_size = req.files.idProofImage[0].size;
                updateData.idProofImage_uploadedAt = new Date();
            }

            await prisma.documents.update({
                where: { applicationId: application.id },
                data: updateData
            });
        }

        // Update application status
        await prisma.noDuesApplication.update({
            where: { id: application.id },
            data: { status: 'UnderReview' }
        });

        // Reset the paused stage to Pending
        await prisma.approvalStage.updateMany({
            where: {
                applicationId: application.id,
                role: application.currentStage,
                status: 'Paused'
            },
            data: {
                status: 'Pending',
                remarks: null
            }
        });

        // Log audit
        await logAudit(
            'APPLICATION_RESUBMITTED',
            studentId,
            application.id,
            { previousStatus: 'Paused' }
        );

        res.status(200).json({
            status: 'success',
            message: 'Application resubmitted successfully',
            data: {
                applicationId: application.id,
                status: 'UnderReview'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get No Dues certificate
 * @route   GET /api/student/certificate
 * @access  Private (Student)
 */
exports.getCertificate = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        const application = await prisma.noDuesApplication.findFirst({
            where: {
                studentId,
                status: 'CertificateIssued'
            },
            include: { certificate: true }
        });

        if (!application || !application.certificate) {
            return res.status(404).json({
                status: 'error',
                message: 'No certificate found. Your application may still be under review.'
            });
        }

        const certificate = application.certificate;

        res.status(200).json({
            status: 'success',
            data: {
                certificateNumber: certificate.certificateNumber,
                issuedAt: certificate.issuedAt,
                pdfUrl: `/certificates/${certificate.pdfPath}`,
                emailSent: certificate.emailSent
            }
        });
    } catch (error) {
        next(error);
    }
};
