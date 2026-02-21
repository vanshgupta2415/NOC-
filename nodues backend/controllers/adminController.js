const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');
const { getApplicableStages } = require('../config/workflow');
const { logAudit } = require('../middleware/audit');
const { generateCertificate } = require('../utils/certificateGenerator');
const { sendEmail } = require('../config/email');
const { certificateIssuedTemplate } = require('../utils/emailTemplates');

/**
 * @desc    Create a new user
 * @route   POST /api/admin/create-user
 * @access  Private (SuperAdmin)
 */
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, role, department, studentProfile } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user with student profile if applicable in a transaction
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    role,
                    department: department || null,
                    isActive: true
                }
            });

            if (role === 'Student' && studentProfile) {
                await tx.studentProfile.create({
                    data: {
                        userId: user.id,
                        enrollmentNumber: studentProfile.enrollmentNumber,
                        fatherName: studentProfile.fatherName,
                        dateOfBirth: new Date(studentProfile.dateOfBirth),
                        branch: studentProfile.branch,
                        address: studentProfile.address,
                        passOutYear: Number(studentProfile.passOutYear)
                    }
                });
            }
            return user;
        });

        // Log audit
        await logAudit(
            'USER_CREATED',
            req.user.id,
            newUser.id,
            { role, email }
        );

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: {
                userId: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users with pagination
 * @route   GET /api/admin/users
 * @access  Private (SuperAdmin)
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const pageNum = parseInt(req.query.page) || 1;
        const limitNum = parseInt(req.query.limit) || 20;
        const { role, department, search } = req.query;

        // Build where clause
        const where = {};
        if (role) where.role = role;
        if (department) where.department = department;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const users = await prisma.user.findMany({
            where,
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });

        const total = await prisma.user.count({ where });

        res.status(200).json({
            status: 'success',
            data: {
                users,
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
 * @desc    Update user details
 * @route   PUT /api/admin/users/:userId
 * @access  Private (SuperAdmin)
 */
exports.updateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { name, email, role, department, isActive } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(role && { role }),
                ...(department !== undefined && { department }),
                ...(isActive !== undefined && { isActive })
            }
        });

        await logAudit('USER_UPDATED', req.user.id, userId, { updates: req.body });

        res.status(200).json({
            status: 'success',
            message: 'User updated successfully',
            data: {
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    department: updatedUser.department,
                    isActive: updatedUser.isActive
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Deactivate a user
 * @route   DELETE /api/admin/users/:userId
 * @access  Private (SuperAdmin)
 */
exports.deactivateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { isActive: false }
        });

        await logAudit('USER_DEACTIVATED', req.user.id, userId, { email: user.email });

        res.status(200).json({
            status: 'success',
            message: 'User deactivated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all applications with filters
 * @route   GET /api/admin/applications
 * @access  Private (SuperAdmin)
 */
exports.getAllApplications = async (req, res, next) => {
    try {
        const pageNum = parseInt(req.query.page) || 1;
        const limitNum = parseInt(req.query.limit) || 20;
        const { status, branch, passOutYear } = req.query;

        const where = {};
        if (status) where.status = status;
        if (branch || passOutYear) {
            where.studentProfile = {};
            if (branch) where.studentProfile.branch = branch;
            if (passOutYear) where.studentProfile.passOutYear = parseInt(passOutYear);
        }

        const applications = await prisma.noDuesApplication.findMany({
            where,
            include: {
                student: { select: { name: true, email: true } },
                studentProfile: true
            },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.noDuesApplication.count({ where });

        res.status(200).json({
            status: 'success',
            data: {
                applications,
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
 * @desc    Get application by ID
 * @route   GET /api/admin/applications/:applicationId
 * @access  Private (SuperAdmin)
 */
exports.getApplicationById = async (req, res, next) => {
    try {
        const { applicationId } = req.params;

        const application = await prisma.noDuesApplication.findUnique({
            where: { id: applicationId },
            include: {
                student: { select: { name: true, email: true } },
                studentProfile: true,
                approvalStages: {
                    orderBy: { stageOrder: 'asc' },
                    include: { approvedBy: { select: { name: true, email: true, role: true } } }
                }
            }
        });

        if (!application) {
            return res.status(404).json({
                status: 'error',
                message: 'Application not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { application }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get audit logs
 * @route   GET /api/admin/audit-logs
 * @access  Private (SuperAdmin)
 */
exports.getAuditLogs = async (req, res, next) => {
    try {
        const pageNum = parseInt(req.query.page) || 1;
        const limitNum = parseInt(req.query.limit) || 50;
        const { action, userId, startDate, endDate } = req.query;

        const where = {};
        if (action) where.action = action;
        if (userId) where.userId = userId;
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp.gte = new Date(startDate);
            if (endDate) where.timestamp.lte = new Date(endDate);
        }

        const logs = await prisma.auditLog.findMany({
            where,
            include: { user: { select: { name: true, email: true, role: true } } },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            orderBy: { timestamp: 'desc' }
        });

        const total = await prisma.auditLog.count({ where });

        res.status(200).json({
            status: 'success',
            data: {
                logs,
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
 * @desc    Configure workflow stages
 * @route   PUT /api/admin/configure-workflow
 * @access  Private (SuperAdmin)
 */
exports.configureWorkflow = async (req, res, next) => {
    try {
        return res.status(501).json({
            status: 'error',
            message: 'Dynamic workflow configuration is not currently supported (workflow is hardcoded)'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get workflow configuration
 * @route   GET /api/admin/workflow-config
 * @access  Private (SuperAdmin)
 */
exports.getWorkflowConfig = async (req, res, next) => {
    try {
        const workflowStages = getApplicableStages(false);
        const workflowStagesWithHostel = getApplicableStages(true);

        res.status(200).json({
            status: 'success',
            data: {
                standardWorkflow: workflowStages,
                hostelWorkflow: workflowStagesWithHostel
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get system statistics
 * @route   GET /api/admin/statistics
 * @access  Private (SuperAdmin)
 */
exports.getStatistics = async (req, res, next) => {
    try {
        const [totalUsers, activeUsers, usersByRole, totalApplications, applicationsByStatus,
            totalCertificates, certificatesEmailSent, recentApplications] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { isActive: true } }),
                prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
                prisma.noDuesApplication.count(),
                prisma.noDuesApplication.groupBy({ by: ['status'], _count: { _all: true } }),
                prisma.certificate.count(),
                prisma.certificate.count({ where: { emailSent: true } }),
                prisma.noDuesApplication.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: { student: { select: { name: true, email: true } } }
                })
            ]);

        res.status(200).json({
            status: 'success',
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    byRole: usersByRole.map(r => ({ role: r.role, count: r._count._all }))
                },
                applications: {
                    total: totalApplications,
                    byStatus: applicationsByStatus.map(s => ({ status: s.status, count: s._count._all }))
                },
                certificates: {
                    total: totalCertificates,
                    emailSent: certificatesEmailSent
                },
                recentActivity: recentApplications
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Regenerate certificate (admin override)
 * @route   POST /api/admin/regenerate-certificate/:applicationId
 * @access  Private (SuperAdmin)
 */
exports.regenerateCertificate = async (req, res, next) => {
    try {
        const { applicationId } = req.params;

        const application = await prisma.noDuesApplication.findUnique({
            where: { id: applicationId },
            include: {
                student: true,
                studentProfile: true,
                approvalStages: { orderBy: { stageOrder: 'asc' } }
            }
        });

        if (!application) {
            return res.status(404).json({ status: 'error', message: 'Application not found' });
        }

        if (application.status !== 'Approved' && application.status !== 'CertificateIssued') {
            return res.status(400).json({
                status: 'error',
                message: 'Application must be approved before certificate regeneration'
            });
        }

        const certificateData = {
            studentName: application.student.name,
            enrollmentNumber: application.studentProfile.enrollmentNumber,
            fatherName: application.studentProfile.fatherName,
            emailAddress: application.student.email,
            dateOfBirth: application.studentProfile.dateOfBirth,
            branch: application.studentProfile.branch,
            address: application.studentProfile.address,
            passOutYear: application.studentProfile.passOutYear,
            hostelInvolved: application.hostelInvolved,
            cautionMoneyRefund: application.cautionMoneyRefund,
            libraryDues: application.libraryDues,
            tcNumber: application.tcNumber,
            tcDate: application.tcDate,
            approvalStages: application.approvalStages.map(s => ({
                officeName: s.officeName,
                approvedByName: s.approvedByName,
                approvedAt: s.approvedAt
            })),
            issueDate: new Date()
        };

        const { certificateNumber, pdfPath } = await generateCertificate(certificateData);

        // Delete old certificate if exists, then create new
        await prisma.certificate.deleteMany({ where: { applicationId } });

        await prisma.certificate.create({
            data: {
                applicationId,
                certificateNumber,
                studentId: application.studentId,
                studentName: application.student.name,
                enrollmentNumber: application.studentProfile.enrollmentNumber,
                branch: application.studentProfile.branch,
                passOutYear: application.studentProfile.passOutYear,
                pdfPath,
                emailSent: false
            }
        });

        const emailContent = certificateIssuedTemplate({
            studentName: application.student.name,
            enrollmentNumber: application.studentProfile.enrollmentNumber,
            certificateNumber
        });

        await sendEmail({
            to: application.student.email,
            subject: emailContent.subject,
            html: emailContent.html,
            attachments: [{ filename: `NoDues_Certificate_${certificateNumber}.pdf`, path: pdfPath }]
        });

        await prisma.$transaction([
            prisma.certificate.updateMany({ where: { applicationId }, data: { emailSent: true, emailSentAt: new Date() } }),
            prisma.noDuesApplication.update({ where: { id: applicationId }, data: { status: 'CertificateIssued' } })
        ]);

        await logAudit('CERTIFICATE_REGENERATED', req.user.id, applicationId, { certificateNumber });

        res.status(200).json({
            status: 'success',
            message: 'Certificate regenerated and sent successfully',
            data: { certificateNumber, emailSent: true }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all students in registry
 * @route   GET /api/admin/student-registry
 * @access  Private (SuperAdmin)
 */
exports.getStudentRegistry = async (req, res, next) => {
    try {
        const students = await prisma.studentRegistry.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({
            status: 'success',
            data: { students }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Bulk upload students to registry
 * @route   POST /api/admin/student-registry/bulk
 * @access  Private (SuperAdmin)
 */
exports.bulkUploadStudents = async (req, res, next) => {
    try {
        const { students } = req.body; // Array of { email, enrollmentNumber, name, branch }

        if (!Array.isArray(students)) {
            return res.status(400).json({
                status: 'error',
                message: 'Students data must be an array'
            });
        }

        const results = await prisma.$transaction(
            students.map(student => prisma.studentRegistry.upsert({
                where: { email: student.email.toLowerCase() },
                update: {
                    enrollmentNumber: student.enrollmentNumber.toUpperCase(),
                    name: student.name,
                    branch: student.branch
                },
                create: {
                    email: student.email.toLowerCase(),
                    enrollmentNumber: student.enrollmentNumber.toUpperCase(),
                    name: student.name,
                    branch: student.branch
                }
            }))
        );

        res.status(200).json({
            status: 'success',
            message: `Successfully processed ${results.length} students`,
            data: { count: results.length }
        });
    } catch (error) {
        next(error);
    }
};
