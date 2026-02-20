import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/AnimatedComponents";
import { Search, Eye, CheckCircle2, PauseCircle, Clock, Users, AlertTriangle, Loader2, History } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const AuthorityDashboard = () => {
  const location = useLocation();
  const activeView = location.pathname.includes('approved') ? 'approved' : 'pending';
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [libDues, setLibDues] = useState("Nil");
  const [tcNo, setTcNo] = useState("");
  const [tcDay, setTcDay] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => approvalAPI.getPendingApprovals(1, 50),
    enabled: activeView === 'pending',
    retry: 1,
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['approvalHistory'],
    queryFn: () => approvalAPI.getHistory(1, 50),
    enabled: activeView === 'approved',
    retry: 1,
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => approvalAPI.approveApplication(id, data),
    onSuccess: () => {
      toast({ title: "Approved Successfully ✅", description: "The application has been moved to the next stage." });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      setSelectedAppId(null);
    },
    onError: (err: any) => {
      toast({ title: "Approval Failed", description: err.response?.data?.message || "Something went wrong", variant: "destructive" });
    }
  });

  const pauseMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks: string }) => approvalAPI.pauseApplication(id, remarks),
    onSuccess: () => {
      toast({ title: "Application Paused ⏸️", description: "The student will be notified of the remarks." });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      setRemarks("");
      setSelectedAppId(null);
    },
    onError: (err: any) => {
      toast({ title: "Pause Failed", description: err.response?.data?.message || "Something went wrong", variant: "destructive" });
    }
  });

  const handleApprove = (id: string) => {
    const extraData: any = {};
    if (user?.role === 'LibraryAdmin') extraData.libraryDues = libDues;
    if (user?.role === 'GeneralOffice') {
      extraData.tcNumber = tcNo;
      extraData.tcDate = tcDay;
    }
    approveMutation.mutate({ id, data: extraData });
  };

  const handlePause = () => {
    if (selectedAppId && remarks) {
      pauseMutation.mutate({ id: selectedAppId, remarks });
    }
  };

  const getFilteredData = () => {
    if (activeView === 'pending') {
      const queryData = pendingData?.data;
      const applications = Array.isArray(queryData) ? queryData : (queryData?.applications || []);
      return applications.filter((app: any) =>
        app.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        app.applicationId?.includes(search)
      );
    } else {
      const history = historyData?.data?.history || [];
      return history.filter((app: any) =>
        app.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        app.applicationId?.includes(search)
      );
    }
  };

  const filtered = getFilteredData();
  const isLoading = activeView === 'pending' ? pendingLoading : historyLoading;

  if (isLoading) {
    return (
      <DashboardLayout role="authority" title="Authority Dashboard" subtitle="Loading data...">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="authority" title={activeView === 'pending' ? "Pending Reviews" : "Approval History"} subtitle={`${user?.role} — Portal`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pending Review", value: activeView === 'pending' ? filtered.length : pendingData?.data?.pagination?.totalItems || 0, icon: Clock, color: "text-warning", bg: "bg-warning/8" },
            { label: "Total Handled", value: activeView === 'approved' ? filtered.length : historyData?.data?.pagination?.totalItems || 0, icon: CheckCircle2, color: "text-success", bg: "bg-success/8" },
            { label: "Role", value: user?.role?.replace('Admin', ''), icon: History, color: "text-accent", bg: "bg-accent/8" },
            { label: "Avg. Time", value: "2 days", icon: Users, color: "text-primary", bg: "bg-primary/8" },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="shadow-card border-border/50">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground truncate">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Table */}
        <FadeUp delay={0.15}>
          <Card className="shadow-card border-border/50">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full gradient-accent" />
                  {activeView === 'pending' ? "Applications Awaiting Approval" : "Previously Handled Applications"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search student..."
                      className="pl-9 w-64 h-9 text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-semibold">Student</TableHead>
                      <TableHead className="text-xs font-semibold">{activeView === 'pending' ? "Stage" : "Decision"}</TableHead>
                      <TableHead className="text-xs font-semibold">{activeView === 'pending' ? "Submitted" : "Handled At"}</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item: any, i: number) => {
                      const appId = item.applicationId;
                      const student = item.student;
                      return (
                        <motion.tr
                          key={appId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell>
                            <div>
                              <p className="text-sm font-semibold">{student?.name}</p>
                              <p className="text-[10px] text-muted-foreground">{student?.email} · {student?.enrollmentNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {activeView === 'pending' ? (
                              <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-5 bg-warning/5 text-warning border-warning/20">
                                {item.currentStage?.replace('_', ' ')}
                              </Badge>
                            ) : (
                              <Badge className={item.status === 'Approved' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                                {item.status}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(activeView === 'pending' ? item.submittedAt : item.handledAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {activeView === 'pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                {(user?.role === 'LibraryAdmin' || user?.role === 'GeneralOffice') ? (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        className="h-8 px-3 text-xs gap-1 rounded-lg bg-success hover:bg-success/90 text-success-foreground"
                                        onClick={() => setSelectedAppId(appId)}
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Complete Verification</DialogTitle>
                                        <DialogDescription>
                                          Please provide the required details to clear this application.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        {user?.role === 'LibraryAdmin' && (
                                          <div className="space-y-2">
                                            <label className="text-sm font-medium">Library Dues (Amount or 'Nil')</label>
                                            <Input value={libDues} onChange={(e) => setLibDues(e.target.value)} placeholder="Nil" />
                                          </div>
                                        )}
                                        {user?.role === 'GeneralOffice' && (
                                          <>
                                            <div className="space-y-2">
                                              <label className="text-sm font-medium">TC Number</label>
                                              <Input value={tcNo} onChange={(e) => setTcNo(e.target.value)} placeholder="Enter TC Number" />
                                            </div>
                                            <div className="space-y-2">
                                              <label className="text-sm font-medium">TC Issuance Date</label>
                                              <Input type="date" value={tcDay} onChange={(e) => setTcDay(e.target.value)} />
                                            </div>
                                          </>
                                        )}
                                      </div>
                                      <DialogFooter>
                                        <Button onClick={() => handleApprove(appId)} className="gap-2 rounded-xl" disabled={approveMutation.isPending}>
                                          {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                          Finalize Approval
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="h-8 px-3 text-xs gap-1 rounded-lg bg-success hover:bg-success/90 text-success-foreground"
                                    onClick={() => handleApprove(appId)}
                                    disabled={approveMutation.isPending}
                                  >
                                    {approveMutation.isPending && selectedAppId === appId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    Approve
                                  </Button>
                                )}

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-3 text-xs gap-1 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/5"
                                      onClick={() => setSelectedAppId(appId)}
                                    >
                                      <PauseCircle className="w-3.5 h-3.5" /> Pause
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Pause Application</DialogTitle>
                                      <DialogDescription>
                                        Provide remarks for pausing {student?.name}'s application.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                      placeholder="Reason for pausing (e.g. library book pending)..."
                                      value={remarks}
                                      onChange={(e) => setRemarks(e.target.value)}
                                      className="min-h-[120px] rounded-xl"
                                    />
                                    <DialogFooter>
                                      <Button
                                        variant="destructive"
                                        onClick={handlePause}
                                        className="gap-2 rounded-xl"
                                        disabled={!remarks || pauseMutation.isPending}
                                      >
                                        {pauseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PauseCircle className="w-4 h-4" />}
                                        Confirm Pause
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                                <Eye className="w-3.5 h-3.5" /> View Details
                              </Button>
                            )}
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="font-bold text-foreground">All Clear!</h3>
                  <p className="text-sm text-muted-foreground">No applications found in this section.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeUp>
      </div>
    </DashboardLayout>
  );
};

export default AuthorityDashboard;
