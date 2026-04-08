import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * AdminAuthContext – lightweight admin flag for UI gating.
 *
 * The project now primarily authenticates via member 4 auth (`paf-auth-user` in localStorage).
 * This context reads that value to decide `isAdmin`, so we don't need a separate provider.
 */

const AdminAuthContext = createContext(null);
const AUTH_STORAGE_KEY = "paf-auth-user";

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      const user = raw ? JSON.parse(raw) : null;
      setIsAdmin(user?.role === "ADMIN");
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // Keep the API shape so existing code doesn't break.
  const login = () => ({ success: false, message: "Admin login handled by member4 auth." });
  const logout = () => ({ success: true });

  const value = useMemo(() => ({ isAdmin, login, logout }), [isAdmin]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}

