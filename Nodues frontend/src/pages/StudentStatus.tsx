import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FadeUp } from "@/components/animations/AnimatedComponents";
import {
  CheckCircle2, Clock, AlertCircle, PauseCircle,
  Users, GraduationCap, Building2, BookOpen,
  Wrench, Briefcase, DollarSign, Home as HomeIcon,
  Calendar, FileText, AlertTriangle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { studentAPI, ApplicationStatus, ApiResponse } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const statusMap: Record<string, { color: string; icon: React.ElementType; label: string; dotColor: string }> = {
  Approved: { color: "text-success", icon: CheckCircle2, label: "Approved", dotColor: "bg-success" },
  Pending: { color: "text-warning", icon: Clock, label: "Under Review", dotColor: "bg-warning" },
  Paused: { color: "text-destructive", icon: PauseCircle, label: "Paused", dotColor: "bg-destructive" },
  waiting: { color: "text-muted-foreground", icon: AlertCircle, label: "Waiting", dotColor: "bg-muted-foreground/40" },
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

const formatBackendDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const StudentStatus = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['applicationStatus'],
    queryFn: () => studentAPI.getApplicationStatus(),
    retry: 1,
  });

  const applicationData = data?.data;
  const application = applicationData?.application;
  const approvalStages = applicationData?.approvalStages || [];
  const hasApplication = !!application;

  const approvedCount = approvalStages.filter((s) => s.status === "Approved").length;
  const progress = approvalStages.length > 0
    ? Math.round((approvedCount / approvalStages.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <DashboardLayout role="student" title="Application Status" subtitle="Loading status...">
        <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !hasApplication) {
    return (
      <DashboardLayout role="student" title="Application Status" subtitle="Track your no dues progress">
        <div className="max-w-3xl mx-auto px-4 mt-8">
          <Card className="shadow-card border-border/50 bg-muted/20">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Active Application</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                You haven't submitted a no dues application yet. Start your application to track its progress here.
              </p>
              <Button onClick={() => window.location.href = '/student/apply'}>Apply Now</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="Application Status" subtitle="Track your no dues progress">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Summary */}
        <FadeUp>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-foreground">Application #{application._id.substring(application._id.length - 8).toUpperCase()}</h3>
                  <p className="text-sm text-muted-foreground">Submitted on {formatBackendDate(application.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {application.status === 'UnderReview' && <Badge className="bg-warning/10 text-warning border-warning/20">In Progress</Badge>}
                  {application.status === 'Paused' && <Badge className="bg-destructive/10 text-destructive border-destructive/20">Action Required</Badge>}
                  {application.status === 'CertificateIssued' && <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>}
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full gradient-accent rounded-full"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{approvedCount} of {approvalStages.length} departments cleared</p>

              {application.status === 'Paused' && (
                <div className="mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Remarks for Attention</p>
                    <p className="text-xs text-destructive/80"> Please check your email for detailed remarks from the department. Some documents may need resubmission.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeUp>

        {/* Timeline */}
        <FadeUp delay={0.1}>
          <Card className="shadow-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full gradient-accent" />
                Approval Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-0">
                  {approvalStages.map((stage, i) => {
                    const cfg = statusMap[stage.status] || statusMap.waiting;
                    const StatusIcon = cfg.icon;
                    const DeptIcon = departmentIcons[stage.role] || Building2;
                    return (
                      <motion.div
                        key={stage.officeName}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        className="relative pl-14 py-4 group"
                      >
                        {/* Dot */}
                        <div className={`absolute left-3.5 top-5 w-3 h-3 rounded-full ${cfg.dotColor} ring-4 ring-background z-10`} />

                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <DeptIcon className="w-4 h-4 text-muted-foreground" />
                              <h4 className="text-sm font-semibold text-foreground">{stage.officeName}</h4>
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {cfg.label}
                            </div>
                            {stage.approvedBy && (
                              <p className="text-[10px] text-muted-foreground mt-1 underline decoration-border/50">
                                Approved by {stage.approvedBy.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                            <Calendar className="w-3 h-3" />
                            {formatBackendDate(stage.approvedAt)}
                          </div>
                        </div>
                        {stage.remarks && (
                          <div className="mt-2 text-xs p-2 bg-muted/30 rounded-lg border border-border/40 text-muted-foreground italic">
                            " {stage.remarks} "
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeUp>
      </div>
    </DashboardLayout>
  );
};

export default StudentStatus;
