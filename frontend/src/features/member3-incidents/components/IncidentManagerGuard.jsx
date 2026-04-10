import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../member4-auth/Contexts/AuthContext";
import { canManageAllIncidentTickets } from "../utils/incidentAccess";

export default function IncidentManagerGuard({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!canManageAllIncidentTickets(user)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
