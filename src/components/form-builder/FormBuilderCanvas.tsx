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
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingChanges, setPendingChanges] = useState<boolean>(false);

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

        const { data: companyMember, error } = await supabase
          .from("company_members")
          .select("company_id")
          .eq("user_id", user.id)
          .single();

        if (companyMember && companyMember.company_id) {
          setCompanyId(companyMember.company_id);
        } else {
          // If no company found, create a default company for the user
          const { data: newCompany, error: companyError } = await supabase
            .from("companies")
            .insert([
              {
                name: "My Company",
                created_by: user.id,
                domain: "default.com",
                updated_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (companyError) {
            console.error("Error creating company:", companyError);
            return;
          }

          // Associate user with the new company
          const { error: memberError } = await supabase
            .from("company_members")
            .insert([
              {
                user_id: user.id,
                company_id: newCompany.id,
                role: "Owner/Admin",
                is_active: true,
              },
            ]);

          if (memberError) {
            console.error("Error creating company member:", memberError);
            return;
          }

          setCompanyId(newCompany.id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserAndCompany();
  }, []);

  // Add online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Online",
        description: "You are now online. Syncing changes...",
      });

      // Sync any pending changes
      if (formId) {
        handleSaveForm();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline",
        description: "You are now offline. Changes will be saved locally.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [formId]);

  useEffect(() => {
    if (id) {
      loadForm(id);
    } else if (!showNewFormDialog && companyId && userId) {
      setShowNewFormDialog(true);
    }

    // Check for pending form data when coming back online
    if (isOnline) {
      const pendingFormData = localStorage.getItem("pendingFormData");
      if (pendingFormData) {
        try {
          const formData = JSON.parse(pendingFormData);
          if (formData.formId) {
            // We have a pending form to sync
            setFormId(formData.formId);
            setFormTitle(formData.title);
            setFormDescription(formData.description);
            setFields(formData.fields);
            setPendingChanges(true);

            toast({
              title: "Pending Changes",
              description:
                "Found locally saved changes. Click Save to sync with server.",
            });
          }
        } catch (error) {
          console.error("Error parsing pending form data:", error);
        }
      }
    }
  }, [id, companyId, userId, isOnline]);

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
  const handleFieldDelete = (fieldId: string) => {
    // Only update local state, don't push to backend until save
    setFields(fields.filter((field) => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
    setPendingChanges(true);
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
    setPendingChanges(true);
  };

  // Handle field update
  const handleFieldUpdate = (fieldId: string, updates: Partial<FormField>) => {
    const index = fields.findIndex((field) => field.id === fieldId);
    if (index === -1) return;

    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
    setPendingChanges(true);
  };

  // Handle form drop
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const fieldData = event.dataTransfer.getData("application/json");

    if (fieldData) {
      try {
        const field = JSON.parse(fieldData);
        // Ensure we're using a proper UUID
        const newField: FormField = {
          id: crypto.randomUUID(),
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
        setPendingChanges(true);
      } catch (error) {
        console.error("Error adding field:", error);
      }
    }
  };

  // Handle add field
  const handleAddField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type: "text",
      label: "New Field",
      placeholder: "Enter text",
      required: false,
      order_index: fields.length,
    };

    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
    setPendingChanges(true);
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
      if (!userId) {
        console.error("Missing userId", { userId });
        toast({
          title: "Error",
          description: "You must be logged in to save a form",
          variant: "destructive",
        });
        return;
      }

      // Check if we're online
      if (!isOnline) {
        // Store form data locally
        const formData = {
          title: formTitle,
          description: formDescription,
          fields: fields,
          lastModified: new Date().toISOString(),
          formId: formId,
        };

        localStorage.setItem("pendingFormData", JSON.stringify(formData));

        toast({
          title: "Offline Mode",
          description: "Form saved locally and will sync when online",
        });
        setPendingChanges(false);
        return;
      }

      if (!companyId) {
        console.log("No company ID found, creating a default company");
        // Create a default company if none exists
        const { data: newCompany, error: companyError } = await supabase
          .from("companies")
          .insert([
            {
              name: "My Company",
              created_by: userId,
              domain: "default.com",
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (companyError) {
          console.error("Error creating company:", companyError);
          toast({
            title: "Error",
            description: "Failed to create a company. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Associate user with the new company
        const { error: memberError } = await supabase
          .from("company_members")
          .insert([
            {
              user_id: userId,
              company_id: newCompany.id,
              role: "Owner/Admin",
              is_active: true,
            },
          ]);

        if (memberError) {
          console.error("Error creating company member:", memberError);
          toast({
            title: "Error",
            description:
              "Failed to associate you with the company. Please try again.",
            variant: "destructive",
          });
          return;
        }

        setCompanyId(newCompany.id);
      }

      setIsSaving(true);

      try {
        let savedFormId = formId;

        // Ensure all fields have valid UUIDs before saving
        const fieldsWithUUIDs = fields.map((field) => ({
          ...field,
          id:
            field.id.includes("-") && field.id.length === 36
              ? field.id // Already a UUID
              : crypto.randomUUID(), // Generate new UUID
        }));

        // Update local state with proper UUIDs
        setFields(fieldsWithUUIDs);

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
          if (fieldsWithUUIDs.length > 0) {
            const fieldsToCreate = fieldsWithUUIDs.map((field, index) => ({
              ...convertFieldToDbFormat(field, index),
              form_id: savedFormId,
            }));

            await createFormFields(savedFormId, fieldsToCreate);
          }
        } else {
          // For existing forms, we need to handle updates, deletions, and additions

          // 1. First, get existing fields from the database
          const { data: existingFields, error: fieldsError } = await supabase
            .from("form_fields")
            .select("id")
            .eq("form_id", savedFormId);

          if (fieldsError) throw fieldsError;

          // 2. Update the form metadata
          await updateForm(savedFormId, {
            title: formTitle,
            description: formDescription,
            updated_at: new Date().toISOString(),
          });

          // 3. Find fields to delete (fields in DB but not in current state)
          const currentFieldIds = new Set(fieldsWithUUIDs.map((f) => f.id));
          const fieldsToDelete = existingFields
            .filter((f) => !currentFieldIds.has(f.id))
            .map((f) => f.id);

          // 4. Delete removed fields
          for (const fieldId of fieldsToDelete) {
            await deleteFormField(fieldId);
          }

          // 5. Find existing field IDs
          const existingFieldIds = new Set(existingFields.map((f) => f.id));

          // 6. Update or create fields
          for (let i = 0; i < fieldsWithUUIDs.length; i++) {
            const field = fieldsWithUUIDs[i];
            const fieldData = convertFieldToDbFormat(field, i);

            if (existingFieldIds.has(field.id)) {
              // Update existing field
              await updateFormField(field.id, fieldData);
            } else {
              // Create new field
              await createFormFields(savedFormId, [
                {
                  ...fieldData,
                  form_id: savedFormId,
                  id: field.id,
                },
              ]);
            }
          }
        }

        toast({
          title: "Success",
          description: "Form saved successfully",
        });
        setPendingChanges(false);

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
          isOnline={isOnline}
          hasPendingChanges={pendingChanges}
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
