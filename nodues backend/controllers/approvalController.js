const NoDuesApplication = require('../models/NoDuesApplication');
const ApprovalStage = require('../models/ApprovalStage');
const StudentProfile = require('../models/StudentProfile');
const Documents = require('../models/Documents');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { getWorkflowStages, getNextStage } = require('../config/workflow');
const { logAudit } = require('../middleware/audit');
const { sendEmail } = require('../config/email');
const { applicationPausedTemplate, applicationApprovedTemplate, certificateIssuedTemplate } = require('../utils/emailTemplates');
const { generateCertificate } = require('../utils/certificateGenerator');

/**
 * @desc    Get pending applications for current approver
 * @route   GET /api/approvals/pending
 * @access  Private (Approver roles)
 */
exports.getPendingApprovals = async (req, res, next) => {
    try {
        const { role, department } = req.user;
        const { page = 1, limit = 10 } = req.query;

        // Roles that should filter by department
        const departmentSpecificRoles = ['Faculty', 'ClassCoordinator', 'HOD'];
        const shouldFilterByDepartment = departmentSpecificRoles.includes(role);

        // For parallel approvals: All approvers (except Accounts) see applications immediately
        // Accounts Officer only sees applications after all others have approved
        let applicationQuery = { status: 'UnderReview' };

        if (role === 'AccountsOfficer') {
            // Accounts Officer only sees applications where ALL other stages are approved
            applicationQuery.currentStage = 'AccountsOfficer';
        }

        // Find approval stages pending for this role
        const pendingStages = await ApprovalStage.find({
            role,
            status: 'Pending'
        })
            .populate({
                path: 'applicationId',
                match: applicationQuery
            })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: 1 });

        // Filter out null applications and get application IDs
        const validStages = pendingStages.filter(stage => stage.applicationId !== null);
        const applicationIds = validStages.map(stage => stage.applicationId._id);

        // Get student details for each application
        const applications = await NoDuesApplication.find({ _id: { $in: applicationIds } })
            .populate({
                path: 'studentId',
                select: 'name email',
                populate: {
                    path: 'studentId',
                    model: 'StudentProfile',
                    select: 'enrollmentNumber branch passOutYear'
                }
            });

        // Combine data
        const pendingApplications = await Promise.all(
            validStages.map(async (stage) => {
                const application = applications.find(
                    app => app._id.toString() === stage.applicationId._id.toString()
                );

                const student = await User.findById(application.studentId);
                const studentProfile = await StudentProfile.findOne({ userId: application.studentId });

                // Filter by department for Faculty, ClassCoordinator, and HOD
                if (shouldFilterByDepartment && department) {
                    // Check if student's branch matches approver's department
                    if (studentProfile.branch !== department) {
                        return null; // Skip this application
                    }
                }

                const documents = await Documents.findOne({ applicationId: application._id });

                return {
                    applicationId: application._id,
                    student: {
                        name: student.name,
                        email: student.email,
                        enrollmentNumber: studentProfile.enrollmentNumber,
                        branch: studentProfile.branch,
                        passOutYear: studentProfile.passOutYear
                    },
                    applicationStatus: application.status,
                    currentStage: application.currentStage,
                    hostelInvolved: application.hostelInvolved,
                    cautionMoneyRefund: application.cautionMoneyRefund,
                    submittedAt: application.createdAt,
                    documents: {
                        feeReceipts: documents.feeReceiptsPDF,
                        marksheets: documents.marksheetsPDF,
                        bankProof: documents.bankProofImage,
                        idProof: documents.idProofImage
                    },
                    stageInfo: {
                        officeName: stage.officeName,
                        stageOrder: stage.stageOrder
                    }
                };
            })
        );

        // Filter out null values (applications not in approver's department)
        const filteredApplications = pendingApplications.filter(app => app !== null);

        const total = filteredApplications.length;

        res.status(200).json({
            status: 'success',
            data: {
                applications: filteredApplications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get applications already handled (Approved/Paused) by current approver
 * @route   GET /api/approvals/history
 * @access  Private (Approver roles)
 */
exports.getHandledApprovals = async (req, res, next) => {
    try {
        const { role } = req.user;
        const approverId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        // Find stages handled by this user OR role (if user changed but role is same, usually we want user-specific history)
        const handledStages = await ApprovalStage.find({
            approvedBy: approverId,
            status: { $in: ['Approved', 'Paused'] }
        })
            .populate('applicationId')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ approvedAt: -1 });

        // Filter out null applications
        const validStages = handledStages.filter(stage => stage.applicationId !== null);

        const history = await Promise.all(
            validStages.map(async (stage) => {
                const application = stage.applicationId;
                const student = await User.findById(application.studentId);
                const studentProfile = await StudentProfile.findOne({ userId: application.studentId });

                return {
                    applicationId: application._id,
                    student: {
                        name: student?.name || 'Unknown',
                        email: student?.email || 'N/A',
                        enrollmentNumber: studentProfile?.enrollmentNumber || 'N/A'
                    },
                    status: stage.status,
                    handledAt: stage.approvedAt,
                    currentApplicationStatus: application.status,
                    remarks: stage.remarks
                };
            })
        );

        const total = await ApprovalStage.countDocuments({
            approvedBy: approverId,
            status: { $in: ['Approved', 'Paused'] }
        });

        res.status(200).json({
            status: 'success',
            data: {
                history,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Approve an application
 * @route   POST /api/approvals/:applicationId/approve
 * @access  Private (Approver roles)
 */
exports.approveApplication = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { role } = req.user;
        const approverId = req.user.id;
        const { libraryDues, tcNumber, tcDate } = req.body;

        const application = await NoDuesApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                status: 'error',
                message: 'Application not found'
            });
        }

        if (application.status !== 'UnderReview') {
            return res.status(400).json({
                status: 'error',
                message: 'Application is not under review'
            });
        }

        // For parallel approvals: Remove the currentStage check
        // All approvers can approve at any time (except Accounts Officer)

        // Find the current pending stage for this role
        const currentStage = await ApprovalStage.findOne({
            applicationId,
            role,
            status: 'Pending'
        });

        if (!currentStage) {
            return res.status(400).json({
                status: 'error',
                message: 'No pending approval found for your role or already approved'
            });
        }

        // Update authority specific fields in application
        if (role === 'LibraryAdmin' && libraryDues) {
            application.libraryDues = libraryDues;
        } else if (role === 'GeneralOffice') {
            if (tcNumber) application.tcNumber = tcNumber;
            if (tcDate) application.tcDate = tcDate;
        }

        // Update approval stage
        currentStage.status = 'Approved';
        currentStage.approvedBy = approverId;
        currentStage.approvedByName = req.user.name;
        currentStage.approvedAt = new Date();
        await currentStage.save();

        // Log audit
        await logAudit(
            'APPLICATION_APPROVED',
            approverId,
            applicationId,
            { stage: currentStage.officeName, role }
        );

        // Check if ALL required stages (except Accounts) are approved
        const allStages = await ApprovalStage.find({ applicationId });
        const requiredStages = allStages.filter(stage => stage.role !== 'AccountsOfficer');
        const allApproved = requiredStages.every(stage => stage.status === 'Approved');

        if (allApproved && role !== 'AccountsOfficer') {
            // All stages approved except Accounts - move to Accounts Officer
            application.currentStage = 'AccountsOfficer';
            await application.save();

            res.status(200).json({
                status: 'success',
                message: 'Application approved. All approvals complete - moved to Accounts Officer for final approval.',
                data: {
                    applicationId: application._id,
                    status: application.status,
                    currentStage: application.currentStage,
                    isFinalApproval: false,
                    allStagesApproved: true
                }
            });
        } else if (role === 'AccountsOfficer') {
            // Accounts Officer approval - Final stage, generate certificate
            application.status = 'Approved';
            application.currentStage = 'completed';
            await application.save();

            // Generate and send certificate
            try {
                await generateAndSendCertificate(application, approverId);
            } catch (certError) {
                console.error("Certificate generation failed but approval succeeded", certError);
            }

            res.status(200).json({
                status: 'success',
                message: 'Application approved. Certificate generated and sent to student.',
                data: {
                    applicationId: application._id,
                    status: 'CertificateIssued',
                    isFinalApproval: true
                }
            });
        } else {
            // This approver approved, but waiting for others
            res.status(200).json({
                status: 'success',
                message: 'Application approved successfully. Waiting for other approvers.',
                data: {
                    applicationId: application._id,
                    status: application.status,
                    currentStage: application.currentStage,
                    isFinalApproval: false,
                    yourApproval: 'Completed',
                    waitingFor: requiredStages.filter(s => s.status === 'Pending').map(s => s.officeName)
                }
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Pause an application with remarks
 * @route   POST /api/approvals/:applicationId/pause
 * @access  Private (Approver roles)
 */
exports.pauseApplication = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { remarks } = req.body;
        const { role } = req.user;
        const approverId = req.user.id;

        if (!remarks || remarks.trim().length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Remarks are required when pausing an application'
            });
        }

        const application = await NoDuesApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                status: 'error',
                message: 'Application not found'
            });
        }

        if (application.status !== 'UnderReview') {
            return res.status(400).json({
                status: 'error',
                message: 'Application is not under review'
            });
        }

        // For parallel approvals: Any approver can pause at any time
        // Find the current pending stage for this role
        const currentStage = await ApprovalStage.findOne({
            applicationId,
            role,
            status: 'Pending'
        });

        if (!currentStage) {
            return res.status(400).json({
                status: 'error',
                message: 'No pending approval found for your role or already processed'
            });
        }

        // Update approval stage
        currentStage.status = 'Paused';
        currentStage.remarks = remarks;
        currentStage.approvedBy = approverId;
        currentStage.approvedAt = new Date();
        await currentStage.save();

        // Update application status
        application.status = 'Paused';
        await application.save();

        // Log audit
        await logAudit(
            'APPLICATION_PAUSED',
            approverId,
            applicationId,
            { stage: currentStage.officeName, role, remarks }
        );

        // Send email to student
        const student = await User.findById(application.studentId);
        const studentProfile = await StudentProfile.findOne({ userId: application.studentId });

        const emailContent = applicationPausedTemplate(
            student.name,
            studentProfile.enrollmentNumber,
            currentStage.officeName,
            remarks
        );

        await sendEmail(student.email, emailContent.subject, emailContent.html);

        res.status(200).json({
            status: 'success',
            message: 'Application paused. Student has been notified.',
            data: {
                applicationId: application._id,
                status: application.status,
                pausedAt: currentStage.officeName,
                remarks
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get detailed application information
 * @route   GET /api/approvals/:applicationId/details
 * @access  Private (Approver roles)
 */
exports.getApplicationDetails = async (req, res, next) => {
    try {
        const { applicationId } = req.params;

        const application = await NoDuesApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                status: 'error',
                message: 'Application not found'
            });
        }

        const student = await User.findById(application.studentId);
        const studentProfile = await StudentProfile.findOne({ userId: application.studentId });
        const documents = await Documents.findOne({ applicationId });
        const approvalStages = await ApprovalStage.find({ applicationId })
            .sort({ stageOrder: 1 })
            .populate('approvedBy', 'name email role');

        res.status(200).json({
            status: 'success',
            data: {
                application,
                student: {
                    name: student.name,
                    email: student.email,
                    ...studentProfile.toObject()
                },
                documents,
                approvalStages
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Helper function to generate and send certificate
 */
async function generateAndSendCertificate(application, approverId) {
    try {
        // Get student details
        const student = await User.findById(application.studentId);
        const studentProfile = await StudentProfile.findOne({ userId: application.studentId });

        // Get all approval stages
        const approvalStages = await ApprovalStage.find({ applicationId: application._id })
            .sort({ stageOrder: 1 })
            .populate('approvedBy', 'name');

        // Generate certificate
        const certificateData = {
            studentName: student.name,
            enrollmentNumber: studentProfile.enrollmentNumber,
            fatherName: studentProfile.fatherName,
            emailAddress: student.email,
            dateOfBirth: studentProfile.dateOfBirth,
            branch: studentProfile.branch,
            address: studentProfile.address,
            passOutYear: studentProfile.passOutYear,
            hostelInvolved: application.hostelInvolved,
            cautionMoneyRefund: application.cautionMoneyRefund,
            libraryDues: application.libraryDues,
            tcNumber: application.tcNumber,
            tcDate: application.tcDate,
            approvalStages: approvalStages.map(stage => ({
                officeName: stage.officeName,
                role: stage.role,
                status: stage.status,
                approvedByName: stage.approvedByName || (stage.approvedBy ? stage.approvedBy.name : 'N/A'),
                approvedAt: stage.approvedAt
            })),
            issueDate: new Date()
        };

        const { certificateNumber, pdfPath } = await generateCertificate(certificateData);

        // Save certificate record
        const certificate = await Certificate.create({
            applicationId: application._id,
            certificateNumber,
            studentId: student._id,
            studentName: student.name,
            enrollmentNumber: studentProfile.enrollmentNumber,
            branch: studentProfile.branch,
            passOutYear: studentProfile.passOutYear,
            pdfPath,
            emailSent: false
        });

        // Update application status
        application.status = 'CertificateIssued';
        await application.save();

        // Send certificate via email
        const emailContent = certificateIssuedTemplate(
            student.name,
            studentProfile.enrollmentNumber,
            certificateNumber
        );

        await sendEmail(
            student.email,
            emailContent.subject,
            emailContent.html,
            [{ filename: `NoDues_Certificate_${certificateNumber}.pdf`, path: pdfPath }]
        );

        // Update certificate email status
        certificate.emailSent = true;
        await certificate.save();

        // Log audit
        await logAudit(
            'CERTIFICATE_ISSUED',
            approverId,
            application._id,
            { certificateNumber, emailSent: true }
        );

    } catch (error) {
        console.error('Error generating certificate:', error);
        throw error;
    }
}
