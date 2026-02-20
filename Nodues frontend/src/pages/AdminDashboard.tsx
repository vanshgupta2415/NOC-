import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/AnimatedComponents";
import { Users, Shield, BarChart3, Activity, FileCheck, AlertTriangle, TrendingUp, Settings as SettingsIcon, Loader2, Plus, Search, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'admin';
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "Password@123", role: "Faculty", department: "Computer Science" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminAPI.getStatistics(),
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => adminAPI.getAuditLogs({ limit: 10 }),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminAPI.getAllUsers({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminAPI.createUser(data),
    onSuccess: () => {
      toast({ title: "User Created Successfully", description: "The new user has been added to the system." });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsDialogOpen(false);
      setNewUser({ name: "", email: "", password: "Password@123", role: "Faculty", department: "Computer Science" });
    },
    onError: (err: any) => {
      toast({ title: "Creation Failed", description: err.response?.data?.message || "Something went wrong", variant: "destructive" });
    }
  });

  const stats = statsData?.data || {
    users: { total: 0 },
    applications: { total: 0 },
    certificates: { total: 0, emailSent: 0 },
    recentActivity: []
  };

  const auditLogs = logsData?.data?.logs || [];
  const users = usersData?.data?.users || [];

  const filteredUsers = users.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateUser = () => {
    createMutation.mutate(newUser);
  };

  if (statsLoading || logsLoading || usersLoading) {
    return (
      <DashboardLayout role="admin" title="Super Admin Dashboard" subtitle="Loading metrics...">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <FadeUp>
            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full gradient-accent" />
                    User Management
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-9 w-64 h-9 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2 h-9">
                          <Plus className="w-4 h-4" /> Create User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] rounded-2xl">
                        <DialogHeader>
                          <DialogTitle>Create New User</DialogTitle>
                          <DialogDescription>
                            Add a new user to the system. Default password is Password@123.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="col-span-3 h-9" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="col-span-3 h-9" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Role</Label>
                            <Select value={newUser.role} onValueChange={(val) => setNewUser({ ...newUser, role: val })}>
                              <SelectTrigger className="col-span-3 h-9">
                                <SelectValue placeholder="Select Role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Faculty">Faculty</SelectItem>
                                <SelectItem value="HOD">HOD</SelectItem>
                                <SelectItem value="LibraryAdmin">Library Admin</SelectItem>
                                <SelectItem value="GeneralOffice">General Office</SelectItem>
                                <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dept" className="text-right">Dept</Label>
                            <Input id="dept" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} className="col-span-3 h-9" placeholder="Computer Science" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleCreateUser} className="rounded-xl h-10 px-6 gap-2" disabled={createMutation.isPending || !newUser.name || !newUser.email}>
                            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Account
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-xs font-bold uppercase">Name</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Email</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Role</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Department</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: any) => (
                        <TableRow key={user._id} className="hover:bg-muted/20">
                          <TableCell className="font-semibold">{user.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{user.department || 'All'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 text-xs">Edit</Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive">Suspend</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">No users found matching your search.</div>
                )}
              </CardContent>
            </Card>
          </FadeUp>
        );

      case 'roles':
        return (
          <FadeUp>
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Roles & Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { role: 'Student', desc: 'Can apply and track status', count: stats.users?.byRole?.find((r: any) => r._id === 'Student')?.count || 0 },
                    { role: 'Faculty', desc: 'First stage approval', count: stats.users?.byRole?.find((r: any) => r._id === 'Faculty')?.count || 0 },
                    { role: 'HOD', desc: 'Final department approval', count: stats.users?.byRole?.find((r: any) => r._id === 'HOD')?.count || 0 },
                    { role: 'SuperAdmin', desc: 'System level access', count: stats.users?.byRole?.find((r: any) => r._id === 'SuperAdmin')?.count || 0 },
                  ].map((role) => (
                    <Card key={role.role} className="bg-muted/20 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-primary/10 text-primary border-primary/20">{role.role}</Badge>
                          <span className="text-xs font-bold text-muted-foreground">{role.count} Users</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">{role.desc}</p>
                        <Button variant="outline" size="sm" className="w-full text-[10px] font-bold uppercase h-8">View Permissions</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeUp>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="shadow-card border-border/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Submission Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center border border-dashed border-border rounded-xl m-4 bg-muted/10">
                  <div className="text-center">
                    <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Interactive Chart Viewer Powered by TanStack</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Branch Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['CSE', 'IT', 'ME', 'CE', 'EE'].map(branch => (
                    <div key={branch}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{branch}</span>
                        <span className="text-muted-foreground">24%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full gradient-accent w-[24%]" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'settings':
        return (
          <FadeUp>
            <Card className="shadow-card border-border/50 max-w-2xl">
              <CardHeader>
                <CardTitle className="text-base">System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <h4 className="text-sm font-semibold">Maintenance Mode</h4>
                      <p className="text-xs text-muted-foreground">Disable student access for updates</p>
                    </div>
                    <div className="w-12 h-6 bg-muted rounded-full p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-background rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <h4 className="text-sm font-semibold">Automatic Emailing</h4>
                      <p className="text-xs text-muted-foreground">Send certificate on finalize</p>
                    </div>
                    <div className="w-12 h-6 bg-success rounded-full p-1 cursor-pointer flex justify-end">
                      <div className="w-4 h-4 bg-background rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <Button className="w-full h-11 gradient-hero border-0 shadow-lg">Save Configuration</Button>
                </div>
              </CardContent>
            </Card>
          </FadeUp>
        );

      default:
        // Overview (default /admin)
        return (
          <div className="space-y-6">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Students", value: stats.users?.total || 0, icon: Users, color: "text-primary", bg: "bg-primary/8", trend: "Live" },
                { label: "Active Apps", value: stats.applications?.total || 0, icon: FileCheck, color: "text-accent", bg: "bg-accent/8", trend: "Total" },
                { label: "Completed", value: stats.certificates?.total || 0, icon: TrendingUp, color: "text-success", bg: "bg-success/8", trend: "Total" },
                { label: "Pending Issues", value: stats.applications?.total || 0, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/8", trend: "Review" },
              ].map((stat) => (
                <StaggerItem key={stat.label}>
                  <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="shadow-card border-border/50 overflow-hidden relative">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            {stat.trend}
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <div className="grid lg:grid-cols-2 gap-5">
              <FadeUp delay={0.1}>
                <Card className="shadow-card border-border/50 h-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-1.5 h-5 rounded-full gradient-accent" />
                      System Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      {[
                        { label: "Overall Completion Rate", value: (stats.applications?.total > 0) ? (stats.certificates?.total / stats.applications?.total * 100) : 0, max: 100 },
                        { label: "Avg Process Time", value: 3.2, max: 7 },
                        { label: "System Health", value: 99.8, max: 100 },
                      ].map((metric) => (
                        <div key={metric.label}>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-muted-foreground font-medium">{metric.label}</span>
                            <span className="font-bold text-foreground">{Math.round(metric.value)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${(metric.value / metric.max) * 100}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full gradient-accent rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-border/50">
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
                        <Activity className="w-4 h-4 text-accent" />
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Active Nodes</p>
                          <p className="text-sm font-bold text-foreground">API v1.0.4</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
                        <Shield className="w-4 h-4 text-success" />
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Security</p>
                          <p className="text-sm font-bold text-foreground">JWT SSL</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>

              <FadeUp delay={0.2}>
                <Card className="shadow-card border-border/50 h-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-1.5 h-5 rounded-full bg-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {auditLogs.length > 0 ? auditLogs.map((log: any, i: number) => (
                        <motion.div
                          key={log._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.action.includes('Approved') ? "bg-success" : log.action.includes('Paused') ? "bg-warning" : "bg-primary"
                            }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{log.action}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {log.userId?.name || 'System'} · {new Date(log.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="py-8 text-center text-xs text-muted-foreground">No recent logs found.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      role="admin"
      title={`Admin ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
      subtitle={activeTab === 'admin' ? "System overview and management" : `Manage system ${activeTab}`}
    >
      <div className="max-w-6xl mx-auto">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
