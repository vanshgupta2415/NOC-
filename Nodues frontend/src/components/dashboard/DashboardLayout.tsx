import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Home, FileText, CheckCircle2, Award, Bell,
  LogOut, User, Settings, Users, BarChart3, Shield, ClipboardList,
  ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/AnimatedComponents";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  role: "student" | "authority" | "admin";
  title: string;
  subtitle?: string;
}

const studentNav: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/student" },
  { icon: FileText, label: "Apply for No Dues", href: "/student/apply" },
  { icon: CheckCircle2, label: "Application Status", href: "/student/status" },
  { icon: Award, label: "Certificate", href: "/student/certificate" },
];

const authorityNav: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/authority" },
  { icon: ClipboardList, label: "Pending Reviews", href: "/authority/pending" },
  { icon: CheckCircle2, label: "Approved", href: "/authority/approved" },
];

const adminNav: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/admin" },
  { icon: ClipboardList, label: "Student Registry", href: "/admin/registry" },
  { icon: Users, label: "User Management", href: "/admin/users" },
  { icon: Shield, label: "Roles & Access", href: "/admin/roles" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const DashboardLayout = ({ children, role, title, subtitle }: DashboardLayoutProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const navItems = role === "student" ? studentNav : role === "authority" ? authorityNav : adminNav;
  const roleName = role === "student" ? "Student" : role === "authority" ? "Authority" : "Admin";

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex flex-col gradient-hero text-primary-foreground relative overflow-hidden"
      >
        {/* Grid bg */}
        <div className="absolute inset-0 bg-grid opacity-15" />

        <div className="relative flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-primary-foreground/10">
            <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden"
              >
                <img src="/logo.png" alt="MITS" className="w-7 h-7 object-contain" onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-primary-foreground/10');
                }} />
                <GraduationCap className="w-4 h-4 hidden" />
              </motion.div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex flex-col overflow-hidden whitespace-nowrap"
                  >
                    <span className="font-bold text-sm">NoDues MITS</span>
                    <span className="text-[10px] text-primary-foreground/50 tracking-widest uppercase">
                      {roleName} Portal
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-2 space-y-0.5 mt-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${isActive
                    ? "bg-primary-foreground/15 text-primary-foreground shadow-sm"
                    : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-accent"
                    />
                  )}
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-2 border-t border-primary-foreground/10 space-y-0.5">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/5 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
              {!collapsed && <span>Collapse</span>}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/5 transition-colors"
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="relative rounded-xl text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive ring-2 ring-card" />
            </Button>
            <div className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/50">
              <div className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-accent-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-foreground leading-tight">{user?.name?.split(' ')[0] || 'User'}</p>
                <p className="text-[10px] text-muted-foreground leading-tight capitalize">{roleName}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
