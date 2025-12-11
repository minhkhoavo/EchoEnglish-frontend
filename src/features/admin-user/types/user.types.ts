export const Gender = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  gender?: string;
  dob?: string;
  phoneNumber?: string;
  address?: string;
  image?: string;
  credits: number;
  isDeleted: boolean;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt?: string;
}

export interface UserFilters {
  search?: string;
  includeDeleted?: string; // 'true' = only deleted, undefined/empty = only active
  gender?: string;
  limit?: number;
  sortBy?: string;
  page?: number;
  isActive?: boolean;
  sortOrder?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  deletedUsers: number;
  totalCredits: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserResponse {
  users: User[];
  pagination: PaginationInfo;
  stats?: UserStats;
}
