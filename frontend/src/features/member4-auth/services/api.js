import axios from "axios";

function normalizeApiBase(raw) {
  const value = String(raw || "").trim();
  if (!value) return "http://localhost:8080";
  if (value.startsWith(":")) return `http://localhost${value}`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `http://${value}`;
}

const API_BASE = normalizeApiBase(
  typeof process !== "undefined" && process.env ? process.env.REACT_APP_API_BASE_URL : ""
);

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // required for session cookies
  headers: { "Content-Type": "application/json" },
});

function shouldIgnore401SessionBroadcast(config) {
  const url = String(config?.url || "");
  return (
    url.includes("/api/auth/login") ||
    url.includes("/api/auth/register")
  );
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const cfg = error?.config;
    if (status === 401 && cfg && !shouldIgnore401SessionBroadcast(cfg)) {
      window.dispatchEvent(new CustomEvent("paf:session-expired"));
    }
    return Promise.reject(error);
  }
);

function toMessage(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const msg =
    data?.message ||
    data?.error ||
    (typeof data === "string" ? data : null) ||
    err?.message ||
    "Something went wrong.";

  if (status === 401) {
    return "Your session expired after 30 minutes of inactivity. Please sign in again.";
  }
  if (status === 403) return "You don’t have permission to access this.";
  return msg;
}

export function normalizeApiError(err) {
  return {
    status: err?.response?.status ?? null,
    message: toMessage(err),
    raw: err,
  };
}

