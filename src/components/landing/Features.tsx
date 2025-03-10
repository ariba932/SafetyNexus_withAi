import React from "react";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  FileEdit,
  BarChart2,
  Smartphone,
  Shield,
  Users,
} from "lucide-react";

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

const Feature = ({ title, description, icon, className }: FeatureProps) => {
  return (
    <div
      className={cn(
        "p-6 rounded-xl border bg-background shadow-sm transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const Features = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Comprehensive HSSEQ Management
          </h2>
          <p className="text-lg text-muted-foreground">
            SafetyNexus provides all the tools you need to manage health,
            safety, security, environment, and quality in one integrated
            platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Feature
            title="Dynamic Form Builder"
            description="Create custom forms and checklists with our intuitive drag-and-drop interface. No coding required."
            icon={<FileEdit className="h-6 w-6" />}
          />
          <Feature
            title="Inspection Management"
            description="Schedule, conduct, and track inspections with real-time reporting and issue management."
            icon={<ClipboardList className="h-6 w-6" />}
          />
          <Feature
            title="Advanced Analytics"
            description="Gain insights with powerful dashboards and reports that help identify trends and areas for improvement."
            icon={<BarChart2 className="h-6 w-6" />}
          />
          <Feature
            title="Mobile Accessibility"
            description="Access your HSSEQ tools anywhere with our mobile-responsive platform and offline capabilities."
            icon={<Smartphone className="h-6 w-6" />}
          />
          <Feature
            title="Compliance Management"
            description="Stay compliant with regulatory requirements and standards with built-in compliance tools."
            icon={<Shield className="h-6 w-6" />}
          />
          <Feature
            title="Role-Based Access"
            description="Control who can access what with customizable permissions for different user roles."
            icon={<Users className="h-6 w-6" />}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
