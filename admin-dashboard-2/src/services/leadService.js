import axiosInstance from "../utils/axiosInstance";

export const leadService = {
  // Get all leads with optional filters
  getAll: (params) => axiosInstance.get("/crm/leads/", { params }),

  // Create a new manual lead
  create: (data) => axiosInstance.post("/crm/leads/", data),

  // Log a call interaction
  logCall: (id, notes) => axiosInstance.post(`/crm/leads/${id}/log-call/`, { notes }),

  // Convert Lead to Borrower (returns new Application ID)
  convert: (id) => axiosInstance.post(`/crm/leads/${id}/convert/`),
  
  // Update status (e.g., mark as 'Interested')
  updateStatus: (id, status) => axiosInstance.patch(`/crm/leads/${id}/`, { status }),
};