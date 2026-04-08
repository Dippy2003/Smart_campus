import axios from "axios";

export const api = axios.create({
  // Default to Spring Boot dev server; override via REACT_APP_API_BASE_URL when needed.
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" }
});