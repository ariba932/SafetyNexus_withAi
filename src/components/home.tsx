import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";
import FormBuilderCanvas from "./form-builder/FormBuilderCanvas";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

interface HomeProps {
  className?: string;
}

const Home: React.FC<HomeProps> = ({ className }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Check if we're on a dashboard page
  const isDashboardRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/form-builder") ||
    location.pathname.startsWith("/inspections") ||
    location.pathname.startsWith("/incidents") ||
    location.pathname.startsWith("/audits") ||
    location.pathname.startsWith("/training") ||
    location.pathname.startsWith("/calendar") ||
    location.pathname.startsWith("/reports") ||
    location.pathname.startsWith("/team") ||
    location.pathname.startsWith("/settings");

  useEffect(() => {
    // Apply dark mode from localStorage or system preference on initial load
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    if (savedDarkMode) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    // Toggle the dark class on the document element
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save preference
    localStorage.setItem("darkMode", String(newDarkMode));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = async () => {
    try {
      // Implement logout functionality using supabase
      const { supabase } = await import("@/lib/supabase");
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Dashboard layout with sidebar and header

  // If we're on a dashboard route, wrap the content in the dashboard layout
  if (isDashboardRoute) {
    return (
      <div className={cn("flex flex-col h-screen bg-background", className)}>
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
        />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />

          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                  </div>
                }
              />
              <Route path="/form-builder" element={<FormBuilderCanvas />} />
              <Route
                path="/inspections"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Inspections</h1>
                  </div>
                }
              />
              <Route
                path="/inspections/templates"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Inspection Templates</h1>
                  </div>
                }
              />
              <Route
                path="/inspections/scheduled"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">
                      Scheduled Inspections
                    </h1>
                  </div>
                }
              />
              <Route
                path="/incidents"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Incidents</h1>
                  </div>
                }
              />
              <Route
                path="/audits"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Audits</h1>
                  </div>
                }
              />
              <Route
                path="/training"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Training</h1>
                  </div>
                }
              />
              <Route
                path="/calendar"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Calendar</h1>
                  </div>
                }
              />
              <Route
                path="/reports"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Reports</h1>
                  </div>
                }
              />
              <Route
                path="/team"
                element={
                  <React.Suspense fallback={<div>Loading...</div>}>
                    {React.createElement(
                      React.lazy(() => import("./team/TeamManagement")),
                    )}
                  </React.Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <React.Suspense fallback={<div>Loading...</div>}>
                    {React.createElement(
                      React.lazy(() => import("./profile/UserProfile")),
                    )}
                  </React.Suspense>
                }
              />
              <Route
                path="/help"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Help & Support</h1>
                  </div>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // For public routes
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/demo"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold">Schedule a Demo</h1>
          </div>
        }
      />
      <Route
        path="/features"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold">Features Page</h1>
          </div>
        }
      />
      <Route
        path="/pricing"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold">Pricing Page</h1>
          </div>
        }
      />
      <Route
        path="/customers"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold">Customers Page</h1>
          </div>
        }
      />
      <Route
        path="/resources"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold">Resources Page</h1>
          </div>
        }
      />
      <Route
        path="/privacy"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
          </div>
        }
      />
      <Route
        path="/terms"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold">Terms of Service</h1>
          </div>
        }
      />
      <Route
        path="/cookies"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold">Cookie Policy</h1>
          </div>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Home;
