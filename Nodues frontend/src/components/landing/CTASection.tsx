import { FadeUp } from "@/components/animations/AnimatedComponents";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <FadeUp>
          <div className="relative gradient-hero rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            {/* Grid + glow */}
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-[80px]" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground tracking-tight mb-4">
                Ready to Get Your
                <span className="text-accent"> No Dues Certificate?</span>
              </h2>
              <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto mb-8">
                Join thousands of MITS students who have already streamlined their clearance process.
              </p>
              <Link to="/login">
                <Button size="lg" variant="secondary" className="gap-2 font-semibold text-base px-10 shadow-elevated group">
                  Start Your Application
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
};

export default CTASection;
