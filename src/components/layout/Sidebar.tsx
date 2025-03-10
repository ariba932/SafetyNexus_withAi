import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  FileEdit,
  ClipboardList,
  BarChart2,
  Settings,
  Users,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  AlertTriangle,
  FileCheck,
  Calendar,
  Briefcase,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
  children?: NavItem[];
}

const Sidebar = ({
  className,
  collapsed = false,
  onToggleCollapse = () => {},
}: SidebarProps) => {
  const location = useLocation();
  const activePath = location.pathname;

  const mainNavItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      title: "Form Builder",
      icon: <FileEdit className="h-5 w-5" />,
      path: "/form-builder",
      badge: {
        text: "New",
        variant: "default",
      },
    },
    {
      title: "Inspections",
      icon: <ClipboardList className="h-5 w-5" />,
      path: "/inspections",
      children: [
        {
          title: "All Inspections",
          path: "/inspections",
          icon: <ChevronRight className="h-4 w-4" />,
        },
        {
          title: "Templates",
          path: "/inspections/templates",
          icon: <ChevronRight className="h-4 w-4" />,
        },
        {
          title: "Scheduled",
          path: "/inspections/scheduled",
          icon: <ChevronRight className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Incidents",
      icon: <AlertTriangle className="h-5 w-5" />,
      path: "/incidents",
    },
    {
      title: "Audits",
      icon: <FileCheck className="h-5 w-5" />,
      path: "/audits",
    },
    {
      title: "Training",
      icon: <Briefcase className="h-5 w-5" />,
      path: "/training",
    },
    {
      title: "Calendar",
      icon: <Calendar className="h-5 w-5" />,
      path: "/calendar",
    },
    {
      title: "Reports",
      icon: <BarChart2 className="h-5 w-5" />,
      path: "/reports",
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      title: "Team Members",
      icon: <Users className="h-5 w-5" />,
      path: "/team",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
    },
    {
      title: "Help & Support",
      icon: <HelpCircle className="h-5 w-5" />,
      path: "/help",
    },
  ];

  const renderNavItem = (item: NavItem, index: number) => {
    const isActive = activePath === item.path;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={index} className="mb-1">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed ? "h-10 w-10 p-0" : "px-3",
                )}
                asChild
              >
                <Link to={item.path}>
                  <div className="flex items-center">
                    <span
                      className={cn(
                        "flex-shrink-0",
                        collapsed ? "mx-auto" : "mr-2",
                      )}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="flex-grow text-left">{item.title}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-2 py-0.5 text-xs font-medium",
                          item.badge.variant === "default"
                            ? "bg-primary text-primary-foreground"
                            : item.badge.variant === "secondary"
                              ? "bg-secondary text-secondary-foreground"
                              : item.badge.variant === "destructive"
                                ? "bg-destructive text-destructive-foreground"
                                : "border border-input",
                        )}
                      >
                        {item.badge.text}
                      </span>
                    )}
                  </div>
                </Link>
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">{item.title}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {!collapsed && hasChildren && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children?.map((child, childIndex) => (
              <Button
                key={childIndex}
                variant={activePath === child.path ? "secondary" : "ghost"}
                className="w-full justify-start px-3 py-1 h-8 text-sm"
                asChild
              >
                <Link to={child.path}>
                  <span className="mr-2">{child.icon}</span>
                  <span>{child.title}</span>
                </Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r bg-background",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="p-3 h-16 flex items-center justify-center border-b">
        {collapsed ? (
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            <Shield className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
              <Shield className="h-5 w-5" />
            </div>
            <span className="font-semibold text-lg">SafetyNexus</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">{mainNavItems.map(renderNavItem)}</nav>

        <Separator className="my-4" />

        <nav className="space-y-1">{bottomNavItems.map(renderNavItem)}</nav>
      </ScrollArea>

      <div className="p-3 mt-auto border-t">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  collapsed ? "h-10 w-10 p-0" : "px-3",
                )}
                onClick={async () => {
                  try {
                    const { supabase } = await import("@/lib/supabase");
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  } catch (error) {
                    console.error("Logout error:", error);
                  }
                }}
              >
                <div className="flex items-center">
                  <span
                    className={cn(
                      "flex-shrink-0",
                      collapsed ? "mx-auto" : "mr-2",
                    )}
                  >
                    <LogOut className="h-5 w-5" />
                  </span>
                  {!collapsed && (
                    <span className="flex-grow text-left">Logout</span>
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Sidebar;
