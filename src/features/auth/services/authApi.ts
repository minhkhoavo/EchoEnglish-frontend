import { api } from '@/core/api/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../types/auth.types';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Login user
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
    }),

    // Register user
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        data: userData,
      }),
    }),

    // Verify registration OTP
    verifyRegisterOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (otpData) => ({
        url: '/auth/verify-register-otp',
        method: 'POST',
        data: otpData,
      }),
    }),

    // Forgot password
    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: (emailData) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        data: emailData,
      }),
    }),

    // Reset password
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (resetData) => ({
        url: '/auth/reset-password',
        method: 'POST',
        data: resetData,
      }),
    }),

    // Get user profile
    getProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: '/auth/myInfo',
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),

    // Update user profile
    updateProfile: builder.mutation<
      UpdateProfileResponse,
      UpdateProfileRequest
    >({
      query: (profileData) => ({
        url: '/auth/myInfo',
        method: 'POST',
        data: profileData,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyRegisterOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
