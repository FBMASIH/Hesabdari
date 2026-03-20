'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';
import { STALE_TIME } from '@/shared/config/query-config';

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
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useCashboxes(
  params: CashboxListParams = {},
  initialData?: PaginatedResponse<CashboxDto>,
) {
  return useQuery({
    queryKey: cashboxKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<CashboxDto>>(orgPath('/cashboxes'), toQueryParams(params)),
    staleTime: STALE_TIME.MASTER_DATA,
    initialData,
  });
}

export function useCashboxSearch(q: string) {
  return useQuery({
    queryKey: cashboxKeys.search(q),
    queryFn: () => apiClient.get<CashboxDto[]>(orgPath('/cashboxes/search'), { q }),
    enabled: q.length >= 1,
    staleTime: STALE_TIME.SEARCH,
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: cashboxKeys.lists() });
      const snapshots = queryClient.getQueriesData<PaginatedResponse<CashboxDto>>({
        queryKey: cashboxKeys.lists(),
      });
      queryClient.setQueriesData<PaginatedResponse<CashboxDto>>(
        { queryKey: cashboxKeys.lists() },
        (old) =>
          old ? { ...old, data: old.data.filter((c) => c.id !== id), total: old.total - 1 } : old,
      );
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cashboxKeys.lists() });
    },
  });
}
