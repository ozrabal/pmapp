import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { createClient } from "@/lib/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const supabase = createClient();

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!error && session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }

      return config;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error getting auth token:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  async (error) => {
    // Any status codes that fall outside the range of 2xx cause this function to trigger
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the session
        const supabase = createClient();
        const {
          data: { session },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (!refreshError && session?.access_token) {
          // Update the authorization header and retry the request
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient(originalRequest);
        } else {
          // Refresh failed, redirect to login or handle as needed
          // eslint-disable-next-line no-console
          console.error("Session refresh failed:", refreshError);
          // You might want to redirect to login here
          // window.location.href = '/login';
        }
      } catch (refreshError) {
        // eslint-disable-next-line no-console
        console.error("Error refreshing session:", refreshError);
      }
    }

    // Handle other error types
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // eslint-disable-next-line no-console
      console.error("API Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // The request was made but no response was received
      // eslint-disable-next-line no-console
      console.error("Network Error:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      // eslint-disable-next-line no-console
      console.error("Request Setup Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Enhanced API client with additional helper methods
interface ApiClient extends AxiosInstance {
  // Additional utility methods
  setAuthToken: (token: string | null) => void;
  clearAuthToken: () => void;
  isAuthenticated: () => Promise<boolean>;
}

// Extend the apiClient with additional methods
const enhancedApiClient = apiClient as ApiClient;

// Set auth token manually (useful for testing or special cases)
enhancedApiClient.setAuthToken = (token: string | null) => {
  if (token) {
    enhancedApiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete enhancedApiClient.defaults.headers.common.Authorization;
  }
};

// Clear auth token
enhancedApiClient.clearAuthToken = () => {
  delete enhancedApiClient.defaults.headers.common.Authorization;
};

// Check if user is authenticated
enhancedApiClient.isAuthenticated = async (): Promise<boolean> => {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session?.access_token;
  } catch {
    return false;
  }
};

export default enhancedApiClient;

// Export type for TypeScript users
export type { ApiClient };
