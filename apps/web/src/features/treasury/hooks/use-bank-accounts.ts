'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';
import { STALE_TIME } from '@/shared/config/query-config';

export interface BankAccountDto {
  id: string;
  code: string;
  name: string;
  accountNumber: string;
  bankId: string;
  branch: string;
  currencyId: string;
  isActive: boolean;
  bank: { id: string; name: string };
  createdAt: string;
}

export interface CreateBankAccountInput {
  code: string;
  name: string;
  accountNumber: string;
  bankId?: string;
  branch?: string;
  currencyId?: string;
  isActive?: boolean;
  openingBalance?: {
    amount: string;
    date: string;
    description?: string;
  };
}

export const bankAccountKeys = {
  all: ['bankAccounts'] as const,
  lists: () => [...bankAccountKeys.all, 'list'] as const,
  list: (params: BankAccountListParams) => [...bankAccountKeys.lists(), params] as const,
  detail: (id: string) => [...bankAccountKeys.all, 'detail', id] as const,
  search: (q: string) => [...bankAccountKeys.all, 'search', q] as const,
};

export interface BankAccountListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export function useBankAccounts(
  params: BankAccountListParams = {},
  initialData?: PaginatedResponse<BankAccountDto>,
) {
  return useQuery({
    queryKey: bankAccountKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<BankAccountDto>>(
        orgPath('/bank-accounts'),
        toQueryParams(params),
      ),
    staleTime: STALE_TIME.MASTER_DATA,
    initialData,
  });
}

export function useBankAccountSearch(q: string) {
  return useQuery({
    queryKey: bankAccountKeys.search(q),
    queryFn: () => apiClient.get<BankAccountDto[]>(orgPath('/bank-accounts/search'), { q }),
    enabled: q.length >= 1,
    staleTime: STALE_TIME.SEARCH,
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBankAccountInput) =>
      apiClient.post<BankAccountDto>(orgPath('/bank-accounts'), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() });
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(orgPath(`/bank-accounts/${id}`)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: bankAccountKeys.lists() });
      const snapshots = queryClient.getQueriesData<PaginatedResponse<BankAccountDto>>({
        queryKey: bankAccountKeys.lists(),
      });
      queryClient.setQueriesData<PaginatedResponse<BankAccountDto>>(
        { queryKey: bankAccountKeys.lists() },
        (old) =>
          old ? { ...old, data: old.data.filter((c) => c.id !== id), total: old.total - 1 } : old,
      );
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Banks (system-wide master data)                                    */
/* ------------------------------------------------------------------ */

export interface BankDto {
  id: string;
  code: string;
  name: string;
}

export const bankKeys = {
  all: ['banks'] as const,
};

export function useBanks() {
  return useQuery({
    queryKey: bankKeys.all,
    queryFn: () => apiClient.get<BankDto[]>('/api/v1/banks'),
    staleTime: STALE_TIME.MASTER_DATA,
  });
}
