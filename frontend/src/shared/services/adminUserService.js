import { api } from "../../features/member4-auth/services/api";

export const adminUserService = {
  async createUser(payload) {
    try {
      const res = await api.post("/api/admin/users", payload);
      return res.data;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create user.";
      throw new Error(msg);
    }
  },

  async getAllUsers() {
    try {
      const res = await api.get("/api/admin/users");
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to fetch users.";
      throw new Error(msg);
    }
  },

  async updateUser(id, payload) {
    try {
      const res = await api.put(`/api/admin/users/${id}`, payload);
      return res.data;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update user.";
      throw new Error(msg);
    }
  },

  async deleteUser(id) {
    try {
      await api.delete(`/api/admin/users/${id}`);
      return true;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to delete user.";
      throw new Error(msg);
    }
  },
};

