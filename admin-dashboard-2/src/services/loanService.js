import axiosInstance from "../utils/axiosInstance";

export const loanAPI = {
  getAll: () => axiosInstance.get("adminpanel/loan-products/"),
  create: (data) => axiosInstance.post("adminpanel/loan-products/", data),
  update: (id, data) => axiosInstance.put(`adminpanel/loan-products/${id}/`, data),
  delete: (id) => axiosInstance.delete(`adminpanel/loan-products/${id}/`),
};
