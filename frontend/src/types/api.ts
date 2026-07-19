export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiError = {
  success: false;
  requestId?: string;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
