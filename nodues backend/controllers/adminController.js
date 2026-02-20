const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const NoDuesApplication = require('../models/NoDuesApplication');
const ApprovalStage = require('../models/ApprovalStage');
const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');
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
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            passwordHash,
            role,
            department: department || null,
            isActive: true
        });

        // If role is Student, create student profile
        if (role === 'Student' && studentProfile) {
            await StudentProfile.create({
                userId: user._id,
                enrollmentNumber: studentProfile.enrollmentNumber,
                fatherName: studentProfile.fatherName,
                dateOfBirth: studentProfile.dateOfBirth,
                branch: studentProfile.branch,
                address: studentProfile.address,
                passOutYear: studentProfile.passOutYear
            });
        }

        // Log audit
        await logAudit(
            'USER_CREATED',
            req.user.id,
            user._id,
            { role, email }
        );

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role
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
        const { page = 1, limit = 20, role, department, search } = req.query;

        // Build filter
        const filter = {};
        if (role) filter.role = role;
        if (department) filter.department = department;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-passwordHash')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        res.status(200).json({
            status: 'success',
            data: {
                users,
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
 * @desc    Update user details
 * @route   PUT /api/admin/users/:userId
 * @access  Private (SuperAdmin)
 */
exports.updateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { name, email, role, department, isActive } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (department !== undefined) user.department = department;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        // Log audit
        await logAudit(
            'USER_UPDATED',
            req.user.id,
            userId,
            { updates: req.body }
        );

        res.status(200).json({
            status: 'success',
            message: 'User updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    isActive: user.isActive
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

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        user.isActive = false;
        await user.save();

        // Log audit
        await logAudit(
            'USER_DEACTIVATED',
            req.user.id,
            userId,
            { email: user.email }
        );

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
        const { page = 1, limit = 20, status, branch, passOutYear } = req.query;

        // Build filter
        const filter = {};
        if (status) filter.status = status;

        const applications = await NoDuesApplication.find(filter)
            .populate({
                path: 'studentId',
                select: 'name email'
            })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Get student profiles and filter by branch/passOutYear if needed
        const enrichedApplications = await Promise.all(
            applications.map(async (app) => {
                const studentProfile = await StudentProfile.findOne({ userId: app.studentId });

                // Apply additional filters
                if (branch && studentProfile.branch !== branch) return null;
                if (passOutYear && studentProfile.passOutYear !== parseInt(passOutYear)) return null;

                return {
                    ...app.toObject(),
                    studentProfile
                };
            })
        );

        // Filter out nulls
        const filteredApplications = enrichedApplications.filter(app => app !== null);

        const total = await NoDuesApplication.countDocuments(filter);

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
 * @desc    Get application by ID
 * @route   GET /api/admin/applications/:applicationId
 * @access  Private (SuperAdmin)
 */
exports.getApplicationById = async (req, res, next) => {
    try {
        const { applicationId } = req.params;

        const application = await NoDuesApplication.findById(applicationId)
            .populate('studentId', 'name email');

        if (!application) {
            return res.status(404).json({
                status: 'error',
                message: 'Application not found'
            });
        }

        const studentProfile = await StudentProfile.findOne({ userId: application.studentId });
        const approvalStages = await ApprovalStage.find({ applicationId })
            .sort({ stageOrder: 1 })
            .populate('approvedBy', 'name email role');

        res.status(200).json({
            status: 'success',
            data: {
                application,
                studentProfile,
                approvalStages
            }
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
        const { page = 1, limit = 50, action, userId, startDate, endDate } = req.query;

        // Build filter
        const filter = {};
        if (action) filter.action = action;
        if (userId) filter.userId = userId;
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(filter)
            .populate('userId', 'name email role')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ timestamp: -1 });

        const total = await AuditLog.countDocuments(filter);

        res.status(200).json({
            status: 'success',
            data: {
                logs,
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
        // User statistics
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        // Application statistics
        const totalApplications = await NoDuesApplication.countDocuments();
        const applicationsByStatus = await NoDuesApplication.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Certificate statistics
        const totalCertificates = await Certificate.countDocuments();
        const certificatesEmailSent = await Certificate.countDocuments({ emailSent: true });

        // Recent activity
        const recentApplications = await NoDuesApplication.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('studentId', 'name email');

        res.status(200).json({
            status: 'success',
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    byRole: usersByRole
                },
                applications: {
                    total: totalApplications,
                    byStatus: applicationsByStatus
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

        const application = await NoDuesApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                status: 'error',
                message: 'Application not found'
            });
        }

        if (application.status !== 'Approved' && application.status !== 'CertificateIssued') {
            return res.status(400).json({
                status: 'error',
                message: 'Application must be approved before certificate regeneration'
            });
        }

        // Get student details
        const student = await User.findById(application.studentId);
        const studentProfile = await StudentProfile.findOne({ userId: application.studentId });
        const approvalStages = await ApprovalStage.find({ applicationId })
            .sort({ stageOrder: 1 })
            .populate('approvedBy', 'name');

        // Generate certificate
        const certificateData = {
            student: {
                name: student.name,
                enrollmentNumber: studentProfile.enrollmentNumber,
                fatherName: studentProfile.fatherName,
                branch: studentProfile.branch,
                passOutYear: studentProfile.passOutYear
            },
            approvalStages: approvalStages.map(stage => ({
                officeName: stage.officeName,
                approvedBy: stage.approvedBy.name,
                approvedAt: stage.approvedAt
            })),
            issuedAt: new Date()
        };

        const { certificateNumber, pdfPath } = await generateCertificate(certificateData);

        // Delete old certificate if exists
        await Certificate.findOneAndDelete({ applicationId });

        // Create new certificate
        const certificate = await Certificate.create({
            applicationId,
            certificateNumber,
            pdfPath,
            emailSent: false
        });

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

        certificate.emailSent = true;
        await certificate.save();

        application.status = 'CertificateIssued';
        await application.save();

        // Log audit
        await logAudit(
            'CERTIFICATE_REGENERATED',
            req.user.id,
            applicationId,
            { certificateNumber }
        );

        res.status(200).json({
            status: 'success',
            message: 'Certificate regenerated and sent successfully',
            data: {
                certificateNumber,
                emailSent: true
            }
        });
    } catch (error) {
        next(error);
    }
};
