import { supabase } from "./supabase";

export interface FormField {
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
  order_index: number;
  parent_id?: string | null;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  version: number;
  status: "draft" | "published" | "archived";
  fields?: FormField[];
}

export interface FormSubmission {
  id: string;
  form_id: string;
  submitted_by: string;
  submitted_at: string;
  data: Record<string, any>;
  status: "submitted" | "in_progress" | "rejected" | "approved";
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  device_info?: {
    userAgent: string;
    platform: string;
  };
}

// Create a new form
export const createForm = async (
  form: Omit<Form, "id" | "created_at" | "updated_at" | "version">,
) => {
  const { data, error } = await supabase
    .from("forms")
    .insert(form)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get a form by ID with its fields
export const getFormById = async (formId: string) => {
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .single();

  if (formError) throw formError;

  const { data: fields, error: fieldsError } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", formId)
    .order("order_index", { ascending: true });

  if (fieldsError) throw fieldsError;

  return { ...form, fields: fields || [] };
};

// Get all forms for the current user's company
export const getForms = async () => {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Update a form
export const updateForm = async (
  formId: string,
  updates: Partial<
    Omit<Form, "id" | "created_at" | "created_by" | "company_id">
  >,
) => {
  const { data, error } = await supabase
    .from("forms")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", formId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a form
export const deleteForm = async (formId: string) => {
  const { error } = await supabase.from("forms").delete().eq("id", formId);

  if (error) throw error;
  return true;
};

// Create form fields
export const createFormFields = async (
  formId: string,
  fields: Omit<FormField, "id" | "created_at" | "updated_at">[],
) => {
  // Ensure all fields have valid UUIDs
  const fieldsWithFormId = fields.map((field) => {
    // Make sure the ID is a valid UUID
    const fieldId = field.id;
    const isValidUUID =
      typeof fieldId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        fieldId,
      );

    return {
      ...field,
      form_id: formId,
      id: isValidUUID ? fieldId : crypto.randomUUID(),
    };
  });

  const { data, error } = await supabase
    .from("form_fields")
    .insert(fieldsWithFormId)
    .select();

  if (error) throw error;
  return data;
};

// Update a form field
export const updateFormField = async (
  fieldId: string,
  updates: Partial<Omit<FormField, "id" | "created_at">>,
) => {
  const { data, error } = await supabase
    .from("form_fields")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", fieldId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a form field
export const deleteFormField = async (fieldId: string) => {
  const { error } = await supabase
    .from("form_fields")
    .delete()
    .eq("id", fieldId);

  if (error) throw error;
  return true;
};

// Submit a form
export const submitForm = async (formId: string, data: Record<string, any>) => {
  // Get location if available
  let location = null;
  try {
    if (navigator.geolocation) {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          });
        },
      );

      location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    }
  } catch (error) {
    console.warn("Could not get location:", error);
  }

  // Get device info
  const deviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
  };

  const { data: submission, error } = await supabase
    .from("form_submissions")
    .insert({
      form_id: formId,
      data,
      location,
      device_info: deviceInfo,
    })
    .select()
    .single();

  if (error) throw error;
  return submission;
};

// Get form submissions
export const getFormSubmissions = async (formId: string) => {
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*")
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Convert frontend field format to database format
export const convertFieldToDbFormat = (field: any, index: number) => {
  return {
    field_type: field.type,
    label: field.label,
    placeholder: field.placeholder,
    description: field.description,
    required: field.required || false,
    options: field.options ? JSON.stringify(field.options) : null,
    validation: field.validation ? JSON.stringify(field.validation) : null,
    order_index: index,
    layout: field.layout || "full",
    hidden: field.hidden || false,
    readonly: field.readonly || false,
    default_value: field.defaultValue,
    parent_id: field.parent_id || null,
  };
};

// Convert database field format to frontend format
export const convertDbFieldToFrontend = (field: any): FormField => {
  return {
    id: field.id,
    type: field.field_type,
    label: field.label,
    placeholder: field.placeholder,
    description: field.description,
    required: field.required,
    options: field.options ? field.options : undefined,
    validation: field.validation ? field.validation : undefined,
    order_index: field.order_index,
    layout: field.layout as "full" | "half" | "third",
    hidden: field.hidden,
    readonly: field.readonly,
    defaultValue: field.default_value,
    parent_id: field.parent_id,
  };
};
