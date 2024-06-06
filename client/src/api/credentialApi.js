import apiCall from "./baseApi";

export const issueCredential = async (data) => {
    console.log("data : ", data);
    return apiCall.post("/api/register", data);
}