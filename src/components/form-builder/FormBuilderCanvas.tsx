import React, { useState } from "react";
import { cn } from "@/lib/utils";
import FormToolbar from "./FormToolbar";
import FieldPalette from "./FieldPalette";
import CanvasDropZone from "./CanvasDropZone";
import PropertiesPanel from "./PropertiesPanel";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface FormField {
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
}

interface FormBuilderCanvasProps {
  initialFields?: FormField[];
  onSave?: (fields: FormField[]) => void;
  onPublish?: (fields: FormField[]) => void;
  className?: string;
}

const FormBuilderCanvas: React.FC<FormBuilderCanvasProps> = ({
  initialFields = [
    {
      id: "1",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
    },
    {
      id: "2",
      type: "email",
      label: "Email Address",
      placeholder: "Enter your email",
      required: true,
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
    },
  ],
  onSave = () => {},
  onPublish = () => {},
  className,
}) => {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Find the selected field
  const selectedField = fields.find((field) => field.id === selectedFieldId);

  // Handle field selection
  const handleFieldSelect = (fieldId: string) => {
    setSelectedFieldId(fieldId);
  };

  // Handle field deletion
  const handleFieldDelete = (fieldId: string) => {
    setFields(fields.filter((field) => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  // Handle field movement
  const handleFieldMove = (fieldId: string, direction: "up" | "down") => {
    const index = fields.findIndex((field) => field.id === fieldId);
    if (index === -1) return;

    const newFields = [...fields];
    if (direction === "up" && index > 0) {
      // Swap with the previous field
      [newFields[index - 1], newFields[index]] = [
        newFields[index],
        newFields[index - 1],
      ];
    } else if (direction === "down" && index < fields.length - 1) {
      // Swap with the next field
      [newFields[index], newFields[index + 1]] = [
        newFields[index + 1],
        newFields[index],
      ];
    }

    setFields(newFields);
  };

  // Handle field updates
  const handleFieldUpdate = (fieldId: string, updates: Partial<FormField>) => {
    setFields(
      fields.map((field) => {
        if (field.id === fieldId) {
          return { ...field, ...updates };
        }
        return field;
      }),
    );
  };

  // Handle drop of new field
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    try {
      const fieldData = JSON.parse(
        event.dataTransfer.getData("application/json"),
      );
      if (fieldData && fieldData.id) {
        // Generate a unique ID for the new field
        const newId = `field-${Date.now()}`;
        const newField: FormField = {
          id: newId,
          type: fieldData.id,
          label: fieldData.name,
          placeholder: `Enter ${fieldData.name.toLowerCase()}`,
          required: false,
        };

        // Add options for select fields
        if (fieldData.id === "select" || fieldData.id === "radio") {
          newField.options = [
            { label: "Option 1", value: "option-1" },
            { label: "Option 2", value: "option-2" },
            { label: "Option 3", value: "option-3" },
          ];
        }

        setFields([...fields, newField]);
        setSelectedFieldId(newId);
      }
    } catch (error) {
      console.error("Error parsing dropped field data:", error);
    }
  };

  // Handle form save
  const handleSave = () => {
    onSave(fields);
  };

  // Handle form publish
  const handlePublish = () => {
    onPublish(fields);
  };

  // Handle form preview
  const handlePreview = () => {
    // Open a preview modal or navigate to preview page
    console.log("Preview form:", fields);
  };

  // Handle form duplication
  const handleDuplicate = () => {
    // Logic to duplicate the form
    console.log("Duplicate form");
  };

  // Handle form deletion
  const handleDelete = () => {
    // Logic to delete the form
    console.log("Delete form");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={cn("flex flex-col h-full w-full bg-background", className)}
      >
        <FormToolbar
          formTitle={formTitle}
          onSave={handleSave}
          onPreview={handlePreview}
          onPublish={handlePublish}
          onTitleChange={setFormTitle}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={() => console.log("Undo")}
          onRedo={() => console.log("Redo")}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="w-[280px] border-r">
            <FieldPalette />
          </div>

          <div className="flex-1">
            <CanvasDropZone
              fields={fields}
              onFieldSelect={handleFieldSelect}
              onFieldDelete={handleFieldDelete}
              onFieldMove={handleFieldMove}
              onDrop={handleDrop}
            />
          </div>

          <div className="w-[280px]">
            <PropertiesPanel
              selectedField={selectedField}
              onUpdateField={handleFieldUpdate}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default FormBuilderCanvas;
