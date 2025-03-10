import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TextIcon,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  FileText,
  Image,
  Upload,
  MapPin,
  Phone,
  Mail,
  Link,
  AlignLeft,
  Table2,
  PenLine,
  Star,
  SlidersHorizontal,
  SplitSquareVertical,
} from "lucide-react";

interface FieldItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface FieldPaletteProps {
  onDragStart?: (event: React.DragEvent, field: FieldItem) => void;
  className?: string;
}

const basicFields: FieldItem[] = [
  {
    id: "text",
    name: "Text Field",
    icon: <TextIcon className="h-4 w-4" />,
    description: "Single line text input",
  },
  {
    id: "textarea",
    name: "Text Area",
    icon: <AlignLeft className="h-4 w-4" />,
    description: "Multi-line text input",
  },
  {
    id: "number",
    name: "Number",
    icon: <Hash className="h-4 w-4" />,
    description: "Numeric input field",
  },
  {
    id: "date",
    name: "Date",
    icon: <Calendar className="h-4 w-4" />,
    description: "Date picker",
  },
  {
    id: "checkbox",
    name: "Checkbox",
    icon: <CheckSquare className="h-4 w-4" />,
    description: "Single checkbox",
  },
  {
    id: "select",
    name: "Dropdown",
    icon: <List className="h-4 w-4" />,
    description: "Dropdown selection",
  },
];

const advancedFields: FieldItem[] = [
  {
    id: "file",
    name: "File Upload",
    icon: <Upload className="h-4 w-4" />,
    description: "File upload field",
  },
  {
    id: "image",
    name: "Image",
    icon: <Image className="h-4 w-4" />,
    description: "Image upload field",
  },
  {
    id: "richtext",
    name: "Rich Text",
    icon: <FileText className="h-4 w-4" />,
    description: "Rich text editor",
  },
  {
    id: "location",
    name: "Location",
    icon: <MapPin className="h-4 w-4" />,
    description: "Location picker",
  },
  {
    id: "signature",
    name: "Signature",
    icon: <PenLine className="h-4 w-4" />,
    description: "Digital signature field",
  },
  {
    id: "table",
    name: "Table",
    icon: <Table2 className="h-4 w-4" />,
    description: "Tabular data input",
  },
];

const layoutFields: FieldItem[] = [
  {
    id: "section",
    name: "Section",
    icon: <SplitSquareVertical className="h-4 w-4" />,
    description: "Group fields in a section",
  },
  {
    id: "separator",
    name: "Separator",
    icon: <Separator className="h-4 w-4" />,
    description: "Visual divider",
  },
  {
    id: "spacer",
    name: "Spacer",
    icon: <Type className="h-4 w-4" />,
    description: "Add vertical space",
  },
];

const specialFields: FieldItem[] = [
  {
    id: "email",
    name: "Email",
    icon: <Mail className="h-4 w-4" />,
    description: "Email input with validation",
  },
  {
    id: "phone",
    name: "Phone",
    icon: <Phone className="h-4 w-4" />,
    description: "Phone number input",
  },
  {
    id: "url",
    name: "URL",
    icon: <Link className="h-4 w-4" />,
    description: "Website URL input",
  },
  {
    id: "rating",
    name: "Rating",
    icon: <Star className="h-4 w-4" />,
    description: "Star rating input",
  },
  {
    id: "slider",
    name: "Slider",
    icon: <SlidersHorizontal className="h-4 w-4" />,
    description: "Range slider input",
  },
];

const FieldItem = ({
  field,
  onDragStart,
}: {
  field: FieldItem;
  onDragStart?: (event: React.DragEvent, field: FieldItem) => void;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-grab"
            draggable
            onDragStart={(e) => onDragStart && onDragStart(e, field)}
            data-field-type={field.id}
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-primary/10 text-primary">
              {field.icon}
            </div>
            <div className="flex-grow">
              <p className="text-sm font-medium">{field.name}</p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{field.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const FieldGroup = ({
  title,
  fields,
  onDragStart,
}: {
  title: string;
  fields: FieldItem[];
  onDragStart?: (event: React.DragEvent, field: FieldItem) => void;
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <div className="space-y-1">
        {fields.map((field) => (
          <FieldItem key={field.id} field={field} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
};

const FieldPalette = ({ onDragStart, className }: FieldPaletteProps = {}) => {
  const handleDragStart = (event: React.DragEvent, field: FieldItem) => {
    // Set data transfer for drag and drop
    event.dataTransfer.setData("application/json", JSON.stringify(field));
    event.dataTransfer.effectAllowed = "copy";

    // Create a drag image
    const dragImage = document.createElement("div");
    dragImage.innerHTML = `<div class="p-2 bg-white border rounded shadow-md flex items-center gap-2">
      <div class="w-6 h-6 flex items-center justify-center">${field.icon.props.className}</div>
      <span>${field.name}</span>
    </div>`;
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);

    // Call the provided onDragStart if it exists
    if (onDragStart) {
      onDragStart(event, field);
    }

    // Clean up the drag image element after drag operation
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  return (
    <Card className={cn("w-full h-full bg-background", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Form Elements</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="special">Special</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[calc(100vh-240px)]">
            <TabsContent value="basic" className="space-y-4 mt-0">
              <FieldGroup
                title="Basic Fields"
                fields={basicFields}
                onDragStart={handleDragStart}
              />
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 mt-0">
              <FieldGroup
                title="Advanced Fields"
                fields={advancedFields}
                onDragStart={handleDragStart}
              />
            </TabsContent>
            <TabsContent value="layout" className="space-y-4 mt-0">
              <FieldGroup
                title="Layout Elements"
                fields={layoutFields}
                onDragStart={handleDragStart}
              />
            </TabsContent>
            <TabsContent value="special" className="space-y-4 mt-0">
              <FieldGroup
                title="Special Fields"
                fields={specialFields}
                onDragStart={handleDragStart}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FieldPalette;
