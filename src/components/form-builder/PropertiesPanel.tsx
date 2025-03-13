import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Label } from "../ui/label";
import { X, AlignLeft, Type, Check, AlertCircle } from "lucide-react";
import FieldLayout from "./FieldLayout";

interface PropertiesPanelProps {
  selectedField?: {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
    description?: string;
    validation?: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: string;
      min?: number;
      max?: number;
    };
    hidden?: boolean;
    readonly?: boolean;
    defaultValue?: string;
    className?: string;
    layout?: "full" | "half" | "third";
  };
  onUpdateField?: (fieldId: string, updates: any) => void;
}

const PropertiesPanel = ({
  selectedField = {
    id: "field-1",
    type: "text",
    label: "Text Field",
    placeholder: "Enter text here",
    required: false,
    description: "This is a sample text field",
    validation: {
      required: false,
      minLength: 0,
      maxLength: 100,
    },
    layout: "full" as "full" | "half" | "third",
  },
  onUpdateField = () => {},
}: PropertiesPanelProps) => {
  const [activeTab, setActiveTab] = useState("general");

  const handleFieldUpdate = (key: string, value: any) => {
    if (onUpdateField && selectedField.id) {
      onUpdateField(selectedField.id, { [key]: value });
    }
  };

  const handleValidationUpdate = (key: string, value: any) => {
    if (onUpdateField && selectedField.id) {
      onUpdateField(selectedField.id, {
        validation: {
          ...selectedField.validation,
          [key]: value,
        },
      });
    }
  };

  const handleLayoutChange = (layout: "full" | "half" | "third") => {
    if (onUpdateField && selectedField.id) {
      onUpdateField(selectedField.id, { layout });
    }
  };

  return (
    <div className="h-full w-full bg-background border-l border-border p-4 overflow-y-auto">
      {!selectedField ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mb-4" />
          <h3 className="text-lg font-medium">No Field Selected</h3>
          <p className="mt-2">
            Select a field from the canvas to edit its properties
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Field Properties</h3>
            <button className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="field-label">Label</Label>
                <Input
                  id="field-label"
                  value={selectedField.label}
                  onChange={(e) => handleFieldUpdate("label", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-type">Field Type</Label>
                <Select
                  value={selectedField.type}
                  onValueChange={(value) => handleFieldUpdate("type", value)}
                >
                  <SelectTrigger id="field-type">
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">
                      <div className="flex items-center">
                        <Type className="mr-2 h-4 w-4" /> Text
                      </div>
                    </SelectItem>
                    <SelectItem value="textarea">
                      <div className="flex items-center">
                        <AlignLeft className="mr-2 h-4 w-4" /> Text Area
                      </div>
                    </SelectItem>
                    <SelectItem value="number">
                      <div className="flex items-center">
                        <Type className="mr-2 h-4 w-4" /> Number
                      </div>
                    </SelectItem>
                    <SelectItem value="select">
                      <div className="flex items-center">
                        <Check className="mr-2 h-4 w-4" /> Select
                      </div>
                    </SelectItem>
                    <SelectItem value="checkbox">
                      <div className="flex items-center">
                        <Check className="mr-2 h-4 w-4" /> Checkbox
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Field Layout</Label>
                <FieldLayout
                  layout={selectedField.layout || "full"}
                  onLayoutChange={handleLayoutChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-placeholder">Placeholder</Label>
                <Input
                  id="field-placeholder"
                  value={selectedField.placeholder || ""}
                  onChange={(e) =>
                    handleFieldUpdate("placeholder", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-description">Description</Label>
                <Input
                  id="field-description"
                  value={selectedField.description || ""}
                  onChange={(e) =>
                    handleFieldUpdate("description", e.target.value)
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-required"
                  checked={selectedField.required || false}
                  onCheckedChange={(checked) =>
                    handleFieldUpdate("required", checked)
                  }
                />
                <Label htmlFor="field-required">Required Field</Label>
              </div>

              {selectedField.type === "select" && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="options">
                    <AccordionTrigger>Options</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {(selectedField.options || []).map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              value={option.label}
                              onChange={(e) => {
                                const newOptions = [
                                  ...(selectedField.options || []),
                                ];
                                newOptions[index].label = e.target.value;
                                newOptions[index].value = e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, "-");
                                handleFieldUpdate("options", newOptions);
                              }}
                              placeholder="Option label"
                            />
                            <button className="text-muted-foreground hover:text-destructive">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          className="text-sm text-primary hover:underline"
                          onClick={() => {
                            const newOptions = [
                              ...(selectedField.options || []),
                              { label: "New Option", value: "new-option" },
                            ];
                            handleFieldUpdate("options", newOptions);
                          }}
                        >
                          + Add Option
                        </button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="validation-required"
                  checked={selectedField.validation?.required || false}
                  onCheckedChange={(checked) =>
                    handleValidationUpdate("required", checked)
                  }
                />
                <Label htmlFor="validation-required">Required</Label>
              </div>

              {(selectedField.type === "text" ||
                selectedField.type === "textarea") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="validation-min-length">
                      Minimum Length
                    </Label>
                    <Input
                      id="validation-min-length"
                      type="number"
                      value={selectedField.validation?.minLength || 0}
                      onChange={(e) =>
                        handleValidationUpdate(
                          "minLength",
                          parseInt(e.target.value),
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validation-max-length">
                      Maximum Length
                    </Label>
                    <Input
                      id="validation-max-length"
                      type="number"
                      value={selectedField.validation?.maxLength || 100}
                      onChange={(e) =>
                        handleValidationUpdate(
                          "maxLength",
                          parseInt(e.target.value),
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validation-pattern">Pattern (RegEx)</Label>
                    <Input
                      id="validation-pattern"
                      value={selectedField.validation?.pattern || ""}
                      onChange={(e) =>
                        handleValidationUpdate("pattern", e.target.value)
                      }
                      placeholder="e.g. ^[A-Za-z0-9]+$"
                    />
                  </div>
                </>
              )}

              {selectedField.type === "number" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="validation-min">Minimum Value</Label>
                    <Input
                      id="validation-min"
                      type="number"
                      value={selectedField.validation?.min || 0}
                      onChange={(e) =>
                        handleValidationUpdate("min", parseInt(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validation-max">Maximum Value</Label>
                    <Input
                      id="validation-max"
                      type="number"
                      value={selectedField.validation?.max || 100}
                      onChange={(e) =>
                        handleValidationUpdate("max", parseInt(e.target.value))
                      }
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="field-hidden"
                  checked={selectedField.hidden || false}
                  onCheckedChange={(checked) =>
                    handleFieldUpdate("hidden", checked)
                  }
                />
                <Label htmlFor="field-hidden">Hidden Field</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="field-readonly"
                  checked={selectedField.readonly || false}
                  onCheckedChange={(checked) =>
                    handleFieldUpdate("readonly", checked)
                  }
                />
                <Label htmlFor="field-readonly">Read Only</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-default">Default Value</Label>
                <Input
                  id="field-default"
                  value={selectedField.defaultValue || ""}
                  onChange={(e) =>
                    handleFieldUpdate("defaultValue", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-class">CSS Class</Label>
                <Input
                  id="field-class"
                  value={selectedField.className || ""}
                  onChange={(e) =>
                    handleFieldUpdate("className", e.target.value)
                  }
                />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default PropertiesPanel;
