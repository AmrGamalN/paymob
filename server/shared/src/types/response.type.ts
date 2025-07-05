export type ResponseOptions<T = any> = {
  statusText?: string;
  success?: boolean;
  status?: number;
  message?: string;
  error?: any;
  data?: any;
  count?: number;
  accessToken?: string;
  refreshToken?: string;
  tempToken?: string;
  userId?: string;
  deletedCount?: number;
  updatedCount?: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    totalMatched: number;
    remainPages: number;
    itemsPerPage: number;
  };
};

export type ResponseType =
  | 'Created'
  | 'OK'
  | 'BadRequest'
  | 'NotFound'
  | 'Conflict'
  | 'Unauthorized'
  | 'Forbidden'
  | 'InternalServerError';
