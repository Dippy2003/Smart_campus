import { createContext, useContext, useEffect, useState } from "react";

const AdminAuthContext = createContext(null);
const ADMIN_STORAGE_KEY = "resource-admin-auth";

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    setIsAdmin(stored === "true");
  }, []);

  const login = (username, password) => {
    // Simple demo credentials — replace with real auth when backend is ready.
    const valid =
      username.trim().toLowerCase() === "admin" && password === "admin123";

    if (!valid) {
      return { success: false, message: "Invalid username or password." };
    }

    setIsAdmin(true);
    window.localStorage.setItem(ADMIN_STORAGE_KEY, "true");
    return { success: true };
  };

  const logout = () => {
    setIsAdmin(false);
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  const value = { isAdmin, login, logout };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return ctx;
}

