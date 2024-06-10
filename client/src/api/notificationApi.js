import apiCall from "./baseApi";

export const getNotifications = async (state) => {
    return apiCall.get(`/api/notifications?userAddress=${state.address}`);
}