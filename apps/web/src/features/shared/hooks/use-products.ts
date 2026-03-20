'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';
import { STALE_TIME } from '@/shared/config/query-config';

export interface ProductDto {
  id: string;
  code: string;
  name: string;
  barcode: string | null;
  countingUnit: string;
  isActive: boolean;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
};

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductDto>>(orgPath('/products'), toQueryParams(params)),
    staleTime: STALE_TIME.MASTER_DATA,
  });
}
