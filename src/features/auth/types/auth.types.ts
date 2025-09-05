// Auth-related TypeScript interfaces and types

export interface User {
  _id: string;
  fullName: string;
  gender: string;
  dob?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  image?: string;
  roles:
    | string[]
    | {
        _id: string;
        name: string;
        description: string;
        permissions: { _id: string; name: string; description: string }[];
      }[];
  isDeleted: boolean;
  createdAt?: string;
  updateAt?: string;
  __v?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    token: string;
    authenticated: boolean;
  };
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phoneNumber?: string;
  address?: string;
}

export interface RegisterResponse {
  message: string;
  data: User;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ProfileResponse {
  message: string;
  data: User;
}

export interface UpdateProfileRequest {
  fullName?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  phoneNumber?: string;
  address?: string;
  image?: string;
}

export interface UpdateProfileResponse {
  message: string;
  data: User;
}

// Auth slice state types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Form validation types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phoneNumber?: string;
  address?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface VerifyOtpFormData {
  otp: string;
}

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  image?: string;
}
