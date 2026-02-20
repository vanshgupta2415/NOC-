import { FileText, Send, CheckCircle2, Download } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/AnimatedComponents";
import { motion } from "framer-motion";

const steps = [
  {
    icon: FileText,
    title: "Fill Application",
    description: "Complete the multi-step form with your academic and personal details. Auto-save ensures you never lose progress.",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: Send,
    title: "Submit for Review",
    description: "Your application is routed to all 9 departments simultaneously for parallel processing.",
    color: "from-accent/20 to-accent/5",
  },
  {
    icon: CheckCircle2,
    title: "Track Approvals",
    description: "Monitor real-time approval status from Faculty, HOD, Library, Hostel, Accounts and more.",
    color: "from-success/20 to-success/5",
  },
  {
    icon: Download,
    title: "Download Certificate",
    description: "Once all departments approve, download your official No Dues Certificate instantly.",
    color: "from-warning/20 to-warning/5",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/3 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative">
        <FadeUp className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-4 tracking-wider uppercase">
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-lg">
            From application to certificate — everything is streamlined
          </p>
        </FadeUp>

        <StaggerContainer className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <StaggerItem key={step.title}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative bg-card rounded-2xl border border-border/50 p-7 shadow-card h-full overflow-hidden"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground shadow-card">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-accent tracking-wider uppercase">Step {index + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default HowItWorks;
