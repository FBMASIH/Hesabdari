/** Standard paginated list response shape */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/** Cursor-based pagination response */
export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
    total?: number;
  };
}

/** Standard API error response shape */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Sort parameter */
export interface SortParam {
  field: string;
  direction: SortDirection;
}

/** Standard query parameters for list endpoints */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  sort?: SortParam[];
  search?: string;
}
