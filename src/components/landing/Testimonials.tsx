import React from "react";
import { cn } from "@/lib/utils";
import { Star, Quote } from "lucide-react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  rating?: number;
  className?: string;
}

const Testimonial = ({
  quote,
  author,
  role,
  company,
  avatar,
  rating = 5,
  className,
}: TestimonialProps) => {
  return (
    <div
      className={cn(
        "p-6 rounded-xl border bg-background shadow-sm transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="text-primary">
          <Quote className="h-8 w-8 opacity-50" />
        </div>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300",
              )}
            />
          ))}
        </div>
      </div>
      <blockquote className="text-lg mb-6">"{quote}"</blockquote>
      <div className="flex items-center">
        <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
          <img
            src={avatar}
            alt={author}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-muted-foreground">
            {role}, {company}
          </p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our customers have to say about how SafetyNexus has
            transformed their HSSEQ management processes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Testimonial
            quote="SafetyNexus has revolutionized how we manage safety inspections. The form builder is intuitive and the mobile app allows our team to conduct inspections anywhere."
            author="Sarah Johnson"
            role="HSE Manager"
            company="Global Construction Inc."
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
            rating={5}
          />
          <Testimonial
            quote="The analytics dashboard gives us real-time insights into our safety performance. We've reduced incidents by 45% since implementing SafetyNexus."
            author="Michael Chen"
            role="Operations Director"
            company="Pacific Manufacturing"
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
            rating={5}
          />
          <Testimonial
            quote="The compliance management features have made our ISO 45001 certification process much smoother. SafetyNexus keeps all our documentation organized and up-to-date."
            author="Emma Rodriguez"
            role="Quality Assurance Lead"
            company="Horizon Energy"
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
            rating={4}
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
