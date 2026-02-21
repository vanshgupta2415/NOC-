import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import StudentDashboard from "./pages/StudentDashboard";
import StudentApply from "./pages/StudentApply";
import StudentStatus from "./pages/StudentStatus";
import StudentCertificate from "./pages/StudentCertificate";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CompleteProfile from "./pages/CompleteProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <CompleteProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/apply"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentApply />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/status"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/certificate"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentCertificate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'Faculty',
                    'ClassCoordinator',
                    'HOD',
                    'HostelWarden',
                    'LibraryAdmin',
                    'WorkshopAdmin',
                    'TPOfficer',
                    'GeneralOffice',
                    'AccountsOfficer',
                  ]}
                >
                  <AuthorityDashboard />
                </ProtectedRoute>
              }
            />
            {/* Authority Sub-routes */}
            <Route path="/authority/pending" element={
              <ProtectedRoute allowedRoles={['Faculty', 'ClassCoordinator', 'HOD', 'HostelWarden', 'LibraryAdmin', 'WorkshopAdmin', 'TPOfficer', 'GeneralOffice', 'AccountsOfficer']}>
                <AuthorityDashboard />
              </ProtectedRoute>
            } />
            <Route path="/authority/approved" element={
              <ProtectedRoute allowedRoles={['Faculty', 'ClassCoordinator', 'HOD', 'HostelWarden', 'LibraryAdmin', 'WorkshopAdmin', 'TPOfficer', 'GeneralOffice', 'AccountsOfficer']}>
                <AuthorityDashboard />
              </ProtectedRoute>
            } />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['SuperAdmin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* Admin Sub-routes */}
            <Route path="/admin/registry" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
