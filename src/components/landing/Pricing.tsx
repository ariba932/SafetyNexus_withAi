import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingTierProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  buttonText?: string;
  className?: string;
}

const PricingTier = ({
  name,
  price,
  description,
  features,
  highlighted = false,
  buttonText = "Get Started",
  className,
}: PricingTierProps) => {
  return (
    <div
      className={cn(
        "p-8 rounded-xl border bg-background shadow-sm transition-all",
        highlighted
          ? "border-primary shadow-lg ring-1 ring-primary/20 relative"
          : "hover:shadow-md",
        className,
      )}
    >
      {highlighted && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-sm font-medium py-1 px-3 rounded-full">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-2xl font-bold">{name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-extrabold">{price}</span>
          {price !== "Custom" && (
            <span className="ml-1 text-muted-foreground">/month</span>
          )}
        </div>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <ul className="mt-6 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex">
            <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className={cn("w-full mt-8", highlighted ? "" : "variant-outline")}
        variant={highlighted ? "default" : "outline"}
      >
        {buttonText}
      </Button>
    </div>
  );
};

const Pricing = () => {
  return (
    <section className="py-20 bg-muted/30" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that's right for your organization. All plans
            include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingTier
            name="Starter"
            price="$99"
            description="Perfect for small teams just getting started with HSSEQ management."
            features={[
              "Up to 5 users",
              "Basic form builder",
              "Inspection management",
              "Mobile access",
              "Email support",
            ]}
          />
          <PricingTier
            name="Professional"
            price="$299"
            description="Ideal for growing organizations with advanced HSSEQ needs."
            features={[
              "Up to 20 users",
              "Advanced form builder",
              "Comprehensive analytics",
              "Offline capabilities",
              "Compliance management",
              "Priority support",
            ]}
            highlighted={true}
          />
          <PricingTier
            name="Enterprise"
            price="Custom"
            description="Tailored solutions for large organizations with complex requirements."
            features={[
              "Unlimited users",
              "Custom integrations",
              "Advanced security features",
              "Dedicated account manager",
              "Custom training",
              "24/7 premium support",
            ]}
            buttonText="Contact Sales"
          />
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Need a custom solution?{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
