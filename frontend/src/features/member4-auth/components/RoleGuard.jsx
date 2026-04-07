import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * RoleGuard – restricts a route to specific roles.
 *
 * Props:
 *   roles  – array of allowed roles, e.g. ["ADMIN", "TECHNICIAN"]
 *   fallback – optional redirect path (default: "/unauthorized")
 *
 * Usage:
 *   <RoleGuard roles={["ADMIN"]}>
 *     <AdminDashboard />
 *   </RoleGuard>
 */
export default function RoleGuard({ children, roles = [], fallback = "/unauthorized" }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}
