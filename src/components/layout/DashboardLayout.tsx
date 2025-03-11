import React from "react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  className,
  isDarkMode,
  onToggleTheme,
  onLogout,
  sidebarCollapsed,
  onToggleSidebar,
}) => {
  return (
    <div className={cn("flex flex-col h-screen bg-background", className)}>
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
        />

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
