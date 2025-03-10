import React from "react";
import { Link } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import { Shield } from "lucide-react";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-background border-b py-4">
        <div className="container mx-auto px-4">
          <Link to="/" className="flex items-center">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-xl">SafetyNexus</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()} SafetyNexus. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage;
