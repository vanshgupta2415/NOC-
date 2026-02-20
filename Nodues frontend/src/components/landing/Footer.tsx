import { GraduationCap } from "lucide-react";
import { FadeUp } from "@/components/animations/AnimatedComponents";

const Footer = () => {
  return (
    <footer id="contact" className="gradient-hero text-primary-foreground pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="container mx-auto px-6 relative">
        <FadeUp>
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold block leading-tight">NoDues MITS</span>
                  <span className="text-[10px] text-primary-foreground/50 tracking-widest uppercase">Gwalior</span>
                </div>
              </div>
              <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-sm">
                Madhav Institute of Technology & Science, Gwalior — Official Online No Dues Management Portal. 
                Digitizing the clearance process for a smoother academic experience.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm tracking-wide">Quick Links</h4>
              <ul className="space-y-2.5 text-sm text-primary-foreground/60">
                <li><a href="#how-it-works" className="hover:text-primary-foreground transition-colors">How it Works</a></li>
                <li><a href="#benefits" className="hover:text-primary-foreground transition-colors">Benefits</a></li>
                <li><a href="/login" className="hover:text-primary-foreground transition-colors">Login Portal</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Help & Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm tracking-wide">Contact</h4>
              <ul className="space-y-2.5 text-sm text-primary-foreground/60">
                <li>nodues@mitsgwalior.in</li>
                <li>+91 751 240 9300</li>
                <li>Gola Ka Mandir, Gwalior</li>
                <li>Madhya Pradesh 474005</li>
              </ul>
            </div>
          </div>
        </FadeUp>

        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} NoDues MITS. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/40">
            Madhav Institute of Technology & Science, Gwalior
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
