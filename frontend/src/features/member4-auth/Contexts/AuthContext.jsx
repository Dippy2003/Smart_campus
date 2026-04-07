import { createContext, useContext, useEffect, useState } from "react";

/**
 * AuthContext – Member 4 (Module E)
 * Supports roles: USER | ADMIN | TECHNICIAN
 * Provides: user, role, isAdmin, isTechnician, login, logout, register
 */

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "paf-auth-user";

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);   // { id, name, email, role, avatar }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- helpers ---------- */
  const persist = (userData) => {
    setUser(userData);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  };

  /* ---------- EMAIL validation ---------- */
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  /* ---------- REGISTER ---------- */
  const register = ({ name, email, password }) => {
    if (!name.trim())          return { success: false, message: "Full name is required." };
    if (!isValidEmail(email))  return { success: false, message: "Please enter a valid email address." };
    if (password.length < 8)   return { success: false, message: "Password must be at least 8 characters." };
    if (!/[A-Z]/.test(password))     return { success: false, message: "Password must contain at least one uppercase letter." };
    if (!/[0-9]/.test(password))     return { success: false, message: "Password must contain at least one number." };

    // Demo: check if email already "exists" (stored users list)
    const users = JSON.parse(window.localStorage.getItem("paf-users") || "[]");
    if (users.find((u) => u.email === email.trim().toLowerCase())) {
      return { success: false, message: "An account with this email already exists." };
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,          // In real app: never store plain — hash server-side
      role: "USER",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
    };

    users.push(newUser);
    window.localStorage.setItem("paf-users", JSON.stringify(users));

    const { password: _pw, ...safeUser } = newUser;
    persist(safeUser);
    return { success: true };
  };

  /* ---------- LOGIN ---------- */
  const login = ({ email, password }) => {
    if (!isValidEmail(email)) return { success: false, message: "Please enter a valid email address." };
    if (!password)            return { success: false, message: "Password is required." };

    // Demo seed accounts
    const DEMO_ACCOUNTS = [
      { id: 1, name: "Admin User",       email: "admin@paf.com",    password: "Admin123",  role: "ADMIN",      avatar: "" },
      { id: 2, name: "Tech User",        email: "tech@paf.com",     password: "Tech1234",  role: "TECHNICIAN", avatar: "" },
      { id: 3, name: "Student User",     email: "student@paf.com",  password: "Student1",  role: "USER",       avatar: "" },
    ];

    const allUsers = [
      ...DEMO_ACCOUNTS,
      ...JSON.parse(window.localStorage.getItem("paf-users") || "[]"),
    ];

    const found = allUsers.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );

    if (!found) return { success: false, message: "Invalid email or password." };

    const { password: _pw, ...safeUser } = found;
    persist({
      ...safeUser,
      avatar: safeUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(safeUser.name)}`,
    });
    return { success: true, role: found.role };
  };

  /* ---------- FORGOT PASSWORD (demo: just returns token) ---------- */
  const forgotPassword = ({ email }) => {
    if (!isValidEmail(email)) return { success: false, message: "Please enter a valid email address." };

    const DEMO_EMAILS = ["admin@paf.com", "tech@paf.com", "student@paf.com"];
    const users = JSON.parse(window.localStorage.getItem("paf-users") || "[]");
    const allEmails = [...DEMO_EMAILS, ...users.map((u) => u.email)];

    if (!allEmails.includes(email.trim().toLowerCase())) {
      // Security: don't reveal if email exists — always show success
    }

    // Store a mock reset token
    const token = Math.random().toString(36).slice(2) + Date.now();
    window.localStorage.setItem(`paf-reset-${email.trim().toLowerCase()}`, token);
    return { success: true, token }; // In real app: send email
  };

  /* ---------- RESET PASSWORD ---------- */
  const resetPassword = ({ email, token, newPassword }) => {
    if (!isValidEmail(email))   return { success: false, message: "Invalid email." };
    if (newPassword.length < 8) return { success: false, message: "Password must be at least 8 characters." };
    if (!/[A-Z]/.test(newPassword)) return { success: false, message: "Password must contain at least one uppercase letter." };
    if (!/[0-9]/.test(newPassword)) return { success: false, message: "Password must contain at least one number." };

    const stored = window.localStorage.getItem(`paf-reset-${email.trim().toLowerCase()}`);
    if (stored !== token) return { success: false, message: "Invalid or expired reset link." };

    // Update password in stored users
    const users = JSON.parse(window.localStorage.getItem("paf-users") || "[]");
    const idx = users.findIndex((u) => u.email === email.trim().toLowerCase());
    if (idx !== -1) {
      users[idx].password = newPassword;
      window.localStorage.setItem("paf-users", JSON.stringify(users));
    }

    window.localStorage.removeItem(`paf-reset-${email.trim().toLowerCase()}`);
    return { success: true };
  };

  /* ---------- LOGOUT ---------- */
  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  /* ---------- derived ---------- */
  const isAdmin       = user?.role === "ADMIN";
  const isTechnician  = user?.role === "TECHNICIAN";
  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isTechnician,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
