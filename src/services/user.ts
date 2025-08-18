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

// Mock data for development mode
const MOCK_USERS = [
  {
    id: "1",
    fullName: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "+1234567890",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    isEmailVerified: true,
    isPhoneVerified: false,
  },
  {
    id: "2", 
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    phoneNumber: "+1234567891",
    createdAt: "2024-01-14T09:20:00Z",
    updatedAt: "2024-01-14T09:20:00Z",
    isEmailVerified: true,
    isPhoneVerified: true,
  },
  {
    id: "3",
    fullName: "Mike Johnson",
    email: "mike.johnson@example.com", 
    phoneNumber: "+1234567892",
    createdAt: "2024-01-13T14:45:00Z",
    updatedAt: "2024-01-13T14:45:00Z",
    isEmailVerified: false,
    isPhoneVerified: true,
  },
];

let mockUsers = [...MOCK_USERS];
let nextId = 4;

export class UserService {
  private static getAuthHeaders() {
    const token = StorageService.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private static async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getUsers(page: number = 1, perPage: number = 10): Promise<UsersApiResponse> {
    try {
      // Try real API first, fall back to mock if in dev mode and API fails
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
      // In development mode, return mock data instead of failing
      if (import.meta.env.DEV) {
        await this.delay(500); // Simulate network delay
        
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedUsers = mockUsers.slice(startIndex, endIndex);
        
        return {
          success: true,
          data: paginatedUsers,
          page,
          perPage,
          totalPages: Math.ceil(mockUsers.length / perPage),
          totalUsers: mockUsers.length,
        };
      }

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
      // In development mode, return mock data
      if (import.meta.env.DEV) {
        await this.delay(300);
        const user = mockUsers.find(u => u.id === id);
        if (!user) {
          throw new Error("User not found");
        }
        return {
          success: true,
          data: user,
        };
      }

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
      // In development mode, create mock user
      if (import.meta.env.DEV) {
        await this.delay(800);
        
        // Check for duplicate email
        if (mockUsers.some(u => u.email === userData.email)) {
          throw new Error("Email already exists");
        }

        const newUser = {
          id: nextId.toString(),
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isEmailVerified: false,
          isPhoneVerified: false,
        };

        mockUsers.push(newUser);
        nextId++;

        return {
          success: true,
          data: newUser,
          message: "User created successfully",
        };
      }

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
      // In development mode, update mock user
      if (import.meta.env.DEV) {
        await this.delay(600);
        
        const userIndex = mockUsers.findIndex(u => u.id === id);
        if (userIndex === -1) {
          throw new Error("User not found");
        }

        // Check for duplicate email (excluding current user)
        if (mockUsers.some(u => u.email === userData.email && u.id !== id)) {
          throw new Error("Email already exists");
        }

        const updatedUser = {
          ...mockUsers[userIndex],
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          updatedAt: new Date().toISOString(),
        };

        mockUsers[userIndex] = updatedUser;

        return {
          success: true,
          data: updatedUser,
          message: "User updated successfully",
        };
      }

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
      // In development mode, delete from mock data
      if (import.meta.env.DEV) {
        await this.delay(400);
        
        const userIndex = mockUsers.findIndex(u => u.id === id);
        if (userIndex === -1) {
          throw new Error("User not found");
        }

        mockUsers.splice(userIndex, 1);

        return {
          success: true,
          message: "User deleted successfully",
        };
      }

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