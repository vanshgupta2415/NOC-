import { Clock, Shield, Globe, BarChart3, Bell, FileCheck } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeUp } from "@/components/animations/AnimatedComponents";
import { motion } from "framer-motion";

const benefits = [
  { icon: Clock, title: "Save Time", description: "No more running between departments. Complete everything digitally from anywhere." },
  { icon: Shield, title: "Secure & Reliable", description: "Enterprise-grade security with encrypted data storage and role-based access." },
  { icon: Globe, title: "Access Anywhere", description: "Apply and track from any device — no physical presence required at college." },
  { icon: BarChart3, title: "Real-Time Tracking", description: "Monitor each department's approval status live with instant notifications." },
  { icon: Bell, title: "Smart Notifications", description: "Get notified when departments approve, request changes, or complete clearance." },
  { icon: FileCheck, title: "Digital Certificate", description: "Receive your official No Dues Certificate digitally — ready for instant download." },
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/40" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative">
        <FadeUp className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 tracking-wider uppercase">
            Why Go Digital
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Benefits Over Manual Process
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-lg">
            A faster, transparent, and completely paperless clearance experience
          </p>
        </FadeUp>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {benefits.map((benefit) => (
            <StaggerItem key={benefit.title}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-card rounded-2xl border border-border/50 p-6 shadow-card h-full group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:shadow-glow transition-shadow duration-500">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default Benefits;
