import apiCall from "./baseApi";

export const getNotifications = async () => {
    return apiCall.get("/api/notifications");
}