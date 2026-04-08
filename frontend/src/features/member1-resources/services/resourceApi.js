import { api } from "../../../shared/services/api";

// CRUD — all under /resources (REST plural)
export const getAllResources = () => api.get("/resources");
export const getResourceById = (id) => api.get(`/resources/${id}`);
export const createResource = (data) => api.post("/resources", data);
export const updateResource = (id, data) => api.put(`/resources/${id}`, data);
export const deleteResource = (id) => api.delete(`/resources/${id}`);

// Filters
export const getByType = (type) => api.get(`/resources/type/${type}`);
export const getByStatus = (status) => api.get(`/resources/status/${status}`);
export const getByLocation = (location) => api.get(`/resources/location/${location}`);

// Search
export const searchResources = (keyword) =>
  api.get("/resources/search", { params: { keyword } });
