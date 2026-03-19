'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';

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
    staleTime: 5 * 60 * 1000, // MASTER_DATA
  });
}
