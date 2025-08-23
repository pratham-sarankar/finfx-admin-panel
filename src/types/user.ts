export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: "active" | "inactive" | "suspended";
  role: "admin" | "user" | "manager" | "support";
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  status: "active" | "inactive" | "suspended";
  role: "admin" | "user" | "manager" | "support";
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  status?: "active" | "inactive" | "suspended";
  role?: "admin" | "user" | "manager" | "support";
}

export interface UsersApiResponse {
  success: boolean;
  data: User[];
  page: number;
  perPage: number;
  totalPages: number;
  totalUsers: number;
}

export interface UserApiResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export interface DeleteMultipleUsersResponse {
  success: boolean;
  message: string;
  data: {
    deletedCount: number;
    requestedCount: number;
    notFoundCount: number;
  };
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}