import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PublicRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export function PublicRoute({
  children,
  fallbackPath = "/dashboard",
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Render public content if not authenticated
  return <>{children}</>;
}
