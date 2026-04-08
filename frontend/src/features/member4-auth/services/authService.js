import { api } from "./api";

export async function fetchMe() {
  const res = await api.get("/api/auth/me");
  return res.data;
}

export async function loginWithPassword({ email, password }) {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data;
}

export async function registerWithPassword({ name, email, password }) {
  const res = await api.post("/api/auth/register", { name, email, password });
  return res.data;
}

export async function logout() {
  const res = await api.post("/api/auth/logout");
  return res.data;
}

export function getGoogleLoginUrl() {
  const base =
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
    "http://localhost:8080";
  // Spring Security default OAuth2 login endpoint
  return `${base}/oauth2/authorization/google`;
}

export async function isGoogleAuthEnabled() {
  const res = await api.get("/api/auth/google/enabled");
  return Boolean(res.data?.enabled);
}

