const { prisma } = require('../config/database');
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
        const pageNum = parseInt(req.query.page) || 1;
        const limitNum = parseInt(req.query.limit) || 10;

        // Find approval stages pending for this role
        // For parallel approvals: All approvers see applications immediately
        // Accounts Officer only sees applications after all others have approved
        const pendingStages = await prisma.approvalStage.findMany({
            where: {
                role,
                status: 'Pending',
                application: {
                    status: 'UnderReview',
                    ...(role === 'AccountsOfficer' ? { currentStage: 'AccountsOfficer' } : {})
                }
            },
            include: {
                application: {
                    include: {
                        student: { select: { name: true, email: true } },
                        studentProfile: true,
                        documents: true
                    }
                }
            },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            orderBy: { createdAt: 'asc' }
        });

        // Filter and map the data
        const departmentSpecificRoles = ['Faculty', 'ClassCoordinator', 'HOD'];
        const shouldFilterByDepartment = departmentSpecificRoles.includes(role);

        const pendingApplications = pendingStages
            .map(stage => {
                const app = stage.application;
                const profile = app.studentProfile;
                const student = app.student;

                // Filter by department if applicable
                if (shouldFilterByDepartment && department && profile.branch !== department) {
                    return null;
                }

                return {
                    applicationId: app.id,
                    student: {
                        name: student.name,
                        email: student.email,
                        enrollmentNumber: profile.enrollmentNumber,
                        branch: profile.branch,
                        passOutYear: profile.passOutYear
                    },
                    applicationStatus: app.status,
                    currentStage: app.currentStage,
                    hostelInvolved: app.hostelInvolved,
                    cautionMoneyRefund: app.cautionMoneyRefund,
                    submittedAt: app.createdAt,
                    documents: {
                        feeReceipts: { filename: app.documents.feeReceiptsPDF_filename, path: app.documents.feeReceiptsPDF_path },
                        marksheets: { filename: app.documents.marksheetsPDF_filename, path: app.documents.marksheetsPDF_path },
                        bankProof: { filename: app.documents.bankProofImage_filename, path: app.documents.bankProofImage_path },
                        idProof: { filename: app.documents.idProofImage_filename, path: app.documents.idProofImage_path }
                    },
                    stageInfo: {
                        officeName: stage.officeName,
                        stageOrder: stage.stageOrder
                    }
                };
            })
            .filter(app => app !== null);

        const totalItemsCount = await prisma.approvalStage.count({
            where: {
                role,
                status: 'Pending',
                application: {
                    status: 'UnderReview',
                    ...(role === 'AccountsOfficer' ? { currentStage: 'AccountsOfficer' } : {})
                }
            }
        });

        res.status(200).json({
            status: 'success',
            data: {
                applications: pendingApplications,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalItemsCount / limitNum),
                    totalItems: totalItemsCount,
                    itemsPerPage: limitNum
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
exports.getHistory = async (req, res, next) => {
    try {
        const approverId = req.user.id;
        const pageNum = parseInt(req.query.page) || 1;
        const limitNum = parseInt(req.query.limit) || 10;

        const handledStages = await prisma.approvalStage.findMany({
            where: {
                approvedById: approverId,
                status: { in: ['Approved', 'Paused'] }
            },
            include: {
                application: {
                    include: {
                        student: { select: { name: true, email: true } },
                        studentProfile: { select: { enrollmentNumber: true } }
                    }
                }
            },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            orderBy: { approvedAt: 'desc' }
        });

        const history = handledStages.map(stage => ({
            applicationId: stage.applicationId,
            student: {
                name: stage.application.student?.name || 'Unknown',
                email: stage.application.student?.email || 'N/A',
                enrollmentNumber: stage.application.studentProfile?.enrollmentNumber || 'N/A'
            },
            status: stage.status,
            handledAt: stage.approvedAt,
            currentApplicationStatus: stage.application.status,
            remarks: stage.remarks
        }));

        const total = await prisma.approvalStage.count({
            where: { approvedById: approverId, status: { in: ['Approved', 'Paused'] } }
        });

        res.status(200).json({
            status: 'success',
            data: {
                history,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalItems: total,
                    itemsPerPage: limitNum
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

        const application = await prisma.noDuesApplication.findUnique({
            where: { id: applicationId },
            include: { approvalStages: true }
        });

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

        // Find the current pending stage for this role
        const currentStage = application.approvalStages.find(s => s.role === role && s.status === 'Pending');

        if (!currentStage) {
            return res.status(400).json({
                status: 'error',
                message: 'No pending approval found for your role or already approved'
            });
        }

        // Update authority specific fields and approval stage in a transaction
        await prisma.$transaction(async (tx) => {
            // Update application fields if necessary
            if (role === 'LibraryAdmin' && libraryDues) {
                await tx.noDuesApplication.update({
                    where: { id: applicationId },
                    data: { libraryDues }
                });
            } else if (role === 'GeneralOffice') {
                const updateData = {};
                if (tcNumber) updateData.tcNumber = tcNumber;
                if (tcDate) updateData.tcDate = new Date(tcDate);
                if (Object.keys(updateData).length > 0) {
                    await tx.noDuesApplication.update({
                        where: { id: applicationId },
                        data: updateData
                    });
                }
            }

            // Update approval stage
            await tx.approvalStage.update({
                where: { id: currentStage.id },
                data: {
                    status: 'Approved',
                    approvedById: approverId,
                    approvedByName: req.user.name,
                    approvedByEmail: req.user.email,
                    approvedAt: new Date()
                }
            });
        });

        // Log audit
        await logAudit(
            'APPLICATION_APPROVED',
            approverId,
            applicationId,
            { stage: currentStage.officeName, role }
        );

        // Fetch updated stages to check if all are approved
        const allStages = await prisma.approvalStage.findMany({ where: { applicationId } });
        const requiredStages = allStages.filter(stage => stage.role !== 'AccountsOfficer');
        const allApproved = requiredStages.every(stage => stage.status === 'Approved');

        if (allApproved && role !== 'AccountsOfficer') {
            // All stages approved except Accounts - move to Accounts Officer
            await prisma.noDuesApplication.update({
                where: { id: applicationId },
                data: { currentStage: 'AccountsOfficer' }
            });

            res.status(200).json({
                status: 'success',
                message: 'Application approved. All approvals complete - moved to Accounts Officer for final approval.',
                data: {
                    applicationId: application.id,
                    status: application.status,
                    currentStage: 'AccountsOfficer',
                    isFinalApproval: false,
                    allStagesApproved: true
                }
            });
        } else if (role === 'AccountsOfficer') {
            // Accounts Officer approval - Final stage
            const updatedApp = await prisma.noDuesApplication.update({
                where: { id: applicationId },
                data: { status: 'Approved', currentStage: 'completed' }
            });

            // Generate and send certificate
            try {
                // Ensure we have full application data for certificate
                const fullApp = await prisma.noDuesApplication.findUnique({
                    where: { id: applicationId },
                    include: { student: true, studentProfile: true, approvalStages: true }
                });
                await generateAndSendCertificate(fullApp, approverId);
            } catch (certError) {
                console.error("Certificate generation failed but approval succeeded", certError);
            }

            res.status(200).json({
                status: 'success',
                message: 'Application approved. Certificate generated and sent to student.',
                data: {
                    applicationId: application.id,
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
                    applicationId: application.id,
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

        const application = await prisma.noDuesApplication.findUnique({ where: { id: applicationId } });
        if (!application) {
            return res.status(404).json({ status: 'error', message: 'Application not found' });
        }

        if (application.status !== 'UnderReview') {
            return res.status(400).json({ status: 'error', message: 'Application is not under review' });
        }

        const currentStage = await prisma.approvalStage.findFirst({
            where: { applicationId, role, status: 'Pending' }
        });

        if (!currentStage) {
            return res.status(400).json({
                status: 'error',
                message: 'No pending approval found for your role or already processed'
            });
        }

        const approver = await prisma.user.findUnique({ where: { id: approverId } });

        await prisma.$transaction([
            prisma.approvalStage.update({
                where: { id: currentStage.id },
                data: {
                    status: 'Paused',
                    remarks,
                    approvedById: approverId,
                    approvedByName: approver?.name,
                    approvedByEmail: approver?.email,
                    approvedAt: new Date()
                }
            }),
            prisma.noDuesApplication.update({
                where: { id: applicationId },
                data: { status: 'Paused', pausedAt: new Date() }
            })
        ]);

        await logAudit('APPLICATION_PAUSED', approverId, applicationId, { stage: currentStage.officeName, role, remarks });

        // Send email to student (best-effort — don't fail the pause if email fails)
        try {
            const student = await prisma.user.findUnique({ where: { id: application.studentId } });
            const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: application.studentId } });

            if (student && studentProfile) {
                const emailContent = applicationPausedTemplate({
                    studentName: student.name,
                    enrollmentNumber: studentProfile.enrollmentNumber,
                    officeName: currentStage.officeName,
                    remarks
                });

                await sendEmail({ to: student.email, subject: emailContent.subject, html: emailContent.html });
            }
        } catch (emailError) {
            console.error('Failed to send pause notification email:', emailError.message);
        }

        res.status(200).json({
            status: 'success',
            message: 'Application paused. Student has been notified.',
            data: {
                applicationId,
                status: 'Paused',
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

        const application = await prisma.noDuesApplication.findUnique({
            where: { id: applicationId },
            include: {
                student: { select: { name: true, email: true } },
                studentProfile: true,
                documents: true,
                approvalStages: {
                    orderBy: { stageOrder: 'asc' },
                    include: { approvedBy: { select: { name: true, email: true, role: true } } }
                }
            }
        });

        if (!application) {
            return res.status(404).json({ status: 'error', message: 'Application not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                application,
                student: application.student,
                documents: application.documents,
                approvalStages: application.approvalStages
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
        // Application data is already included if called from approveApplication
        const student = application.student;
        const studentProfile = application.studentProfile;
        const approvalStages = application.approvalStages;

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
                approvedByName: stage.approvedByName,
                approvedAt: stage.approvedAt
            })),
            issueDate: new Date()
        };

        const { certificateNumber, pdfPath } = await generateCertificate(certificateData);

        // Save certificate record
        const certificate = await prisma.certificate.create({
            data: {
                applicationId: application.id,
                certificateNumber,
                studentId: student.id,
                studentName: student.name,
                enrollmentNumber: studentProfile.enrollmentNumber,
                branch: studentProfile.branch,
                passOutYear: studentProfile.passOutYear,
                pdfPath,
                emailSent: false
            }
        });

        // Update application status
        await prisma.noDuesApplication.update({
            where: { id: application.id },
            data: { status: 'CertificateIssued' }
        });

        // Send certificate via email
        const emailContent = certificateIssuedTemplate({
            studentName: student.name,
            enrollmentNumber: studentProfile.enrollmentNumber,
            certificateNumber
        });

        await sendEmail({
            to: student.email,
            subject: emailContent.subject,
            html: emailContent.html,
            attachments: [{ filename: `NoDues_Certificate_${certificateNumber}.pdf`, path: pdfPath }]
        });

        // Update certificate email status
        await prisma.certificate.update({
            where: { id: certificate.id },
            data: { emailSent: true, emailSentAt: new Date() }
        });

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
