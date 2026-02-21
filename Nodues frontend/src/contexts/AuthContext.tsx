import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const accessToken = localStorage.getItem('accessToken');

                if (storedUser && accessToken) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await authAPI.login(email, password);

            if (response.success && response.data) {
                const { accessToken, refreshToken, user: userData, studentProfile } = response.data;

                // Attach student profile if it exists in the response
                if (studentProfile) {
                    userData.studentProfile = studentProfile;
                }

                // Store tokens and user data
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(userData));

                setUser(userData);

                toast({
                    title: 'Login Successful',
                    description: `Welcome back, ${userData.name}!`,
                });

                // Navigate based on role
                const normalizedRole = userData.role.toLowerCase();

                if (normalizedRole === 'student') {
                    const isInstitutional = userData.email?.toLowerCase().endsWith("@mitsgwl.ac.in");

                    if (isInstitutional) {
                        navigate('/student');
                    } else {
                        // For personal IDs, check if a profile has been linked/created
                        if (userData.hasProfile) {
                            navigate('/student');
                        } else {
                            navigate('/complete-profile');
                        }
                    }
                } else if (normalizedRole === 'super_admin' || normalizedRole === 'superadmin') {
                    navigate('/admin');
                } else {
                    navigate('/authority');
                }
            }
        } catch (error: any) {
            console.error('Login error:', error);
            toast({
                title: 'Login Failed',
                description: error.response?.data?.message || 'Invalid email or password',
                variant: 'destructive',
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Called by /auth/callback after Google OAuth redirect
    const loginWithTokens = async (accessToken: string, refreshToken: string) => {
        try {
            setIsLoading(true);
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Fetch user profile using the new token
            const response = await authAPI.getMe();
            if (response.success && response.data) {
                const userData = response.data.user;

                // Attach student profile if it exists in the response
                if (response.data.studentProfile) {
                    userData.studentProfile = response.data.studentProfile;
                }

                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);

                toast({
                    title: 'Signed in with Google',
                    description: `Welcome, ${userData.name}!`,
                });

                const role = userData.role?.toLowerCase();
                if (role === 'student') {
                    const isInstitutional = userData.email?.toLowerCase().endsWith("@mitsgwl.ac.in");
                    const profile = response.data.studentProfile;

                    if (isInstitutional) {
                        navigate('/student');
                    } else {
                        // Check if the profile is more than just a placeholder
                        const isLinkedAndComplete = profile && profile.enrollmentNumber && profile.fatherName !== 'TBD';
                        if (isLinkedAndComplete) {
                            navigate('/student');
                        } else {
                            navigate('/complete-profile');
                        }
                    }
                }
                else if (role === 'superadmin') navigate('/admin');
                else navigate('/authority');
            }
        } catch (error: any) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            toast({
                title: 'Google Sign-In Failed',
                description: 'Could not complete sign-in. Please try again.',
                variant: 'destructive',
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local state regardless of API call success
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            toast({
                title: 'Logged Out',
                description: 'You have been successfully logged out.',
            });

            navigate('/login');
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithTokens,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
