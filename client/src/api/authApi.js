import apiCall from "./baseApi";

export const logoutUser = async () => {
    return apiCall.post("/api/logout");
}