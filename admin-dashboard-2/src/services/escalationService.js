import axiosInstance from "../utils/axiosInstance";

export const escalationAPI = {
  getAll: async () => {
    const res = await axiosInstance.get("escalations/rules/");
    return res.data;
  },

  create: async (ruleData) => {
    const res = await axiosInstance.post("escalations/rules/", ruleData);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(`escalations/rules/${id}/`);
    return res.data;
  }
};