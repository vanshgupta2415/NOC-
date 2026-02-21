import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp } from "@/components/animations/AnimatedComponents";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  User, BookOpen, Building2, Upload, FileCheck,
  ArrowLeft, ArrowRight, Check, Loader2, X, FileIcon
} from "lucide-react";
import { studentAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { DEPARTMENTS } from "@/lib/constants";

const steps = [
  { id: 1, title: "Personal Details", icon: User },
  { id: 2, title: "Academic Details", icon: BookOpen },
  { id: 3, title: "Hostel & Fees", icon: Building2 },
  { id: 4, title: "Documents", icon: Upload },
  { id: 5, title: "Review & Submit", icon: FileCheck },
];

const StudentApply = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApp, setExistingApp] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    fatherName: "",
    enrollment: user?.studentProfile?.enrollmentNumber || "",
    email: user?.email || "",
    phone: "",
    address: "",
    department: "",
    batch: "",
    semester: "",
    cgpa: "",
    hostelInvolved: false,
    hostelName: "",
    roomNumber: "",
    cautionMoneyRefund: false,
    cautionMoneyReceipt: "",
    exitSurveyCompleted: false,
    feeDuesCleared: false,
    projectReportSubmitted: false,
    declaration: false,
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    feeReceiptsPDF: null,
    marksheetsPDF: null,
    bankProofImage: null,
    idProofImage: null,
  });

  // Sync form with user data when it becomes available
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        enrollment: user.studentProfile?.enrollmentNumber || prev.enrollment,
      }));
    }
  }, [user]);

  const updateField = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (key: string, file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max file size is 5MB",
        variant: "destructive",
      });
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  // Pre-fill form if application exists
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await studentAPI.getApplicationStatus();
        if (res.data?.application) {
          const app = res.data.application;
          setExistingApp(app);
          const profile = app.studentProfile;
          setForm(prev => ({
            ...prev,
            fullName: user?.name || "",
            enrollment: profile.enrollmentNumber || "",
            fatherName: profile.fatherName || "",
            department: profile.branch || "",
            batch: String(profile.passOutYear || ""),
            address: profile.address || "",
            phone: profile.phoneNumber || "",
            hostelInvolved: app.hostelInvolved,
            cautionMoneyRefund: app.cautionMoneyRefund,
            exitSurveyCompleted: app.exitSurveyCompleted,
            feeDuesCleared: app.feeDuesCleared,
            projectReportSubmitted: app.projectReportSubmitted,
            declaration: app.declarationAccepted,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch existing application", err);
      }
    };
    fetchExisting();
  }, [user]);

  const handleSubmit = async () => {
    if (!form.declaration) return;

    setIsSubmitting(true);
    try {
      // First, ensure student profile exists/is updated
      try {
        await studentAPI.updateProfile({
          enrollmentNumber: form.enrollment,
          fatherName: form.fatherName,
          dateOfBirth: new Date('2000-01-01').toISOString(),
          branch: form.department,
          address: form.address,
          passOutYear: parseInt(form.batch),
          phoneNumber: form.phone ? form.phone.replace(/\D/g, '').slice(0, 10) : undefined,
        });
      } catch (profileError: any) {
        toast({
          title: "Profile Error",
          description: profileError.response?.data?.message || "Failed to update profile",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("hostelInvolved", String(form.hostelInvolved));
      formData.append("cautionMoneyRefund", String(form.cautionMoneyRefund));
      formData.append("exitSurveyCompleted", String(form.exitSurveyCompleted));
      formData.append("feeDuesCleared", String(form.feeDuesCleared));
      formData.append("projectReportSubmitted", String(form.projectReportSubmitted));
      formData.append("declarationAccepted", String(form.declaration));

      if (files.feeReceiptsPDF) formData.append("feeReceiptsPDF", files.feeReceiptsPDF);
      if (files.marksheetsPDF) formData.append("marksheetsPDF", files.marksheetsPDF);
      if (files.bankProofImage) formData.append("bankProofImage", files.bankProofImage);
      if (files.idProofImage) formData.append("idProofImage", files.idProofImage);

      // Submit or Resubmit application
      try {
        if (existingApp && existingApp.status === 'Paused') {
          formData.append("applicationId", existingApp.id);
          await studentAPI.resubmitApplication(formData);
          toast({
            title: "Application Resubmitted! 🔁",
            description: "Your updated application has been sent for re-review.",
          });
        } else {
          await studentAPI.submitApplication(formData);
          toast({
            title: "Application Submitted! ✅",
            description: "Your no dues application has been sent for review.",
          });
        }
        navigate("/student/status");
      } catch (error: any) {
        toast({
          title: "Submission Failed",
          description: error.response?.data?.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="student" title="Apply for No Dues" subtitle="Complete all steps to submit">
      <div className="max-w-3xl mx-auto">
        {/* Step indicator */}
        <FadeUp>
          <div className="mb-8 overflow-x-auto pb-4 sm:pb-0">
            <div className="flex items-center justify-between min-w-[500px] px-2">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center relative">
                    <motion.div
                      animate={{
                        scale: currentStep === step.id ? 1.1 : 1,
                        backgroundColor: currentStep >= step.id ? "hsl(213 56% 24%)" : "hsl(210 20% 96%)",
                      }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors z-10"
                    >
                      {currentStep > step.id ? (
                        <Check className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <step.icon className={`w-4 h-4 ${currentStep >= step.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      )}
                    </motion.div>
                    <span className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      }`}>
                      {step.title}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 mx-2 h-0.5 rounded-full bg-muted relative overflow-hidden mt-[-20px]">
                      <motion.div
                        animate={{ width: currentStep > step.id ? "100%" : "0%" }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 gradient-accent"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Form card */}
        <Card className="shadow-card border-border/50 overflow-hidden">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-foreground">Personal Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={form.fullName} readOnly className="bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Father's Name</Label>
                        <Input placeholder="Enter father's name" value={form.fatherName} onChange={(e) => updateField("fatherName", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={form.email} readOnly className="bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Permanent Address</Label>
                      <Textarea placeholder="Enter your address" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-foreground">Academic Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Enrollment Number</Label>
                        <Input
                          placeholder="Enter enrollment number"
                          value={form.enrollment}
                          onChange={(e) => updateField("enrollment", e.target.value)}
                          readOnly={!!user?.studentProfile?.enrollmentNumber}
                          className={user?.studentProfile?.enrollmentNumber ? "bg-muted/50" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={form.department} onValueChange={(v) => updateField("department", v)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEPARTMENTS.map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Pass Out Year</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 2025"
                          value={form.batch}
                          onChange={(e) => updateField("batch", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Current Semester</Label>
                        <Select value={form.semester} onValueChange={(v) => updateField("semester", v)}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                              <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>CGPA (Up to previous sem)</Label>
                        <Input placeholder="e.g. 8.5" value={form.cgpa} onChange={(e) => updateField("cgpa", e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-foreground">Hostel & Caution Money</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                        <div className="space-y-0.5">
                          <Label className="text-base">Hostel Resident?</Label>
                          <p className="text-xs text-muted-foreground">Select yes if you stayed in college hostel</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.hostelInvolved}
                          onChange={(e) => updateField("hostelInvolved", e.target.checked)}
                          className="w-5 h-5 accent-primary"
                        />
                      </div>

                      {form.hostelInvolved && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border bg-card">
                          <div className="space-y-2">
                            <Label>Hostel Name</Label>
                            <Input placeholder="e.g. Boys Hostel-1" value={form.hostelName} onChange={(e) => updateField("hostelName", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Room Number</Label>
                            <Input placeholder="e.g. A-204" value={form.roomNumber} onChange={(e) => updateField("roomNumber", e.target.value)} />
                          </div>
                        </motion.div>
                      )}

                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                        <div className="space-y-0.5">
                          <Label className="text-base">Caution Money Refund?</Label>
                          <p className="text-xs text-muted-foreground">Apply for security deposit refund</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.cautionMoneyRefund}
                          onChange={(e) => updateField("cautionMoneyRefund", e.target.checked)}
                          className="w-5 h-5 accent-primary"
                        />
                      </div>

                      {form.cautionMoneyRefund && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 p-4 rounded-xl border border-border bg-card">
                          <Label>Caution Money Receipt Number</Label>
                          <Input placeholder="Enter receipt number" value={form.cautionMoneyReceipt} onChange={(e) => updateField("cautionMoneyReceipt", e.target.value)} />
                        </motion.div>
                      )}

                      <h4 className="text-sm font-semibold text-foreground mt-4 mb-2">Required Prerequisites</h4>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                        <div className="space-y-0.5">
                          <Label className="text-base">Exit Survey Completed?</Label>
                          <p className="text-xs text-muted-foreground">Confirm you filled exit survey through T&P cell</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.exitSurveyCompleted}
                          onChange={(e) => updateField("exitSurveyCompleted", e.target.checked)}
                          className="w-5 h-5 accent-primary"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                        <div className="space-y-0.5">
                          <Label className="text-base">All Fees Cleared?</Label>
                          <p className="text-xs text-muted-foreground">Confirm all tuition and other fees are paid</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.feeDuesCleared}
                          onChange={(e) => updateField("feeDuesCleared", e.target.checked)}
                          className="w-5 h-5 accent-primary"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                        <div className="space-y-0.5">
                          <Label className="text-base">Project/Internship Submitted?</Label>
                          <p className="text-xs text-muted-foreground">Soft copy submitted to department/guide</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.projectReportSubmitted}
                          onChange={(e) => updateField("projectReportSubmitted", e.target.checked)}
                          className="w-5 h-5 accent-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-foreground">Upload Documents</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload required documents in PDF or image format (max 5MB each).</p>

                    <div className="grid gap-4">
                      {[
                        { label: "Fee Receipts (Combined PDF)", id: "feeReceiptsPDF" },
                        { label: "Previous Marksheets (Combined PDF)", id: "marksheetsPDF" },
                        { label: "Bank Passbook/Cancelled Cheque", id: "bankProofImage" },
                        { label: "College ID Proof", id: "idProofImage" },
                      ].map((doc) => (
                        <div key={doc.id} className="relative">
                          <Label className="text-xs mb-1.5 block ml-1">{doc.label}</Label>
                          {files[doc.id] ? (
                            <div className="flex items-center justify-between p-3 rounded-xl border border-success/30 bg-success/5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                  <FileIcon className="w-4 h-4 text-success" />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{files[doc.id]?.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{(files[doc.id]!.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleFileChange(doc.id, null)} className="h-8 w-8 text-muted-foreground">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="relative group">
                              <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="border border-dashed border-border rounded-xl p-4 text-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                                <Upload className="w-5 h-5 mx-auto text-muted-foreground group-hover:text-primary mb-1" />
                                <p className="text-sm font-medium">Click to upload</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-foreground">Review & Submit</h3>
                    <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border">
                      {[
                        { label: "Full Name", value: form.fullName },
                        { label: "Enrollment", value: form.enrollment },
                        { label: "Department", value: form.department },
                        { label: "Hostel Involved", value: form.hostelInvolved ? "Yes" : "No" },
                        { label: "T&P Survey Done", value: form.exitSurveyCompleted ? "Yes" : "No" },
                        { label: "Dues Cleared", value: form.feeDuesCleared ? "Yes" : "No" },
                        { label: "Documents Attached", value: `${Object.values(files).filter(f => !!f).length} of 4` },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                          <span className="text-xs font-semibold text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <label className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={form.declaration}
                        onChange={(e) => updateField("declaration", e.target.checked)}
                        className="mt-1 w-4 h-4 rounded accent-primary"
                      />
                      <span className="text-sm text-foreground leading-relaxed">
                        I hereby declare that all information provided is true and correct. I understand that
                        providing false information may result in rejection of my application and disciplinary action.
                      </span>
                    </label>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                disabled={currentStep === 1 || isSubmitting}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </Button>

              {currentStep < 5 ? (
                <Button onClick={() => setCurrentStep((s) => Math.min(5, s + 1))} className="gap-2" disabled={
                  (currentStep === 1 && (!form.fullName || !form.fatherName || !form.phone || !form.address)) ||
                  (currentStep === 2 && (!form.enrollment || !form.semester || !form.cgpa)) ||
                  (currentStep === 3 && (!form.exitSurveyCompleted || !form.feeDuesCleared || !form.projectReportSubmitted)) ||
                  (currentStep === 4 && Object.values(files).some(f => !f))
                }>
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!form.declaration || isSubmitting}
                  className="gap-2 min-w-[160px] gradient-hero text-primary-foreground border-0 shadow-lg"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><FileCheck className="w-4 h-4" /> Submit Application</>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentApply;
