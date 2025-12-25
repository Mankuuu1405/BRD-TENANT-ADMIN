import axiosInstance from "../utils/axiosInstance";

export const collectionAPI = {

  getOverdueLoans: async () => {
    const res = await axiosInstance.get("collections/overdue-loans/");
    return res.data;
  },

  getCollectionStats: async () => {
    const res = await axiosInstance.get("collections/stats/");
    return res.data;
  },

  triggerNotice: async (loanId) => {
    const res = await axiosInstance.post(`collections/send-notice/${loanId}/`);
    return res.data;
  }
};