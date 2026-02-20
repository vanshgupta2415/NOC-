const NoDuesApplication = require('../models/NoDuesApplication');
const StudentProfile = require('../models/StudentProfile');
const Documents = require('../models/Documents');
const ApprovalStage = require('../models/ApprovalStage');
const Certificate = require('../models/Certificate');
const { getApplicableStages } = require('../config/workflow');
const { logAudit } = require('../middleware/audit');
const { sendEmail } = require('../config/email');
const { applicationSubmittedTemplate, applicationPausedTemplate } = require('../utils/emailTemplates');

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
            passOutYear
        } = req.body;

        let profile = await StudentProfile.findOne({ userId: studentId });

        if (profile) {
            // Update existing profile
            profile.enrollmentNumber = enrollmentNumber || profile.enrollmentNumber;
            profile.fatherName = fatherName || profile.fatherName;
            profile.dateOfBirth = dateOfBirth || profile.dateOfBirth;
            profile.branch = branch || profile.branch;
            profile.address = address || profile.address;
            profile.passOutYear = passOutYear || profile.passOutYear;

            await profile.save();

            await logAudit(
                'PROFILE_UPDATED',
                studentId,
                profile._id,
                { updatedFields: req.body }
            );

            return res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
                data: { profile }
            });
        }

        // Create new profile
        profile = await StudentProfile.create({
            userId: studentId,
            enrollmentNumber,
            fatherName,
            dateOfBirth,
            branch,
            address,
            passOutYear
        });

        await logAudit(
            'PROFILE_CREATED',
            studentId,
            profile._id,
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
        const profile = await StudentProfile.findOne({ userId: studentId });

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
        const studentProfile = await StudentProfile.findOne({ userId: studentId });
        if (!studentProfile) {
            return res.status(400).json({
                status: 'error',
                message: 'Student profile not found. Please complete your profile first.'
            });
        }

        // Check if student already has an active application
        const existingApplication = await NoDuesApplication.findOne({
            studentId,
            status: { $in: ['Submitted', 'UnderReview', 'Paused'] }
        });

        if (existingApplication) {
            return res.status(400).json({
                status: 'error',
                message: 'You already have an active application. Please wait for it to be processed.'
            });
        }

        // Validate required files with detailed error messages
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

        // Create application
        const isHostel = hostelInvolved === 'true' || hostelInvolved === true;
        const workflowStages = getApplicableStages(isHostel);

        const application = await NoDuesApplication.create({
            studentId,
            studentProfileId: studentProfile._id,
            status: 'Submitted',
            currentStage: workflowStages[0].stage,
            hostelInvolved: isHostel,
            cautionMoneyRefund: cautionMoneyRefund === 'true' || cautionMoneyRefund === true,
            exitSurveyCompleted: exitSurveyCompleted === 'true' || exitSurveyCompleted === true,
            feeDuesCleared: feeDuesCleared === 'true' || feeDuesCleared === true,
            projectReportSubmitted: projectReportSubmitted === 'true' || projectReportSubmitted === true,
            declarationAccepted: declarationAccepted === 'true' || declarationAccepted === true
        });

        // Save documents
        await Documents.create({
            applicationId: application._id,
            feeReceiptsPDF: {
                filename: req.files.feeReceiptsPDF[0].filename,
                path: req.files.feeReceiptsPDF[0].path,
                size: req.files.feeReceiptsPDF[0].size,
                uploadedAt: new Date()
            },
            marksheetsPDF: {
                filename: req.files.marksheetsPDF[0].filename,
                path: req.files.marksheetsPDF[0].path,
                size: req.files.marksheetsPDF[0].size,
                uploadedAt: new Date()
            },
            bankProofImage: {
                filename: req.files.bankProofImage[0].filename,
                path: req.files.bankProofImage[0].path,
                size: req.files.bankProofImage[0].size,
                uploadedAt: new Date()
            },
            idProofImage: {
                filename: req.files.idProofImage[0].filename,
                path: req.files.idProofImage[0].path,
                size: req.files.idProofImage[0].size,
                uploadedAt: new Date()
            }
        });

        // Create approval stages
        const approvalStages = workflowStages.map((stage, index) => ({
            applicationId: application._id,
            officeName: stage.officeName,
            role: stage.stage,
            status: index === 0 ? 'Pending' : 'Pending',
            stageOrder: index
        }));

        await ApprovalStage.insertMany(approvalStages);

        // Update application status
        application.status = 'UnderReview';
        await application.save();

        // Log audit
        await logAudit(
            'APPLICATION_SUBMITTED',
            studentId,
            application._id,
            { hostelInvolved, cautionMoneyRefund }
        );

        // Send confirmation email
        const user = req.user;
        const emailContent = applicationSubmittedTemplate(
            user.name,
            studentProfile.enrollmentNumber,
            application._id
        );

        await sendEmail(user.email, emailContent.subject, emailContent.html);

        res.status(201).json({
            status: 'success',
            message: 'Application submitted successfully',
            data: {
                applicationId: application._id,
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

        const application = await NoDuesApplication.findOne({ studentId })
            .sort({ createdAt: -1 });

        if (!application) {
            return res.status(404).json({
                status: 'error',
                message: 'No application found'
            });
        }

        // Get approval stages
        const approvalStages = await ApprovalStage.find({ applicationId: application._id })
            .sort({ stageOrder: 1 })
            .populate('approvedBy', 'name email');

        // Get documents
        const documents = await Documents.findOne({ applicationId: application._id });

        // Get certificate if issued
        let certificate = null;
        if (application.status === 'CertificateIssued') {
            certificate = await Certificate.findOne({ applicationId: application._id });
        }

        res.status(200).json({
            status: 'success',
            data: {
                application,
                approvalStages,
                documents,
                certificate
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

        const application = await NoDuesApplication.findOne({
            _id: applicationId,
            studentId,
            status: 'Paused'
        });

        if (!application) {
            return res.status(404).json({
                status: 'error',
                message: 'Paused application not found'
            });
        }

        // Update documents if new files uploaded
        if (req.files) {
            const documents = await Documents.findOne({ applicationId: application._id });

            if (req.files.feeReceiptsPDF) {
                documents.feeReceiptsPDF = {
                    filename: req.files.feeReceiptsPDF[0].filename,
                    path: req.files.feeReceiptsPDF[0].path,
                    size: req.files.feeReceiptsPDF[0].size,
                    uploadedAt: new Date()
                };
            }
            if (req.files.marksheetsPDF) {
                documents.marksheetsPDF = {
                    filename: req.files.marksheetsPDF[0].filename,
                    path: req.files.marksheetsPDF[0].path,
                    size: req.files.marksheetsPDF[0].size,
                    uploadedAt: new Date()
                };
            }
            if (req.files.bankProofImage) {
                documents.bankProofImage = {
                    filename: req.files.bankProofImage[0].filename,
                    path: req.files.bankProofImage[0].path,
                    size: req.files.bankProofImage[0].size,
                    uploadedAt: new Date()
                };
            }
            if (req.files.idProofImage) {
                documents.idProofImage = {
                    filename: req.files.idProofImage[0].filename,
                    path: req.files.idProofImage[0].path,
                    size: req.files.idProofImage[0].size,
                    uploadedAt: new Date()
                };
            }

            await documents.save();
        }

        // Update application status
        application.status = 'UnderReview';
        await application.save();

        // Reset the paused stage to Pending
        await ApprovalStage.findOneAndUpdate(
            {
                applicationId: application._id,
                role: application.currentStage,
                status: 'Paused'
            },
            {
                status: 'Pending',
                remarks: null
            }
        );

        // Log audit
        await logAudit(
            'APPLICATION_RESUBMITTED',
            studentId,
            application._id,
            { previousStatus: 'Paused' }
        );

        res.status(200).json({
            status: 'success',
            message: 'Application resubmitted successfully',
            data: {
                applicationId: application._id,
                status: application.status
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

        const application = await NoDuesApplication.findOne({
            studentId,
            status: 'CertificateIssued'
        });

        if (!application) {
            return res.status(404).json({
                status: 'error',
                message: 'No certificate found. Your application may still be under review.'
            });
        }

        const certificate = await Certificate.findOne({ applicationId: application._id });

        if (!certificate) {
            return res.status(404).json({
                status: 'error',
                message: 'Certificate not found'
            });
        }

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
