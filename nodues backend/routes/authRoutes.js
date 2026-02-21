const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const { validateLogin, validateRefreshToken } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const passport = require('../config/passport');
const { prisma } = require('../config/database');

// ── Standard email/password routes ──────────────────────────────────────────

/** POST /api/auth/login */
router.post('/login', validateLogin, authController.login);

/** POST /api/auth/refresh */
router.post('/refresh', validateRefreshToken, authController.refreshToken);

/** POST /api/auth/logout */
router.post('/logout', authenticate, authController.logout);

/** GET /api/auth/me */
router.get('/me', authenticate, authController.getCurrentUser);

// ── Google OAuth routes ──────────────────────────────────────────────────────

/**
 * @route   GET /api/auth/google
 * @desc    Redirect user to Google consent screen
 * @access  Public
 */
const googleCredsConfigured = () => {
    const id = process.env.GOOGLE_CLIENT_ID;
    const sec = process.env.GOOGLE_CLIENT_SECRET;
    return id && !id.includes('your-google') && sec && !sec.includes('your-google');
};

router.get('/google', (req, res, next) => {
    if (!googleCredsConfigured()) {
        return res.status(503).json({
            success: false,
            message: 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env'
        });
    }
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback — mint JWTs and redirect to frontend
 * @access  Public
 */
router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`
    }),
    async (req, res) => {
        try {
            const user = req.user;

            // Mint JWTs
            const accessToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_ACCESS_SECRET,
                { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
            );
            const refreshToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
            );

            // Persist refresh token
            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken }
            });

            // Redirect frontend — it reads query params, stores tokens, navigates to dashboard
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(
                `${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}&userId=${user.id}`
            );
        } catch (err) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendUrl}/login?error=server_error`);
        }
    }
);

module.exports = router;
