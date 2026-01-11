import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import keycloak, { refreshToken } from '@/features/auth/services/keycloak';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_GATEWAY_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor - Add JWT token
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        if (keycloak.authenticated) {
            // Refresh token if needed (will refresh if token expires in < 30 seconds)
            await refreshToken();
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle 401 - Unauthorized
        if (error.response?.status === 401 && originalRequest) {
            try {
                const refreshed = await refreshToken();
                if (refreshed) {
                    originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
                    return api.request(originalRequest);
                }
            } catch {
                // Refresh failed, redirect to login
                keycloak.login();
            }
        }

        return Promise.reject(error);
    }
);

export default api;
