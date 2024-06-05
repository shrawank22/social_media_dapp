import axios from 'axios';

const baseUrl = import.meta.env.VITE_REACT_APP_VERIFICATION_SERVER_PUBLIC_URL;

console.log("baseUrl : ", baseUrl);

const apiCall = axios.create({ baseURL: baseUrl, timeout: 30000});

apiCall.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwz-token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiCall;