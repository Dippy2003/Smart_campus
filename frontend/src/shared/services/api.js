import axios from "axios";

export const api = axios.create({
  // Use CRA dev-proxy by default (baseURL: "") to avoid CORS during development.
  // Override with REACT_APP_API_BASE_URL if needed (e.g., production).
  baseURL: process.env.REACT_APP_API_BASE_URL || "",
  headers: { "Content-Type": "application/json" }
});