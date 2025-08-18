import type { 
  CreateUserRequest, 
  UpdateUserRequest, 
  UsersApiResponse, 
  UserApiResponse, 
  DeleteUserResponse,
  ApiError 
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

  static async getUsers(page: number = 1, perPage: number = 10): Promise<UsersApiResponse> {
    try {
      const response = await fetch(
        `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}?n=${perPage}&p=${page}`,
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
          error instanceof Error
            ? error.message
            : "Failed to fetch users",
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
          error instanceof Error
            ? error.message
            : "Failed to fetch user",
      };
      throw apiError;
    }
  }

  static async createUser(userData: CreateUserRequest): Promise<UserApiResponse> {
    try {
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.USERS),
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      const apiError: ApiError = {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create user",
      };
      throw apiError;
    }
  }

  static async updateUser(id: string, userData: UpdateUserRequest): Promise<UserApiResponse> {
    try {
      const response = await fetch(
        `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${id}`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      const apiError: ApiError = {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update user",
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
          error instanceof Error
            ? error.message
            : "Failed to delete user",
      };
      throw apiError;
    }
  }

  static async deleteMultipleUsers(ids: string[]): Promise<void> {
    const errors: string[] = [];
    
    for (const id of ids) {
      try {
        await this.deleteUser(id);
      } catch (error) {
        errors.push(`Failed to delete user ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
}