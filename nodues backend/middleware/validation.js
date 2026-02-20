const { z } = require('zod');
const logger = require('../config/logger');

// Validation middleware factory
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors
                });
            }

            logger.error(`Validation error: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during validation'
            });
        }
    };
};

// Common validation schemas
const schemas = {
    // User registration
    register: z.object({
        body: z.object({
            name: z.string().min(2).max(100),
            email: z.string().email(),
            password: z.string().min(8).regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            ),
            role: z.enum([
                'student',
                'faculty',
                'class_coordinator',
                'hod',
                'hostel_admin',
                'library_admin',
                'workshop_admin',
                'tp_admin',
                'general_office_admin',
                'accounts_office'
            ]),
            department: z.string().optional()
        })
    }),

    // Login
    login: z.object({
        body: z.object({
            email: z.string().email(),
            password: z.string().min(1)
        })
    }),

    // Student profile
    studentProfile: z.object({
        body: z.object({
            enrollmentNumber: z.string().min(5).max(20),
            fatherName: z.string().min(2).max(100),
            dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
                message: 'Invalid date format'
            }),
            branch: z.enum([
                'Computer Science',
                'Electronics',
                'Mechanical',
                'Civil',
                'Electrical',
                'Information Technology'
            ]),
            address: z.string().min(10).max(500),
            passOutYear: z.number().min(2020).max(2050),
            phoneNumber: z.string().regex(/^[0-9]{10}$/).optional()
        })
    }),

    // No dues application
    noDuesApplication: z.object({
        body: z.object({
            hostelInvolved: z.boolean(),
            cautionMoneyRefund: z.boolean().optional(),
            declarationAccepted: z.boolean().refine((val) => val === true, {
                message: 'You must accept the declaration'
            })
        })
    }),

    // Approval action
    approvalAction: z.object({
        body: z.object({
            action: z.enum(['approve', 'pause']),
            remarks: z.string().max(500).optional()
        }),
        params: z.object({
            applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID')
        })
    }),

    // Create user (admin)
    createUser: z.object({
        body: z.object({
            name: z.string().min(2).max(100),
            email: z.string().email(),
            password: z.string().min(8),
            role: z.enum([
                'student',
                'faculty',
                'class_coordinator',
                'hod',
                'hostel_admin',
                'library_admin',
                'workshop_admin',
                'tp_admin',
                'general_office_admin',
                'accounts_office',
                'super_admin'
            ]),
            department: z.string().optional()
        })
    }),

    // Refresh token
    refreshToken: z.object({
        body: z.object({
            refreshToken: z.string().min(1, 'Refresh token is required')
        })
    }),

    // Workflow configuration
    workflowConfig: z.object({
        body: z.object({
            stages: z.array(z.object({
                role: z.string(),
                order: z.number(),
                isActive: z.boolean()
            }))
        })
    }),

    // MongoDB ObjectId param
    mongoId: z.object({
        params: z.object({
            id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
        })
    })
};

// Export individual validation middlewares
const validateLogin = validate(schemas.login);
const validateRegister = validate(schemas.register);
const validateRefreshToken = validate(schemas.refreshToken);
const validateStudentProfile = validate(schemas.studentProfile);
const validateApplication = validate(schemas.noDuesApplication);
const validateResubmit = validate(schemas.noDuesApplication);
const validateApproval = validate(schemas.approvalAction);
const validatePause = validate(schemas.approvalAction);
const validateCreateUser = validate(schemas.createUser);
const validateWorkflowConfig = validate(schemas.workflowConfig);
const validateMongoId = validate(schemas.mongoId);

module.exports = {
    validate,
    schemas,
    validateLogin,
    validateRegister,
    validateRefreshToken,
    validateStudentProfile,
    validateApplication,
    validateResubmit,
    validateApproval,
    validatePause,
    validateCreateUser,
    validateWorkflowConfig,
    validateMongoId
};
