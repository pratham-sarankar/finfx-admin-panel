import type { LoginRequest, LoginResponse, ApiError } from "@/types/auth";
import { getApiUrl, API_CONFIG } from "@/config/api";

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data: LoginResponse = await response.json();
      return data;
    } catch (error) {
      const apiError: ApiError = {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };

      throw apiError;
    }
  }
}
