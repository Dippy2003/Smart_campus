import axios from "axios";

export const api = axios.create({
  // Default to Spring Boot dev server; override via REACT_APP_API_BASE_URL when needed.
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

function shouldIgnore401SessionBroadcast(config) {
  const url = String(config?.url || "");
  return url.includes("/api/auth/login") || url.includes("/api/auth/register");
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