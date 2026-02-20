import { useQuery } from '@tanstack/react-query';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, ArrowRight, Clock, CheckCircle2, AlertCircle, PauseCircle,
  BookOpen, Building2, Wrench, Briefcase, DollarSign, Users,
  GraduationCap, Home as HomeIcon, TrendingUp,
} from "lucide-react";
import { StaggerContainer, StaggerItem, FadeUp } from "@/components/animations/AnimatedComponents";
import { studentAPI, ApplicationStatus, ApiResponse } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const statusConfig: Record<string, { bg: string; icon: React.ElementType; label: string }> = {
  Approved: { bg: "bg-success/10 text-success border-success/20", icon: CheckCircle2, label: "Approved" },
  Pending: { bg: "bg-warning/10 text-warning border-warning/20", icon: Clock, label: "Under Review" },
  Paused: { bg: "bg-destructive/10 text-destructive border-destructive/20", icon: PauseCircle, label: "Paused" },
  waiting: { bg: "bg-muted text-muted-foreground border-border", icon: AlertCircle, label: "Waiting" },
};

const departmentIcons: Record<string, React.ElementType> = {
  Faculty: Users,
  ClassCoordinator: GraduationCap,
  HOD: Building2,
  HostelWarden: HomeIcon,
  Library: BookOpen,
  Workshop: Wrench,
  TPOfficer: Briefcase,
  GeneralOffice: Building2,
  Accounts: DollarSign,
};

const StudentDashboard = () => {
  const { user } = useAuth();

  // Fetch application status from backend
  const { data, isLoading, error } = useQuery({
    queryKey: ['applicationStatus'],
    queryFn: () => studentAPI.getApplicationStatus(),
    retry: 1,
  });

  const applicationData = data?.data;
  const approvalStages = applicationData?.approvalStages || [];
  const application = applicationData?.application;
  const hasApplication = !!application;

  // Calculate progress
  const approvedCount = approvalStages.filter((s) => s.status === "Approved").length;
  const progress = approvalStages.length > 0
    ? Math.round((approvedCount / approvalStages.length) * 100)
    : 0;

  // Get application status badge
  const getStatusBadge = () => {
    if (!hasApplication) return null;

    switch (application.status) {
      case 'UnderReview':
        return <Badge className="bg-warning/20 text-warning border-warning/30 text-xs font-medium">Application In Progress</Badge>;
      case 'Paused':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs font-medium">Action Required</Badge>;
      case 'CertificateIssued':
        return <Badge className="bg-success/20 text-success border-success/30 text-xs font-medium">Certificate Issued</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="student" title="Student Dashboard" subtitle={`Welcome back, ${user?.name}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="Student Dashboard" subtitle={`Welcome back, ${user?.name}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <FadeUp>
          <div className="relative gradient-hero rounded-2xl p-8 text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="absolute right-0 top-0 w-72 h-72 bg-accent/15 rounded-full blur-[80px]" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Welcome, {user?.name} 👋</h2>
                <p className="text-primary-foreground/60 text-sm">
                  {user?.studentProfile?.branch} — Enrollment: {user?.studentProfile?.enrollmentNumber}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {getStatusBadge()}
                </div>
              </div>
              {hasApplication && (
                <div className="text-right">
                  <div className="text-4xl font-bold">{progress}%</div>
                  <p className="text-xs text-primary-foreground/50">Completion</p>
                </div>
              )}
            </div>
            {/* Progress bar */}
            {hasApplication && (
              <div className="relative mt-6 h-2 bg-primary-foreground/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full gradient-accent rounded-full"
                />
              </div>
            )}
          </div>
        </FadeUp>

        {/* Quick Actions */}
        <StaggerContainer className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: FileText,
              title: hasApplication ? "View Application" : "Apply Now",
              desc: hasApplication ? "Review your submitted application" : "Start your no dues application",
              href: hasApplication ? "/student/status" : "/student/apply",
              color: "text-primary",
              bg: "bg-primary/8",
            },
            {
              icon: TrendingUp,
              title: "Track Status",
              desc: hasApplication ? "View real-time approvals" : "No application yet",
              href: "/student/status",
              color: "text-accent",
              bg: "bg-accent/8",
            },
            {
              icon: CheckCircle2,
              title: "Cleared",
              desc: hasApplication ? `${approvedCount} of ${approvalStages.length} departments` : "Not started",
              href: "/student/status",
              color: "text-success",
              bg: "bg-success/8",
            },
          ].map((action) => (
            <StaggerItem key={action.title}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="shadow-card border-border/50 h-full">
                  <CardContent className="p-5">
                    <div className={`w-11 h-11 rounded-xl ${action.bg} flex items-center justify-center mb-4`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <h3 className="font-bold text-sm text-foreground mb-0.5">{action.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{action.desc}</p>
                    <Link to={action.href}>
                      <Button size="sm" variant="ghost" className="gap-1 px-0 text-accent hover:text-accent/80 h-7 text-xs">
                        View Details <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Approval Progress */}
        {hasApplication && approvalStages.length > 0 && (
          <FadeUp delay={0.1}>
            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full gradient-accent" />
                  Department Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 stagger-children">
                  {approvalStages.map((stage, i) => {
                    const config = statusConfig[stage.status] || statusConfig.waiting;
                    const StatusIcon = config.icon;
                    const DeptIcon = departmentIcons[stage.role] || Building2;

                    return (
                      <motion.div
                        key={stage.officeName}
                        whileHover={{ x: 4 }}
                        className={`flex items-center justify-between p-3.5 rounded-xl border ${config.bg} transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center">
                            <DeptIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-medium block">{stage.officeName}</span>
                            <span className="text-[10px] opacity-60">
                              Department {i + 1} of {approvalStages.length}
                              {stage.approvedBy && ` • ${stage.approvedBy.name}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </FadeUp>
        )}

        {/* No Application Yet */}
        {!hasApplication && !isLoading && (
          <FadeUp delay={0.1}>
            <Card className="shadow-card border-border/50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">No Application Submitted</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  You haven't submitted a no dues application yet. Start your application to begin the clearance process.
                </p>
                <Link to="/student/apply">
                  <Button className="gap-2">
                    <FileText className="w-4 h-4" />
                    Start Application
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeUp>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <FadeUp delay={0.1}>
            <Card className="shadow-card border-destructive/50 bg-destructive/5">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">Unable to Load Data</h3>
                <p className="text-sm text-muted-foreground">
                  There was an error loading your application status. Please try again later.
                </p>
              </CardContent>
            </Card>
          </FadeUp>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
