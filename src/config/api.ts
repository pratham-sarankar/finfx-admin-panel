export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  ENDPOINTS: {
    LOGIN: "/auth/login",
    USERS: "/users",
    SUBSCRIPTION: "/subscriptions",
  },
} as const;
 
export const getApiUrl = (endpoint: string) =>
  `${API_CONFIG.BASE_URL}${endpoint}`;
