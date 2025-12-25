import axiosInstance from "../utils/axiosInstance";

export const partnerAPI = {
  getAll: async () => {
    const res = await axiosInstance.get("tenants/channel-partners/");
    return res.data;
  },

  create: async (data) => {
    const res = await axiosInstance.post("tenants/channel-partners/", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosInstance.put(`tenants/channel-partners/${id}/`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(`tenants/channel-partners/${id}/`);
    return res.data;
  },
};

export const locationAPI = {
  getCountries: () => axiosInstance.get("locations/countries/").then(res => res.data),
  getStates: (countryName) => axiosInstance.get(`locations/states/?country=${countryName}`).then(res => res.data),
  getCities: (stateName) => axiosInstance.get(`locations/cities/?state=${stateName}`).then(res => res.data),
};