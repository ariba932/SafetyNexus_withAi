import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Save,
  Eye,
  Play,
  Settings,
  ChevronDown,
  Undo,
  Redo,
  Copy,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FormToolbarProps {
  formTitle?: string;
  onSave?: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
  onTitleChange?: (title: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

const FormToolbar = ({
  formTitle = "Untitled Form",
  onSave = () => {},
  onPreview = () => {},
  onPublish = () => {},
  onTitleChange = () => {},
  canUndo = false,
  canRedo = false,
  onUndo = () => {},
  onRedo = () => {},
  onDuplicate = () => {},
  onDelete = () => {},
  isOnline = navigator.onLine,
  hasPendingChanges = false,
}: FormToolbarProps & { isOnline?: boolean; hasPendingChanges?: boolean }) => {
  console.log("FormToolbar rendered");
  const [title, setTitle] = useState(formTitle);

  // Direct click handlers without preventDefault to avoid blocking default button behavior
  const handleSaveClick = () => {
    console.log("Save button clicked directly");
    onSave();
  };

  const handlePreviewClick = () => {
    console.log("Preview button clicked directly");
    onPreview();
  };

  const handlePublishClick = () => {
    console.log("Publish button clicked directly");
    onPublish();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onTitleChange(e.target.value);
  };

  return (
    <div className="flex items-center justify-between w-full h-16 px-4 border-b bg-background">
      <div className="flex items-center space-x-4">
        <Input
          value={title}
          onChange={handleTitleChange}
          className="w-64 text-lg font-medium"
          placeholder="Form Title"
        />

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  <Undo className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRedo}
                  disabled={!canRedo}
                >
                  <Redo className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveClick}
          className={`flex items-center ${hasPendingChanges ? "bg-amber-100 border-amber-300 dark:bg-amber-900 dark:border-amber-700" : ""}`}
          type="button"
        >
          <Save className="h-4 w-4 mr-2" />
          {hasPendingChanges ? "Save*" : "Save"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviewClick}
          className="flex items-center"
          type="button"
          disabled={!isOnline}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handlePublishClick}
          className="flex items-center"
          type="button"
          disabled={!isOnline || hasPendingChanges}
        >
          <Play className="h-4 w-4 mr-2" />
          Publish
        </Button>

        {!isOnline && (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700"
          >
            Offline Mode
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default FormToolbar;
