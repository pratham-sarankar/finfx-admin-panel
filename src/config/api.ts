export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||     
    "https://finfx-backend-dev.onrender.com/api",
  ENDPOINTS: {
    LOGIN: "/auth/login", 
    USERS: "/users",
    SUBSCRIPTION: "/subscriptions",
  },
} as const;

export const getApiUrl = (endpoint: string) =>
  `${API_CONFIG.BASE_URL}${endpoint}`;
