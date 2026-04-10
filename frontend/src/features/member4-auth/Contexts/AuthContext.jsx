import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMe,
  loginWithPassword,
  logout as apiLogout,
  registerWithPassword,
} from "../services/authService";
import { normalizeApiError } from "../services/api";

/**
 * AuthContext – Member 4 (Module E)
 * Supports roles: USER | ADMIN | TECHNICIAN
 * Provides: user, role, isAdmin, isTechnician, login, logout, register
 */

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "paf-auth-user"; // offline cache only (UI convenience)

const SESSION_EXPIRED_MESSAGE =
  "Your session expired after 30 minutes of inactivity. Please sign in again.";

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // { id, name, email, role, avatar }
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      setLastError({ status: 401, message: SESSION_EXPIRED_MESSAGE });
      const path = window.location.pathname;
      const onLoginPage = path === "/login" || path === "/admin/login";
      if (!onLoginPage) {
        navigate("/login?session=expired", { replace: true });
      }
    };
    window.addEventListener("paf:session-expired", onSessionExpired);
    return () => window.removeEventListener("paf:session-expired", onSessionExpired);
  }, [navigate]);

  useEffect(() => {
    // 1) Warm start from cache (so navbar doesn't flash)
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    // 2) Then ask backend session for truth
    (async () => {
      try {
        const me = await fetchMe();
        // Keep cached user when backend returns empty (helps preserve session UX on reload).
        if (me) {
          persist(me);
        }
      } catch (err) {
        // If backend isn't ready yet, keep cached user but expose error for UI.
        const e = normalizeApiError(err);
        // If session is invalid, clear cached user to prevent false "logged in" UI.
        if (e.status === 401) persist(null);
        setLastError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- helpers ---------- */
  const persist = (userData) => {
    setUser(userData);
    if (userData) window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    else window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  /* ---------- EMAIL validation ---------- */
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  /* ---------- REGISTER ---------- */
  const register = useCallback(async ({ name, email, password }) => {
    if (!name.trim())          return { success: false, message: "Full name is required." };
    if (!isValidEmail(email))  return { success: false, message: "Please enter a valid email address." };
    if (password.length < 8)   return { success: false, message: "Password must be at least 8 characters." };
    if (!/[A-Z]/.test(password))     return { success: false, message: "Password must contain at least one uppercase letter." };
    if (!/[0-9]/.test(password))     return { success: false, message: "Password must contain at least one number." };
    try {
      const created = await registerWithPassword({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      persist(created);
      setLastError(null);
      return { success: true };
    } catch (err) {
      const e = normalizeApiError(err);
      setLastError(e);
      return { success: false, message: e.message };
    }
  }, []);

  /* ---------- LOGIN ---------- */
  const login = useCallback(async ({ email, password }) => {
    if (!isValidEmail(email)) return { success: false, message: "Please enter a valid email address." };
    if (!password)            return { success: false, message: "Password is required." };
    try {
      const me = await loginWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      persist(me);
      setLastError(null);
      return { success: true, role: me?.role };
    } catch (err) {
      const e = normalizeApiError(err);
      setLastError(e);
      return { success: false, message: e.message };
    }
  }, []);

  /* ---------- FORGOT PASSWORD (demo: just returns token) ---------- */
  const forgotPassword = useCallback(({ email }) => {
    // Not implemented server-side yet; keep demo behavior so UI works.
    if (!isValidEmail(email)) return { success: false, message: "Please enter a valid email address." };
    const token = Math.random().toString(36).slice(2) + Date.now();
    window.localStorage.setItem(`paf-reset-${email.trim().toLowerCase()}`, token);
    return { success: true, token };
  }, []);

  /* ---------- RESET PASSWORD ---------- */
  const resetPassword = useCallback(({ email, token, newPassword }) => {
    // Not implemented server-side yet; keep demo behavior so UI works.
    if (!isValidEmail(email))   return { success: false, message: "Invalid email." };
    if (newPassword.length < 8) return { success: false, message: "Password must be at least 8 characters." };
    if (!/[A-Z]/.test(newPassword)) return { success: false, message: "Password must contain at least one uppercase letter." };
    if (!/[0-9]/.test(newPassword)) return { success: false, message: "Password must contain at least one number." };

    const stored = window.localStorage.getItem(`paf-reset-${email.trim().toLowerCase()}`);
    if (stored !== token) return { success: false, message: "Invalid or expired reset link." };

    window.localStorage.removeItem(`paf-reset-${email.trim().toLowerCase()}`);
    return { success: true };
  }, []);

  /* ---------- LOGOUT ---------- */
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      persist(null);
    }
  }, []);

  /* ---------- derived ---------- */
  const isAdmin       = user?.role === "ADMIN";
  const isTechnician  = user?.role === "TECHNICIAN";
  const isAuthenticated = !!user;

  const value = useMemo(() => ({
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
    lastError,
    refresh: async () => {
      try {
        const me = await fetchMe();
        persist(me || null);
        setLastError(null);
        return me;
      } catch (err) {
        const e = normalizeApiError(err);
        setLastError(e);
        throw e;
      }
    },
  }), [user, loading, isAuthenticated, isAdmin, isTechnician, login, logout, register, forgotPassword, resetPassword, lastError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
