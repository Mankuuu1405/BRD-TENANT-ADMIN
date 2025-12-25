import axiosInstance from "../utils/axiosInstance";

export const disbursementAPI = {
  getQueue: async () => {
    const res = await axiosInstance.get("finance/disbursement-queue/");
    return res.data;
  },

  disburse: async (loanId) => {
    const res = await axiosInstance.post(`finance/disburse/${loanId}/`);
    return res.data;
  }
};