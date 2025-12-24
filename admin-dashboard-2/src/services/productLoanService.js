// src/services/productLoanService.js
import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "adminpanel/loan-products/";
const TENANT_URL = "tenants/"; // Adjust based on your backend route structure

export const productLoanAPI = {
  // --- Core Product Operations ---
  getAll() {
    return axiosInstance.get(TENANT_URL + "products/");
  },
  getById(id) {
    return axiosInstance.get(TENANT_URL + `products/${id}/`);
  },
  create(data) {
    return axiosInstance.post(TENANT_URL + "products/", data);
  },
  update(id, data) {
    return axiosInstance.patch(TENANT_URL + `products/${id}/`, data); // Changed to PATCH
  },
  delete(id) {
    return axiosInstance.delete(TENANT_URL + `products/${id}/`);
  },

  // --- Sub-Configuration Operations ---
  
  // Interest Rules
  createInterestConfig(data) {
    return axiosInstance.post(TENANT_URL + "interest-configs/", data);
  },

  // Repayment Schedules
  createRepaymentConfig(data) {
    return axiosInstance.post(TENANT_URL + "repayment-configs/", data);
  },

  // Risk & Eligibility
  createRiskConfig(data) {
    return axiosInstance.post(TENANT_URL + "risk-rules/", data);
  },

  // Fees & Charges
  createChargeConfig(data) {
    return axiosInstance.post(TENANT_URL + "charge-configs/", data);
  }
};