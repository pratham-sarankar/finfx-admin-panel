import type {
  CreateUserRequest,
  UpdateUserRequest,
  UsersApiResponse,
  UserApiResponse,
  DeleteUserResponse,
  DeleteMultipleUsersResponse,
  ApiError,
} from "@/types/user";
import { getApiUrl, API_CONFIG } from "@/config/api";
import { StorageService } from "@/lib/storage";

export class UserService {
  private static getAuthHeaders() {
    const token = StorageService.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async getUsers(
    page: number = 1,
    perPage: number = 10,
    query?: string
  ): Promise<UsersApiResponse> {
    try {
      const searchParams = new URLSearchParams({
        n: perPage.toString(),
        p: page.toString(),
      });

      if (query && query.trim()) {
        // Support multiple possible backend query keys
        const q = query.trim();
        searchParams.append("q", q);
        searchParams.append("search", q);
      }

      const response = await fetch(
        `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}?${searchParams.toString()}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const raw = await response.json();

      // Normalize various shapes to UsersApiResponse
      const data = raw.data || raw.users || [];
      const totalPages =
        raw.totalPages ??
        (raw.totalUsers ? Math.ceil(raw.totalUsers / (perPage || 10)) : 1);
      const totalUsers = raw.totalUsers ?? raw.totalItems ?? data.length;

      const normalized: UsersApiResponse = {
        success: raw.success !== undefined ? !!raw.success : true,
        data,
        page: raw.page ?? page,
        perPage: raw.perPage ?? perPage,
        totalPages,
        totalUsers,
      };

      return normalized;
    } catch (error) {
      const apiError: ApiError = {
        message:
          error instanceof Error ? error.message : "Failed to fetch users",
      };
      throw apiError;
    }
  }

  static async getUserById(id: string): Promise<UserApiResponse> {
    try {
      const response = await fetch(
        `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${id}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      const apiError: ApiError = {
        message:
          error instanceof Error ? error.message : "Failed to fetch user",
      };
      throw apiError;
    }
  }

  static async createUser(
    userData: CreateUserRequest
  ): Promise<UserApiResponse> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.USERS), {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      // Check if the backend indicates the operation was successful
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create user");
      }

      return result;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.message || "Failed to create user",
      };
      throw apiError;
    }
  }

  static async updateUser(
    id: string,
    userData: UpdateUserRequest
  ): Promise<UserApiResponse> {
    try {
      const response = await fetch(
        `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${id}`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(userData),
        }
      );

      const result = await response.json();

      // Check if the backend indicates the operation was successful
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update user");
      }

      return result;
    } catch (error) {
      const apiError: ApiError = {
        message:
          error instanceof Error ? error.message : "Failed to update user",
      };
      throw apiError;
    }
  }

  static async deleteUser(id: string): Promise<DeleteUserResponse> {
    try {
      const response = await fetch(
        `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${id}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      const apiError: ApiError = {
        message:
          error instanceof Error ? error.message : "Failed to delete user",
      };
      throw apiError;
    }
  }

  static async deleteMultipleUsers(
    ids: string[]
  ): Promise<DeleteMultipleUsersResponse> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.USERS), {
        method: "DELETE",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userIds: ids }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      const apiError: ApiError = {
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete multiple users",
      };
      throw apiError;
    }
  }
}
