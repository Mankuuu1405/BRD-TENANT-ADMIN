import axiosInstance from "../utils/axiosInstance";

export const collectionService = {
  // Get dashboard stats (Total Overdue, NPA count, etc.)
  getStats: () => axiosInstance.get("/lms/collections/stats/"),

  // Get list of overdue loans
  getOverdueQueue: (params) => axiosInstance.get("/lms/collections/queue/", { params }),

  // Log a collection call
  logCall: (loanId, remarks) => axiosInstance.post(`/lms/collections/${loanId}/log-call/`, { remarks }),

  // Send a legal/warning notice
  sendNotice: (loanId, type) => axiosInstance.post(`/lms/collections/${loanId}/send-notice/`, { type }),
};