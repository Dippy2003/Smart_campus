import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

/**
 * RoleGuard – restricts a route to specific roles.
 *
 * Props:
 * roles    – array of allowed roles, e.g. ["ADMIN", "TECHNICIAN"]
 * fallback – optional redirect path (default: "/unauthorized")
 *
 * Usage:
 * <RoleGuard roles={["ADMIN"]}>
 * <AdminDashboard />
 * </RoleGuard>
 */
export default function RoleGuard({ children, roles = [], fallback = "/unauthorized" }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. Handle the loading state from AuthContext
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  // 2. If the user isn't logged in at all, send them to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // 3. If the user is logged in but has the wrong role, send them to unauthorized
  const normalizedUserRole = String(user?.role || "").trim().toUpperCase();
  const normalizedAllowedRoles = roles.map((r) =>
    String(r || "").trim().toUpperCase()
  );
  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to={fallback} replace />;
  }

  // 4. Everything is fine, render the protected component
  return children;
}