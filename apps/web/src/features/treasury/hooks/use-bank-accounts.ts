'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';

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
  bankId: string;
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

export function useBankAccounts(params: BankAccountListParams = {}) {
  return useQuery({
    queryKey: bankAccountKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<BankAccountDto>>(
        orgPath('/bank-accounts'),
        toQueryParams(params),
      ),
  });
}

export function useBankAccountSearch(q: string) {
  return useQuery({
    queryKey: bankAccountKeys.search(q),
    queryFn: () =>
      apiClient.get<BankAccountDto[]>(orgPath('/bank-accounts/search'), { q }),
    enabled: q.length >= 1,
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
    mutationFn: (id: string) =>
      apiClient.delete(orgPath(`/bank-accounts/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() });
    },
  });
}
