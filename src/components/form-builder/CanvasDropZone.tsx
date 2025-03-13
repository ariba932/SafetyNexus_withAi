import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2, ArrowUp, ArrowDown, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FormField } from "@/lib/form-builder";

interface CanvasDropZoneProps {
  fields?: FormField[];
  onFieldSelect?: (fieldId: string) => void;
  onFieldDelete?: (fieldId: string) => void;
  onFieldMove?: (fieldId: string, direction: "up" | "down") => void;
  onDrop?: (event: React.DragEvent) => void;
  onAddField?: () => void;
}

const CanvasDropZone: React.FC<CanvasDropZoneProps> = ({
  fields = [
    {
      id: "1",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
      order_index: 0,
    },
    {
      id: "2",
      type: "email",
      label: "Email Address",
      placeholder: "Enter your email",
      required: true,
      order_index: 1,
    },
    {
      id: "3",
      type: "select",
      label: "Department",
      options: [
        { label: "Health & Safety", value: "health_safety" },
        { label: "Quality Assurance", value: "quality" },
        { label: "Environment", value: "environment" },
      ],
      order_index: 2,
    },
    {
      id: "4",
      type: "textarea",
      label: "Additional Comments",
      placeholder: "Enter any additional information",
      order_index: 3,
    },
  ],
  onFieldSelect = () => {},
  onFieldDelete = () => {},
  onFieldMove = () => {},
  onDrop = () => {},
  onAddField = () => {},
}) => {
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    onDrop(e);
  };

  const handleFieldClick = (fieldId: string) => {
    setActiveField(fieldId);
    onFieldSelect(fieldId);
  };

  // Get layout class based on field layout
  const getLayoutClass = (layout?: string) => {
    switch (layout) {
      case "half":
        return "w-1/2";
      case "third":
        return "w-1/3";
      case "full":
      default:
        return "w-full";
    }
  };

  // Render different field types
  const renderField = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "tel":
      case "url":
        return (
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              className="w-full p-2 border rounded-md bg-background"
              disabled
            />
          </div>
        );
      case "textarea":
        return (
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder}
              className="w-full p-2 border rounded-md bg-background h-24"
              disabled
            />
          </div>
        );
      case "select":
        return (
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              className="w-full p-2 border rounded-md bg-background"
              disabled
            >
              <option value="">Select an option</option>
              {field.options?.map((option, idx) => (
                <option key={idx} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      case "checkbox":
        return (
          <div className="mb-2 flex items-start">
            <input type="checkbox" className="mt-1 mr-2" disabled />
            <label className="block text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );
      case "radio":
        return (
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-1">
              {field.options?.map((option, idx) => (
                <div key={idx} className="flex items-center">
                  <input
                    type="radio"
                    name={`radio-${field.id}`}
                    className="mr-2"
                    disabled
                  />
                  <label className="text-sm">{option.label}</label>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="mb-2 p-2 border rounded-md bg-muted">
            <p className="text-sm font-medium">
              {field.label || "Unknown Field Type"}
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className="bg-background border-2 rounded-md h-full overflow-y-auto flex flex-col"
      style={{ backgroundColor: "white" }}
    >
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Form Canvas</h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop form elements here or use the add button below
        </p>
      </div>

      <div
        className={cn(
          "flex-1 p-6 overflow-y-auto",
          isDraggingOver
            ? "bg-blue-50 border-2 border-dashed border-blue-300"
            : "",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {fields.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <PlusCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              Drop Form Elements Here
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Drag elements from the Field Palette on the left and drop them
              here to build your form
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap -mx-2">
            {fields.map((field) => (
              <div
                key={field.id}
                className={cn("px-2 mb-4", getLayoutClass(field.layout))}
              >
                <Card
                  className={cn(
                    "p-4 cursor-pointer hover:shadow-md transition-shadow h-full",
                    activeField === field.id ? "ring-2 ring-primary" : "",
                  )}
                  onClick={() => handleFieldClick(field.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <span className="text-xs font-medium px-2 py-1 bg-muted rounded mr-2">
                        {field.type}
                      </span>
                      <h4 className="text-sm font-medium">{field.label}</h4>
                    </div>
                    <div className="flex space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFieldMove(field.id, "up");
                              }}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Move Up</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFieldMove(field.id, "down");
                              }}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Move Down</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFieldSelect(field.id);
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Properties</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFieldDelete(field.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Field</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  {renderField(field)}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <Button className="w-full" variant="outline" onClick={onAddField}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Field
        </Button>
      </div>
    </div>
  );
};

export default CanvasDropZone;
