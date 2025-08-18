// Development mode bypass for testing UI functionality
// This should be removed in production

import type { LoginResponse } from "@/types/auth";

export const DEV_MODE = import.meta.env.DEV;

export const MOCK_USER: LoginResponse["user"] = {
  id: "dev-user-1",
  fullName: "Development User",
  email: "dev@example.com",
  isEmailVerified: true,
};

export const MOCK_TOKEN = "dev-token-123";

export const MOCK_LOGIN_RESPONSE: LoginResponse = {
  message: "Login successful",
  token: MOCK_TOKEN,
  user: MOCK_USER,
};