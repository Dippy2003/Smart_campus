import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext";

export default function AdminRoute({ children }) {
  const { isAdmin } = useAdminAuth();
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}

