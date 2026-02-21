/**
 * Google OAuth 2.0 Strategy (Passport.js)
 *
 * Flow:
 *  1. User clicks "Continue with Google"
 *  2. Frontend redirects to GET /api/auth/google  →  Google consent screen
 *  3. Google sends user back to GET /api/auth/google/callback
 *  4. We upsert the user in PostgreSQL via Prisma
 *  5. We mint a JWT access token + refresh token
 *  6. We redirect the frontend to /auth/callback?token=<accessToken>&refresh=<refreshToken>
 *     (frontend stores tokens and navigates to the dashboard)
 *
 * Required .env variables:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_CALLBACK_URL   (e.g. http://localhost:5000/api/auth/google/callback)
 *   FRONTEND_URL          (e.g. http://localhost:3000)
 */

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { prisma } = require('./database');
const logger = require('./logger');

// We do not use sessions — tokens are passed via query string redirect
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const hasRealCreds = clientID && !clientID.includes('your-google') &&
    clientSecret && !clientSecret.includes('your-google');

if (hasRealCreds) {
    passport.use(
        new GoogleStrategy(
            {
                clientID,
                clientSecret,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
                scope: ['profile', 'email'],
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    let name = profile.displayName || 'Google User';

                    if (!email) {
                        return done(new Error('No email returned from Google'), null);
                    }

                    // Institutional Email Check
                    const isStudentInstitutional = email.toLowerCase().endsWith('@mitsgwl.ac.in');
                    const isFacultyInstitutional = email.toLowerCase().endsWith('@mitsgwalior.in');

                    let enrollmentNumber = null;
                    let registeredBranch = null;

                    if (isStudentInstitutional) {
                        // TRY TO FETCH FROM REGISTRY FIRST (The requirement is "automatically fetch")
                        const registeredStudent = await prisma.studentRegistry.findUnique({
                            where: { email }
                        });

                        if (registeredStudent) {
                            enrollmentNumber = registeredStudent.enrollmentNumber;
                            name = registeredStudent.name; // Use official name from registry
                            registeredBranch = registeredStudent.branch;
                            logger.info(`Auto-fetched registry data for: ${email} -> ${enrollmentNumber}`);
                        } else {
                            // Fallback to pattern extraction if not in registry
                            enrollmentNumber = email.split('@')[0].toUpperCase();
                        }
                    }

                    let user = await prisma.user.findUnique({
                        where: { email },
                        include: { studentProfile: true }
                    });

                    if (!user) {
                        // Determine default role based on email domain
                        const defaultRole = isFacultyInstitutional ? 'Faculty' : 'Student';

                        user = await prisma.user.create({
                            data: {
                                name,
                                email,
                                passwordHash: '_google_oauth_no_password_',
                                role: defaultRole,
                                department: registeredBranch,
                                isActive: true,
                            },
                            include: { studentProfile: true }
                        });
                        logger.info(`New user via Google OAuth: ${email} (Role: ${defaultRole})`);
                    } else {
                        // Update name if changed or if it was a placeholder
                        if (user.name !== name || (registeredBranch && user.department !== registeredBranch)) {
                            user = await prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    name,
                                    department: registeredBranch || user.department
                                },
                                include: { studentProfile: true }
                            });
                        }
                        logger.info(`Existing user signed in via Google: ${email}`);
                    }

                    // If it's a student and we have institutional data,
                    // ensure the StudentProfile is synchronized.
                    if (user.role === 'Student' && enrollmentNumber) {
                        try {
                            await prisma.studentProfile.upsert({
                                where: { userId: user.id },
                                update: {
                                    enrollmentNumber, // Update to official enrollment if changed
                                    branch: registeredBranch || user.studentProfile?.branch || 'TBD'
                                },
                                create: {
                                    userId: user.id,
                                    enrollmentNumber,
                                    fatherName: 'TBD',
                                    dateOfBirth: new Date('2000-01-01'),
                                    branch: registeredBranch || 'TBD',
                                    address: 'TBD',
                                    passOutYear: new Date().getFullYear(),
                                }
                            });
                            // Re-fetch user to include the updated profile
                            user = await prisma.user.findUnique({
                                where: { id: user.id },
                                include: { studentProfile: true }
                            });
                        } catch (profileError) {
                            logger.error(`Error syncing student profile: ${profileError.message}`);
                        }
                    }

                    done(null, user);
                } catch (err) {
                    logger.error(`Google OAuth error: ${err.message}`);
                    done(err, null);
                }
            }
        )
    );
    logger.info('✅ Google OAuth strategy registered');
} else {
    logger.warn('⚠️  Google OAuth not configured — set GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in .env to enable');
}

module.exports = passport;
