import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LayoutGrid, Columns, Columns3 } from "lucide-react";

interface FieldLayoutProps {
  layout: "full" | "half" | "third";
  onLayoutChange: (layout: "full" | "half" | "third") => void;
  className?: string;
}

const FieldLayout: React.FC<FieldLayoutProps> = ({
  layout = "full",
  onLayoutChange,
  className,
}) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={layout === "full" ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onLayoutChange("full")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Full Width</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={layout === "half" ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onLayoutChange("half")}
            >
              <Columns className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Half Width</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={layout === "third" ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onLayoutChange("third")}
            >
              <Columns3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>One Third Width</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default FieldLayout;
