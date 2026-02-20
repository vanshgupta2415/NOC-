const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateApproval, validatePause } = require('../middleware/validation');

// All approval routes require authentication
router.use(authenticate);

// Define roles that can approve applications
// Define roles that can approve applications
const approverRoles = [
    'Faculty',
    'ClassCoordinator',
    'HOD',
    'HostelWarden',
    'LibraryAdmin',
    'WorkshopAdmin',
    'TPOfficer',
    'GeneralOffice',
    'AccountsOfficer'
];

router.get(
    '/pending',
    authorize(...approverRoles),
    approvalController.getPendingApprovals
);

/**
 * @route   GET /api/approvals/history
 * @desc    Get handled applications history for current approver
 * @access  Private (Approver roles only)
 */
router.get(
    '/history',
    authorize(...approverRoles),
    approvalController.getHandledApprovals
);

/**
 * @route   POST /api/approvals/:applicationId/approve
 * @desc    Approve an application at current stage
 * @access  Private (Approver roles only)
 */
router.post(
    '/:applicationId/approve',
    authorize(...approverRoles),
    validateApproval,
    approvalController.approveApplication
);

/**
 * @route   POST /api/approvals/:applicationId/pause
 * @desc    Pause an application with remarks
 * @access  Private (Approver roles only)
 */
router.post(
    '/:applicationId/pause',
    authorize(...approverRoles),
    validatePause,
    approvalController.pauseApplication
);

/**
 * @route   GET /api/approvals/:applicationId/details
 * @desc    Get detailed application information
 * @access  Private (Approver roles only)
 */
router.get(
    '/:applicationId/details',
    authorize(...approverRoles),
    approvalController.getApplicationDetails
);

module.exports = router;
