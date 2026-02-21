import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FadeUp } from "@/components/animations/AnimatedComponents";
import { Award, Download, Mail, CheckCircle2, PartyPopper, Loader2, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { studentAPI, ApplicationStatus, ApiResponse } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const StudentCertificate = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<ApiResponse<ApplicationStatus>>({
    queryKey: ['applicationStatus'],
    queryFn: () => studentAPI.getApplicationStatus(),
    retry: 1,
  });

  const application = data?.data?.application;
  const certificate = data?.data?.certificate;
  const isApproved = application?.status === 'CertificateIssued';

  const handleDownload = async () => {
    try {
      const response = await studentAPI.getCertificate();
      if (response.data?.pdfUrl) {
        // Open PDF in new tab or download
        window.open(response.data.pdfUrl, '_blank');
      } else {
        toast({
          title: "Download Failed",
          description: "Certificate PDF URL not available",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.response?.data?.message || "Certificate is still being generated. Please try again in few minutes.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="student" title="No Dues Certificate" subtitle="...">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="No Dues Certificate" subtitle="Download your clearance certificate">
      <div className="max-w-2xl mx-auto">
        <FadeUp>
          {isApproved ? (
            <Card className="shadow-elevated border-border/50 overflow-hidden">
              {/* Success banner */}
              <div className="relative bg-success/10 p-8 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--success)/0.1),transparent_60%)]" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <div className="w-20 h-20 rounded-2xl bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <PartyPopper className="w-10 h-10 text-success" />
                    </motion.div>
                  </div>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-foreground mb-1"
                >
                  Congratulations!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-muted-foreground"
                >
                  All departments have cleared your No Dues
                </motion.p>
              </div>

              <CardContent className="p-8 space-y-6">
                {/* Certificate preview */}
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-card">
                  <Award className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-1">No Dues Certificate</h3>
                  <p className="text-xs text-muted-foreground mb-1">Madhav Institute of Technology & Science, Gwalior</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono bg-muted py-1 px-3 rounded-full inline-block">
                    ID: NDC-{application?.id.substring(application.id.length - 8).toUpperCase()}
                  </p>

                  <div className="mt-6 pt-4 border-t border-border/50 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Student</span>
                      <span className="font-bold text-foreground">{user?.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Enrollment</span>
                      <span className="font-bold text-foreground">{user?.studentProfile?.enrollmentNumber}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Department</span>
                      <span className="font-bold text-foreground">{user?.studentProfile?.branch}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Date Issued</span>
                      <span className="font-bold text-foreground">{new Date(application?.updatedAt || "").toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-1.5 text-success text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified & Authenticated
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleDownload} className="flex-1 gap-2 h-12 font-bold gradient-hero border-0 shadow-lg">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground">
                  A copy of this certificate has been sent to your registered email.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card border-border/50 bg-muted/10">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 border border-border">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Not Yet Issued</h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Your certificate will be generated and made available here once all departments have approved your application.
                </p>
                <div className="mt-6 text-xs font-semibold text-accent flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Current Status: {application?.status || 'No Active Application'}
                </div>
              </CardContent>
            </Card>
          )}
        </FadeUp>
      </div>
    </DashboardLayout>
  );
};

export default StudentCertificate;
