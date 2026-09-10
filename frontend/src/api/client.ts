import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cinescope_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // If request was canceled via AbortController, rethrow as canceled
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    let friendlyMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const data = error.response.data;
      if (data && data.message) {
        friendlyMessage = data.message;
      } else if (error.response.status === 401) {
        friendlyMessage = 'Your session has expired. Please log in again.';
      } else if (error.response.status === 404) {
        friendlyMessage = 'The requested resource was not found.';
      } else if (error.response.status === 429) {
        friendlyMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.response.status >= 500) {
        friendlyMessage = 'Movie service is temporarily unavailable. Please try again shortly.';
      }
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      friendlyMessage = 'Movies are taking longer than usual to load. Please check your connection and retry.';
    } else if (!navigator.onLine) {
      friendlyMessage = 'You appear to be offline. Please check your internet connection.';
    }

    const customError = new Error(friendlyMessage);
    (customError as any).status = error.response?.status;
    (customError as any).originalError = error;

    return Promise.reject(customError);
  }
);
