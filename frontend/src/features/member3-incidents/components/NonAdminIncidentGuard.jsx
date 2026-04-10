import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../member4-auth/Contexts/AuthContext";
import { canManageAllIncidentTickets } from "../utils/incidentAccess";

/**
 * Allows guests and normal users; redirects TECHNICIAN to the ticket console (they do not use the requester flows).
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

  if (isAuthenticated && String(user?.role || "").trim().toUpperCase() === "TECHNICIAN") {
    const target = canManageAllIncidentTickets(user) ? fallback : "/incidents/technician";
    return <Navigate to={target} replace />;
  }

  return children;
}
