/**
 * /auth/callback
 *
 * Landing page after Google OAuth redirect.
 * The backend sends the user here with:
 *   ?token=<accessToken>&refresh=<refreshToken>&userId=<id>
 *
 * This page reads those params, stores them via AuthContext,
 * then navigates to the appropriate dashboard.
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithTokens } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get("token");
        const refresh = searchParams.get("refresh");
        const errorParam = searchParams.get("error");

        if (errorParam) {
            const messages: Record<string, string> = {
                google_auth_failed: "Google authentication failed. Please try again.",
                server_error: "A server error occurred. Please try again.",
            };
            setError(messages[errorParam] || "Authentication failed.");
            setTimeout(() => navigate("/login"), 3000);
            return;
        }

        if (!token || !refresh) {
            setError("Missing authentication data. Redirecting to login…");
            setTimeout(() => navigate("/login"), 2000);
            return;
        }

        // Store tokens and load user profile via AuthContext
        loginWithTokens(token, refresh)
            .then(() => {
                // redirect handled inside loginWithTokens based on user role
            })
            .catch(() => {
                setError("Failed to complete sign-in. Redirecting…");
                setTimeout(() => navigate("/login"), 2000);
            });
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 gradient-hero" />
            <div className="absolute inset-0 bg-grid opacity-30" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative flex flex-col items-center gap-6 text-center px-6"
            >
                {/* Logo */}
                <motion.div
                    animate={error ? {} : { rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-xl border border-primary-foreground/10 flex items-center justify-center"
                >
                    <GraduationCap className="w-8 h-8 text-primary-foreground" />
                </motion.div>

                {error ? (
                    <>
                        <p className="text-lg font-semibold text-primary-foreground">
                            ⚠️ {error}
                        </p>
                        <p className="text-sm text-primary-foreground/50">Redirecting to login…</p>
                    </>
                ) : (
                    <>
                        {/* Spinner */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-8 h-8 border-4 border-primary-foreground/20 border-t-primary-foreground rounded-full"
                        />
                        <div>
                            <p className="text-lg font-semibold text-primary-foreground">
                                Signing you in…
                            </p>
                            <p className="text-sm text-primary-foreground/50 mt-1">
                                Please wait while we set things up
                            </p>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default AuthCallback;
