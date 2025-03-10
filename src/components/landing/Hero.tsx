import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background z-0" />

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                <Shield className="mr-1 h-3 w-3" />
                <span>Industry-Leading HSSEQ Platform</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Streamline Your <span className="text-primary">Safety</span> and{" "}
                <span className="text-primary">Compliance</span> Workflows
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                SafetyNexus helps organizations build a safer workplace with
                powerful tools for health, safety, security, environment, and
                quality management—all in one integrated platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="font-medium">
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/demo">Request Demo</Link>
              </Button>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Trusted by industry leaders:
              </p>
              <div className="flex flex-wrap gap-6 items-center opacity-70">
                <img
                  src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&q=80"
                  alt="Company logo"
                  className="h-8 object-contain"
                />
                <img
                  src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&q=80"
                  alt="Company logo"
                  className="h-8 object-contain"
                />
                <img
                  src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&q=80"
                  alt="Company logo"
                  className="h-8 object-contain"
                />
                <img
                  src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&q=80"
                  alt="Company logo"
                  className="h-8 object-contain"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary-foreground opacity-30 blur-xl"></div>
            <div className="relative bg-background rounded-xl shadow-2xl overflow-hidden border border-border">
              <img
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80"
                alt="SafetyNexus Dashboard"
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">ISO 45001 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
