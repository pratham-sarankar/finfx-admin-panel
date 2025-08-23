export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    isEmailVerified: boolean;
    role: string;
  };
}

export interface ApiError {
  message: string;
  status?: number;
}
