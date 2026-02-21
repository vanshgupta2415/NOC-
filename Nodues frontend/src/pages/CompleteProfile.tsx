import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { studentAPI, authAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Loader2,
    ShieldCheck,
    Mail,
    User,
    ArrowRight,
    CheckCircle2,
    Lock,
    ExternalLink,
    AlertCircle,
    Building2
} from "lucide-react";
import { motion } from "framer-motion";

const CompleteProfile = () => {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        enrollmentNumber: "",
        institutionalEmail: "",
    });

    const isEmailValid = formData.institutionalEmail.toLowerCase().endsWith('@mitsgwl.ac.in');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await studentAPI.completeProfile({
                enrollmentNumber: formData.enrollmentNumber.trim().toUpperCase(),
                institutionalEmail: formData.institutionalEmail.trim().toLowerCase(),
                fatherName: "TBD",
                dateOfBirth: "2000-01-01",
                branch: "TBD",
                address: "TBD",
                passOutYear: new Date().getFullYear(),
            });

            if (response.success) {
                toast({
                    title: "Status: Verified",
                    description: `Account successfully linked to ${response.data?.name || 'Student'}.`,
                });

                const meResponse = await authAPI.getMe();
                if (meResponse.success) {
                    const freshUser = meResponse.data.user;
                    if (meResponse.data.studentProfile) {
                        freshUser.studentProfile = meResponse.data.studentProfile;
                    }
                    updateUser(freshUser);
                }

                setTimeout(() => navigate("/student"), 800);
            }
        } catch (error: any) {
            toast({
                title: "Authentication Failed",
                description: error.response?.data?.message || "Verify your institutional credentials and try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-hero relative overflow-hidden selection:bg-accent selection:text-white font-sans flex flex-col items-center justify-center p-6">
            {/* Theme-aligned background elements */}
            <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full gradient-hero-radial opacity-50 pointer-events-none" />

            <div className="w-full max-w-5xl relative z-10">
                {/* Institutional Identity Bar */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-elevated">
                            <img src="/logo.png" alt="MITS" className="w-9 h-9 object-contain" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold tracking-tight text-lg">MITS Digital Identity</h3>
                            <p className="text-primary-foreground/60 text-xs font-semibold uppercase tracking-widest">Verification Services</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Registry Sync: Online</span>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    {/* Left: Content & Trust */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-12 xl:col-span-5 space-y-10"
                    >
                        <div className="space-y-6">
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
                                Link your <br />
                                <span className="text-accent underline decoration-accent/30 underline-offset-8">Academic Profile.</span>
                            </h1>
                            <p className="text-primary-foreground/70 text-base leading-relaxed max-w-lg">
                                Using a personal Gmail account? Verify your identity against our official registry to access the No Dues Portal and retrieve your records.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
                            {[
                                { icon: ShieldCheck, title: "Verified Mapping", desc: "Maps your current session to institutional records." },
                                { icon: Building2, title: "Data Integrity", desc: "Ensures certificates are issued in your official name." }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 group p-4 rounded-3xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <feature.icon className="w-6 h-6 text-accent" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-white font-bold">{feature.title}</h4>
                                        <p className="text-primary-foreground/50 text-[13px] leading-snug">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: The Professional Action Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        className="lg:col-span-12 xl:col-span-7"
                    >
                        <Card className="bg-white rounded-[2.5rem] shadow-elevated p-8 sm:p-12 relative overflow-hidden border-none text-slate-900">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />

                            <div className="relative mb-10">
                                <span className="inline-block px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">Verification Entry</span>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Verification</h2>
                                <p className="text-slate-500 text-sm mt-1">Please enter your official institutional credentials</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8 relative">
                                <div className="space-y-6">
                                    {/* Email */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center ml-1">
                                            <Label htmlFor="instEmail" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                                Institute Email Address
                                            </Label>
                                            {isEmailValid && (
                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-success capitalize bg-success/5 px-2 py-1 rounded-lg">
                                                    <CheckCircle2 className="w-3 h-3" /> Institutional Record
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <Input
                                                id="instEmail"
                                                type="email"
                                                placeholder="e.g. 21eo... @mitsgwl.ac.in"
                                                className="h-16 pl-14 bg-slate-50 border-slate-200 rounded-[1.25rem] text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-base shadow-sm"
                                                value={formData.institutionalEmail}
                                                onChange={(e) => setFormData({ ...formData, institutionalEmail: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Enrollment */}
                                    <div className="space-y-3">
                                        <Label htmlFor="enrollment" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                                            Official Enrollment Number
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <Input
                                                id="enrollment"
                                                placeholder="e.g. BTEO... 01"
                                                className="h-16 pl-14 bg-slate-50 border-slate-200 rounded-[1.25rem] text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold uppercase tracking-[0.05em] text-base shadow-sm"
                                                value={formData.enrollmentNumber}
                                                onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-16 bg-primary hover:bg-primary/95 text-white font-bold rounded-[1.25rem] shadow-lg shadow-primary/20 transition-all active:scale-[0.98] text-base"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            Verify & Authenticate
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                    Secured by MITS SSO
                                </div>
                                <button
                                    onClick={() => window.location.href = "/"}
                                    className="text-slate-900 hover:text-accent transition-colors flex items-center gap-1.5"
                                >
                                    Log out <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>

            <p className="mt-12 text-[10px] font-black tracking-[0.4em] text-white/20 uppercase">Institutional Verification Subsystem</p>
        </div>
    );
};

export default CompleteProfile;
