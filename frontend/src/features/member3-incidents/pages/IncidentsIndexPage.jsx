import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../member4-auth/Contexts/AuthContext";
import CreateTicketPage from "./CreateTicketPage";

export default function IncidentsIndexPage() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (isAdmin) return <Navigate to="/incidents/admin" replace />;
  return <CreateTicketPage />;
}
