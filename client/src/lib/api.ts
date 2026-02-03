import axios from 'axios';
import Cookies from 'js-cookie';

// Use environment variable with fallback for local development
// NEXT_PUBLIC_ prefix is required for Next.js client-side env vars
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
