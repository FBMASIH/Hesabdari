'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';

export type PaidChequeStatus = 'OPEN' | 'CLEARED' | 'RETURNED' | 'CANCELLED';

export interface PaidChequeDto {
  id: string;
  chequeNumber: string;
  sayadiNumber: string | null;
  amount: string;
  date: string;
  dueDate: string;
  description: string | null;
  status: PaidChequeStatus;
  vendor: { id: string; name: string } | null;
  bankAccount: { id: string; name: string };
  createdAt: string;
}

export interface CreatePaidChequeInput {
  chequeNumber: string;
  sayadiNumber?: string;
  vendorId?: string;
  bankAccountId: string;
  currencyId?: string;
  amount: string;
  date: string;
  dueDate: string;
  description?: string;
}

export const paidChequeKeys = {
  all: ['paidCheques'] as const,
  lists: () => [...paidChequeKeys.all, 'list'] as const,
  list: (params: PaidChequeListParams) => [...paidChequeKeys.lists(), params] as const,
  detail: (id: string) => [...paidChequeKeys.all, 'detail', id] as const,
};

export interface PaidChequeListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: PaidChequeStatus;
}

export function usePaidCheques(params: PaidChequeListParams = {}) {
  return useQuery({
    queryKey: paidChequeKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<PaidChequeDto>>(
        orgPath('/paid-cheques'),
        toQueryParams(params),
      ),
  });
}

export function useCreatePaidCheque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaidChequeInput) =>
      apiClient.post<PaidChequeDto>(orgPath('/paid-cheques'), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paidChequeKeys.lists() });
    },
  });
}

export function useDeletePaidCheque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(orgPath(`/paid-cheques/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paidChequeKeys.lists() });
    },
  });
}
