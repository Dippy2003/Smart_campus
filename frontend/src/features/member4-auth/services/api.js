import axios from "axios";

const API_BASE =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) || "";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // required for session cookies
  headers: { "Content-Type": "application/json" },
});

function toMessage(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const msg =
    data?.message ||
    data?.error ||
    (typeof data === "string" ? data : null) ||
    err?.message ||
    "Something went wrong.";

  if (status === 401) return "Your session expired. Please sign in again.";
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

