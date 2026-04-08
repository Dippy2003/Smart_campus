import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../../shared/auth/AdminAuthContext";
import CreateTicketPage from "./CreateTicketPage";

export default function IncidentsIndexPage() {
  const { isAdmin } = useAdminAuth();
  if (isAdmin) return <Navigate to="/incidents/admin" replace />;
  return <CreateTicketPage />;
}

