import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../member4-auth/Contexts/AuthContext";

/**
 * Allows guests and non-admin roles; redirects ADMIN to the incidents admin area.
 */
export default function NonAdminIncidentGuard({ children, fallback = "/incidents/admin" }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated && user?.role === "ADMIN") {
    return <Navigate to={fallback} replace />;
  }

  return children;
}
