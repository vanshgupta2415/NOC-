const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateApplication, validateResubmit } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

/**
 * @route   GET /api/student/profile
 * @desc    Get student profile
 * @access  Private (Student only)
 */
router.get(
    '/profile',
    authenticate,
    authorize('Student'),
    studentController.getProfile
);

/**
 * @route   POST /api/student/profile
 * @desc    Create or update student profile
 * @access  Private (Student only)
 */
router.post(
    '/profile',
    authenticate,
    authorize('Student'),
    studentController.createOrUpdateProfile
);

/**
 * @route   POST /api/student/application
 * @desc    Submit new No Dues application
 * @access  Private (Student only)
 */
router.post(
    '/application',
    authenticate,
    authorize('Student'),
    upload.fields([
        { name: 'feeReceiptsPDF', maxCount: 1 },
        { name: 'marksheetsPDF', maxCount: 1 },
        { name: 'bankProofImage', maxCount: 1 },
        { name: 'idProofImage', maxCount: 1 }
    ]),
    studentController.submitApplication
);

/**
 * @route   GET /api/student/application/status
 * @desc    Get current application status
 * @access  Private (Student only)
 */
router.get(
    '/application/status',
    authenticate,
    authorize('Student'),
    studentController.getApplicationStatus
);

/**
 * @route   PUT /api/student/application/resubmit
 * @desc    Resubmit paused application after resolving dues
 * @access  Private (Student only)
 */
router.put(
    '/application/resubmit',
    authenticate,
    authorize('Student'),
    upload.fields([
        { name: 'feeReceiptsPDF', maxCount: 1 },
        { name: 'marksheetsPDF', maxCount: 1 },
        { name: 'bankProofImage', maxCount: 1 },
        { name: 'idProofImage', maxCount: 1 }
    ]),
    validateResubmit,
    studentController.resubmitApplication
);

/**
 * @route   GET /api/student/certificate
 * @desc    Download No Dues certificate
 * @access  Private (Student only)
 */
router.get(
    '/certificate',
    authenticate,
    authorize('Student'),
    studentController.getCertificate
);

module.exports = router;
