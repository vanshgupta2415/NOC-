const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateUser, validateWorkflowConfig } = require('../middleware/validation');

// All admin routes require authentication and SuperAdmin role
router.use(authenticate);
router.use(authorize('SuperAdmin'));

/**
 * @route   POST /api/admin/create-user
 * @desc    Create a new user and assign role
 * @access  Private (SuperAdmin only)
 */
router.post('/create-user', validateCreateUser, adminController.createUser);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Private (SuperAdmin only)
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update user details or role
 * @access  Private (SuperAdmin only)
 */
router.put('/users/:userId', adminController.updateUser);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Deactivate a user
 * @access  Private (SuperAdmin only)
 */
router.delete('/users/:userId', adminController.deactivateUser);

/**
 * @route   GET /api/admin/applications
 * @desc    Get all applications with filters and pagination
 * @access  Private (SuperAdmin only)
 */
router.get('/applications', adminController.getAllApplications);

/**
 * @route   GET /api/admin/applications/:applicationId
 * @desc    Get detailed application information
 * @access  Private (SuperAdmin only)
 */
router.get('/applications/:applicationId', adminController.getApplicationById);

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs with pagination
 * @access  Private (SuperAdmin only)
 */
router.get('/audit-logs', adminController.getAuditLogs);

/**
 * @route   PUT /api/admin/configure-workflow
 * @desc    Configure approval workflow stages
 * @access  Private (SuperAdmin only)
 */
router.put('/configure-workflow', validateWorkflowConfig, adminController.configureWorkflow);

/**
 * @route   GET /api/admin/workflow-config
 * @desc    Get current workflow configuration
 * @access  Private (SuperAdmin only)
 */
router.get('/workflow-config', adminController.getWorkflowConfig);

/**
 * @route   GET /api/admin/statistics
 * @desc    Get system statistics and analytics
 * @access  Private (SuperAdmin only)
 */
router.get('/statistics', adminController.getStatistics);

/**
 * @route   POST /api/admin/regenerate-certificate/:applicationId
 * @desc    Regenerate certificate (admin override)
 * @access  Private (SuperAdmin only)
 */
router.post('/regenerate-certificate/:applicationId', adminController.regenerateCertificate);

module.exports = router;
