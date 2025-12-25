import axiosInstance from "../utils/axiosInstance";

export const mandateAPI = {
  getAll: async () => {
    const res = await axiosInstance.get("banking/mandates/");
    return res.data;
  },

  verifyPennyDrop: async (id) => {
    const res = await axiosInstance.post(`banking/mandates/${id}/penny-drop/`);
    return res.data;
  },

  registerEnach: async (id) => {
    const res = await axiosInstance.post(`banking/mandates/${id}/register-enach/`);
    return res.data;
  }
};