import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/adminpanel/settings/";

export const settingsService = {

  // -----------------------------
  // GET ALL SETTINGS
  // -----------------------------
  async getSettings() {
    try {
      const res = await axiosInstance.get(`${BASE_URL}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  },

  // -----------------------------
  // GET SINGLE SETTING BY ID
  // -----------------------------
  async getSettingById(id) {
    try {
      const res = await axiosInstance.get(`${BASE_URL}/${id}/`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching setting ${id}:`, error);
      throw error;
    }
  },

  // -----------------------------
  // CREATE NEW SETTING
  // -----------------------------
  async createSetting(payload) {
    try {
      const res = await axiosInstance.post(`${BASE_URL}`, payload);
      return res.data;
    } catch (error) {
      console.error("Error creating setting:", error);
      throw error;
    }
  },

  // -----------------------------
  // UPDATE SETTING
  // -----------------------------
  updateSettings: async (payload) => {
    const res = await axiosInstance.put(BASE_URL, payload);
    return res.data;
  },

  // -----------------------------
  // DELETE SETTING
  // -----------------------------
  async deleteSetting(id) {
    try {
      const res = await axiosInstance.delete(`${BASE_URL}/${id}/`);
      return res.data;
    } catch (error) {
      console.error(`Error deleting setting ${id}:`, error);
      throw error;
    }
  },
};
