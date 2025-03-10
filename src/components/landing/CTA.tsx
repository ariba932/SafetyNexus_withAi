import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to transform your HSSEQ management?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Join thousands of organizations that trust SafetyNexus to streamline
            their safety and compliance workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="font-medium"
            >
              <Link to="/register">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent border-white hover:bg-white/10"
            >
              <Link to="/demo">Schedule a Demo</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-80">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
