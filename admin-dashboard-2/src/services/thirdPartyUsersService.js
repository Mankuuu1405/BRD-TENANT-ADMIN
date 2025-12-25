// src/services/userService.js
import axiosInstance from "../utils/axiosInstance";

export const thirdPartyAPI = {
  getAll: async () => {
    const res = await axiosInstance.get("tenants/third-party-users/");
    return res.data;
  },
  create: async (data) => {
    const res = await axiosInstance.post("tenants/third-party-users/", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axiosInstance.put(`tenants/third-party-users/${id}/`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete(`tenants/third-party-users/${id}/`);
    return res.data;
  }
};

export const locationAPI = {
  getCountries: async () => {
    const res = await axiosInstance.get("locations/countries/");
    return res.data;
  },

  getStates: async (countryName) => {
    const res = await axiosInstance.get(`locations/states/?country=${countryName}`);
    return res.data;
  },

  getCities: async (stateName) => {
    const res = await axiosInstance.get(`locations/cities/?state=${stateName}`);
    return res.data;
  }
};