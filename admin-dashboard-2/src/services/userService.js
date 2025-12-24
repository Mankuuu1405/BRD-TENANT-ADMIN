import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "users/users/";

export const userAPI = {
  // GET ALL USERS
  async getAll() {
    return axiosInstance.get(BASE_URL);
  },

  // CREATE USER
  async create(data) {
    return axiosInstance.post(BASE_URL, data);
  },

  // UPDATE USER
  async update(id, data) {
    return axiosInstance.put(`${BASE_URL}${id}/`, data);
  },

  // DELETE USER
  async delete(id) {
    return axiosInstance.delete(`${BASE_URL}${id}/`);
  }
};
