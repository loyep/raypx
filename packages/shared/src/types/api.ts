export type UserRole = "admin" | "user" | "superadmin";

export type StatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500;

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
