import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import FormToolbar from "./FormToolbar";
import FieldPalette from "./FieldPalette";
import CanvasDropZone from "./CanvasDropZone";
import PropertiesPanel from "./PropertiesPanel";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  FormField,
  Form,
  createForm,
  getFormById,
  updateForm,
  createFormFields,
  updateFormField,
  deleteFormField,
  convertFieldToDbFormat,
  convertDbFieldToFrontend,
} from "@/lib/form-builder";
import { supabase } from "@/lib/supabase";

interface FormBuilderCanvasProps {
  initialFields?: FormField[];
  onSave?: (fields: FormField[]) => void;
  onPublish?: (fields: FormField[]) => void;
  className?: string;
}

const FormBuilderCanvas: React.FC<FormBuilderCanvasProps> = ({
  initialFields = [],
  onSave = () => {},
  onPublish = () => {},
  className,
}) => {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewFormDialog, setShowNewFormDialog] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Get current user and company
  useEffect(() => {
    const fetchUserAndCompany = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);

        const { data: companyMember } = await supabase
          .from("company_members")
          .select("company_id")
          .eq("user_id", user.id)
          .single();

        if (companyMember) {
          setCompanyId(companyMember.company_id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserAndCompany();
  }, []);

  // Load form if ID is provided
  useEffect(() => {
    if (id) {
      loadForm(id);
    } else if (!showNewFormDialog && companyId && userId) {
      setShowNewFormDialog(true);
    }
  }, [id, companyId, userId]);

  // Load form data
  const loadForm = async (formId: string) => {
    setIsLoading(true);
    try {
      const form = await getFormById(formId);
      setFormId(form.id);
      setFormTitle(form.title);
      setFormDescription(form.description || "");

      // Convert DB fields to frontend format
      if (form.fields && Array.isArray(form.fields)) {
        const formattedFields = form.fields.map(convertDbFieldToFrontend);
        setFields(formattedFields);
      }
    } catch (error) {
      console.error("Error loading form:", error);
      toast({
        title: "Error",
        description: "Failed to load form data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Find the selected field
  const selectedField = fields.find((field) => field.id === selectedFieldId);

  // Handle field selection
  const handleFieldSelect = (fieldId: string) => {
    setSelectedFieldId(fieldId);
  };

  // Handle field deletion
  const handleFieldDelete = async (fieldId: string) => {
    // If the form is saved in the database, delete the field from the database
    if (formId) {
      try {
        await deleteFormField(fieldId);
      } catch (error) {
        console.error("Error deleting field:", error);
        toast({
          title: "Error",
          description: "Failed to delete field",
          variant: "destructive",
        });
        return;
      }
    }

    setFields(fields.filter((field) => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  // Handle field movement
  const handleFieldMove = async (fieldId: string, direction: "up" | "down") => {
    const index = fields.findIndex((field) => field.id === fieldId);
    if (index === -1) return;

    const newFields = [...fields];
    if (direction === "up" && index > 0) {
      // Swap with the previous field
      [newFields[index - 1], newFields[index]] = [
        newFields[index],
        newFields[index - 1],
      ];

      // Update order_index
      newFields[index - 1].order_index = index - 1;
      newFields[index].order_index = index;
    } else if (direction === "down" && index < fields.length - 1) {
      // Swap with the next field
      [newFields[index], newFields[index + 1]] = [
        newFields[index + 1],
        newFields[index],
      ];

      // Update order_index
      newFields[index].order_index = index;
      newFields[index + 1].order_index = index + 1;
    }

    setFields(newFields);

    // If the form is saved in the database, update the field order
    if (formId) {
      try {
        // Update both fields with new order_index
        if (direction === "up" && index > 0) {
          await updateFormField(newFields[index - 1].id, {
            order_index: newFields[index - 1].order_index,
          });
          await updateFormField(newFields[index].id, {
            order_index: newFields[index].order_index,
          });
        } else if (direction === "down" && index < fields.length - 1) {
          await updateFormField(newFields[index].id, {
            order_index: newFields[index].order_index,
          });
          await updateFormField(newFields[index + 1].id, {
            order_index: newFields[index + 1].order_index,
          });
        }
      } catch (error) {
        console.error("Error updating field order:", error);
        toast({
          title: "Error",
          description: "Failed to update field order",
          variant: "destructive",
        });
      }
    }
  };

  // Handle field update
  const handleFieldUpdate = async (
    fieldId: string,
    updates: Partial<FormField>,
  ) => {
    const index = fields.findIndex((field) => field.id === fieldId);
    if (index === -1) return;

    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);

    // If the form is saved in the database, update the field
    if (formId) {
      try {
        await updateFormField(fieldId, updates);
      } catch (error) {
        console.error("Error updating field:", error);
        toast({
          title: "Error",
          description: "Failed to update field",
          variant: "destructive",
        });
      }
    }
  };

  // Handle form drop
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const fieldData = event.dataTransfer.getData("application/json");

    if (fieldData) {
      try {
        const field = JSON.parse(fieldData);
        const newField: FormField = {
          id: `field-${Date.now()}`,
          type: field.id,
          label: field.name,
          placeholder: `Enter ${field.name.toLowerCase()}`,
          required: false,
          order_index: fields.length,
          ...(field.id === "select" || field.id === "radio"
            ? {
                options: [
                  { label: "Option 1", value: "option-1" },
                  { label: "Option 2", value: "option-2" },
                  { label: "Option 3", value: "option-3" },
                ],
              }
            : {}),
        };

        setFields([...fields, newField]);
      } catch (error) {
        console.error("Error adding field:", error);
      }
    }
  };

  // Handle add field
  const handleAddField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: "text",
      label: "New Field",
      placeholder: "Enter text",
      required: false,
      order_index: fields.length,
    };

    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  // Handle preview form
  const handlePreviewForm = () => {
    console.log("Preview button clicked in FormBuilderCanvas");
    try {
      if (!formId) {
        console.error("No formId available for preview");
        toast({
          title: "Warning",
          description: "Please save the form before previewing",
          variant: "default",
        });
        return;
      }

      toast({
        title: "Preview Mode",
        description: "Form preview functionality activated",
      });

      // In a real implementation, this would open a preview modal or navigate to a preview page
    } catch (error) {
      console.error("Error previewing form:", error);
      toast({
        title: "Error",
        description: "Failed to preview form",
        variant: "destructive",
      });
    }
  };

  // Handle save form
  const handleSaveForm = async () => {
    console.log("Save button clicked in FormBuilderCanvas");
    try {
      if (!companyId || !userId) {
        console.error("Missing companyId or userId", { companyId, userId });
        toast({
          title: "Error",
          description: "You must be logged in to save a form",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);

      try {
        let savedFormId = formId;

        // If no form ID, create a new form
        if (!savedFormId) {
          const newForm = await createForm({
            title: formTitle,
            description: formDescription,
            company_id: companyId,
            created_by: userId,
            published: false,
            status: "draft",
          });

          savedFormId = newForm.id;
          setFormId(savedFormId);

          // Create form fields
          if (fields.length > 0) {
            const fieldsToCreate = fields.map((field, index) => ({
              ...convertFieldToDbFormat(field, index),
              form_id: savedFormId,
            }));

            await createFormFields(savedFormId, fieldsToCreate);
          }
        } else {
          // Update existing form
          await updateForm(savedFormId, {
            title: formTitle,
            description: formDescription,
            updated_at: new Date().toISOString(),
          });

          // Update existing fields
          // This is simplified - in a real app you'd need to handle field creation, updates, and deletions
          for (const field of fields) {
            await updateFormField(
              field.id,
              convertFieldToDbFormat(field, field.order_index),
            );
          }
        }

        toast({
          title: "Success",
          description: "Form saved successfully",
        });

        // Navigate to the form builder with the form ID
        if (!formId) {
          navigate(`/form-builder/${savedFormId}`);
        }
      } catch (error) {
        console.error("Error saving form:", error);
        toast({
          title: "Error",
          description:
            "Failed to save form: " +
            (error instanceof Error ? error.message : String(error)),
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Outer error:", error);
    }
  };

  // Handle publish form
  const handlePublishForm = async () => {
    console.log("Publish button clicked in FormBuilderCanvas");
    try {
      if (!formId) {
        console.error("No formId available for publishing");
        toast({
          title: "Error",
          description: "You must save the form before publishing",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);

      try {
        await updateForm(formId, {
          published: true,
          status: "published",
        });

        toast({
          title: "Success",
          description: "Form published successfully",
        });
      } catch (error) {
        console.error("Error publishing form:", error);
        toast({
          title: "Error",
          description: "Failed to publish form",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Outer error:", error);
    }
  };

  // Handle create new form dialog
  const handleCreateNewForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId || !userId) {
      toast({
        title: "Error",
        description: "You must be logged in to create a form",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const newForm = await createForm({
        title: formTitle,
        description: formDescription,
        company_id: companyId,
        created_by: userId,
        published: false,
        status: "draft",
      });

      setFormId(newForm.id);
      setShowNewFormDialog(false);

      toast({
        title: "Success",
        description: "Form created successfully",
      });

      // Navigate to the form builder with the form ID
      navigate(`/form-builder/${newForm.id}`);
    } catch (error) {
      console.error("Error creating form:", error);
      toast({
        title: "Error",
        description: "Failed to create form",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        <FormToolbar
          formTitle={formTitle}
          onTitleChange={setFormTitle}
          onSave={handleSaveForm}
          onPublish={handlePublishForm}
          onPreview={handlePreviewForm}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={() => {}}
          onRedo={() => {}}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 border-r">
            <FieldPalette />
          </div>

          <div className="flex-1 overflow-hidden">
            <CanvasDropZone
              fields={fields}
              onFieldSelect={handleFieldSelect}
              onFieldDelete={handleFieldDelete}
              onFieldMove={handleFieldMove}
              onDrop={handleDrop}
              onAddField={handleAddField}
            />
          </div>

          <div className="w-64 border-l">
            <PropertiesPanel
              selectedField={selectedField}
              onUpdateField={handleFieldUpdate}
            />
          </div>
        </div>

        {/* New Form Dialog */}
        <Dialog open={showNewFormDialog} onOpenChange={setShowNewFormDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateNewForm}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="form-title">Form Title</Label>
                  <Input
                    id="form-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Enter form title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form-description">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="form-description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Enter form description"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewFormDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Form"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Loading form...</p>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default FormBuilderCanvas;
