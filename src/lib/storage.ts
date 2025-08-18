import type { LoginResponse } from "@/types/auth";

const STORAGE_KEYS = {
  AUTH_TOKEN: "finfx_auth_token",
  USER_DATA: "finfx_user_data",
} as const;

// Basic encryption/decryption (in production, use proper crypto libraries)
const encrypt = (data: string): string => {
  return btoa(encodeURIComponent(data));
};

const decrypt = (encryptedData: string): string => {
  try {
    return decodeURIComponent(atob(encryptedData));
  } catch {
    return "";
  }
};

export const StorageService = {
  // Token management
  setToken: (token: string): void => {
    try {
      const encryptedToken = encrypt(token);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, encryptedToken);
    } catch (error) {
      console.error("Failed to store token:", error);
    }
  },

  getToken: (): string | null => {
    try {
      const encryptedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!encryptedToken) return null;
      return decrypt(encryptedToken);
    } catch (error) {
      console.error("Failed to retrieve token:", error);
      return null;
    }
  },

  removeToken: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  },

  // User data management
  setUserData: (userData: LoginResponse["user"]): void => {
    try {
      const encryptedUserData = encrypt(JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.USER_DATA, encryptedUserData);
    } catch (error) {
      console.error("Failed to store user data:", error);
    }
  },

  getUserData: (): LoginResponse["user"] | null => {
    try {
      const encryptedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!encryptedUserData) return null;
      const decryptedData = decrypt(encryptedUserData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error("Failed to retrieve user data:", error);
      return null;
    }
  },

  removeUserData: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error("Failed to remove user data:", error);
    }
  },

  // Clear all auth data
  clearAuth: (): void => {
    StorageService.removeToken();
    StorageService.removeUserData();
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!StorageService.getToken();
  },
};
