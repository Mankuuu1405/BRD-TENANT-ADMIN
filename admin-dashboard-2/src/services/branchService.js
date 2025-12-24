import axiosInstance from "../utils/axiosInstance";

export const branchAPI = {
  // GET all branches
  getAll: async () => {
    const res = await axiosInstance.get("tenants/branches/");
    return res.data;
  },

  // GET branch by ID
  getById: async (id) => {
    const res = await axiosInstance.get(`tenants/branches/${id}/`);
    return res.data;
  },

  // CREATE branch
  create: async (data) => {
    const res = await axiosInstance.post("tenants/branches/", data);
    return res.data;
  },

  // UPDATE branch
  update: async (id, data) => {
    const res = await axiosInstance.put(`tenants/branches/${id}/`, data);
    return res.data;
  },

  // DELETE branch
  delete: async (id) => {
    const res = await axiosInstance.delete(`tenants/branches/${id}/`);
    return res.data;
  },
};
