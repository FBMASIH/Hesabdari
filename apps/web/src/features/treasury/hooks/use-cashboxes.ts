'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';

export interface CashboxDto {
  id: string;
  code: string;
  name: string;
  currencyId: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCashboxInput {
  code: string;
  name: string;
  currencyId?: string;
  isActive?: boolean;
  openingBalance?: {
    amount: string;
    date: string;
    description?: string;
  };
}

export const cashboxKeys = {
  all: ['cashboxes'] as const,
  lists: () => [...cashboxKeys.all, 'list'] as const,
  list: (params: CashboxListParams) => [...cashboxKeys.lists(), params] as const,
  detail: (id: string) => [...cashboxKeys.all, 'detail', id] as const,
  search: (q: string) => [...cashboxKeys.all, 'search', q] as const,
};

export interface CashboxListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export function useCashboxes(params: CashboxListParams = {}) {
  return useQuery({
    queryKey: cashboxKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<CashboxDto>>(orgPath('/cashboxes'), toQueryParams(params)),
    staleTime: 5 * 60 * 1000, // MASTER_DATA
  });
}

export function useCashboxSearch(q: string) {
  return useQuery({
    queryKey: cashboxKeys.search(q),
    queryFn: () => apiClient.get<CashboxDto[]>(orgPath('/cashboxes/search'), { q }),
    enabled: q.length >= 1,
    staleTime: 30 * 1000, // SEARCH
  });
}

export function useCreateCashbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCashboxInput) =>
      apiClient.post<CashboxDto>(orgPath('/cashboxes'), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashboxKeys.lists() });
    },
  });
}

export function useDeleteCashbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(orgPath(`/cashboxes/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashboxKeys.lists() });
    },
  });
}
