import axiosInstance from "../utils/axiosInstance";

export const riskAPI = {
    // Scorecard Rules
    getScorecardRules: (type) => axiosInstance.get(`risk/scorecards/?type=${type}`),
    createScorecardRule: (data) => axiosInstance.post('risk/scorecards/', data),
    deleteScorecardRule: (id) => axiosInstance.delete(`risk/scorecards/${id}/`),

    // Geo-Fencing Zones
    getBlockedZones: () => axiosInstance.get('risk/geo-zones/'),
    createBlockedZone: (data) => axiosInstance.post('risk/geo-zones/', data),
    deleteBlockedZone: (id) => axiosInstance.delete(`risk/geo-zones/${id}/`),
};