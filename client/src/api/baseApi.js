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

        config.headers['ngrok-skip-browser-warning'] = 1;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiCall.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
)

export default apiCall;