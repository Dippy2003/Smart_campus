import { api } from "../../../shared/services/api";

// CRUD
export const getAllResources = () => api.get("/resources");
export const getResourceById = (id) => api.get(`/resource/${id}`);
export const createResource = (data) => api.post("/resource", data);
export const updateResource = (id, data) => api.put(`/resource/${id}`, data);
export const deleteResource = (id) => api.delete(`/resource/${id}`);

// Filters
export const getByType = (type) => api.get(`/resource/type/${type}`);
export const getByStatus = (status) => api.get(`/resource/status/${status}`);
export const getByLocation = (location) => api.get(`/resource/location/${location}`);

// Search
export const searchResources = (keyword) =>
  api.get("/resource/search", { params: { keyword } });