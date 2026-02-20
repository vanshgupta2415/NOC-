import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user) {
        const normalizedUserRole = user.role.toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

        if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
            console.warn(`Access denied for role: ${user.role}. Allowed: ${allowedRoles}. Redirecting...`);

            // Deflection logic to avoid loop
            if (normalizedUserRole === 'student' && location.pathname !== '/student') {
                return <Navigate to="/student" replace />;
            } else if ((normalizedUserRole === 'superadmin' || normalizedUserRole === 'super_admin') && location.pathname !== '/admin') {
                return <Navigate to="/admin" replace />;
            } else if (location.pathname !== '/authority') {
                return <Navigate to="/authority" replace />;
            }
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
