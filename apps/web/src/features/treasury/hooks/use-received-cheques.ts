'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';
import { STALE_TIME } from '@/shared/config/query-config';

export type ReceivedChequeStatus =
  | 'OPEN'
  | 'DEPOSITED'
  | 'CASHED'
  | 'RETURNED'
  | 'BOUNCED'
  | 'CANCELLED';

export interface ReceivedChequeDto {
  id: string;
  chequeNumber: string;
  sayadiNumber: string | null;
  amount: string;
  date: string;
  dueDate: string;
  description: string | null;
  status: ReceivedChequeStatus;
  customer: { id: string; name: string };
  createdAt: string;
}

export interface CreateReceivedChequeInput {
  chequeNumber: string;
  sayadiNumber?: string;
  customerId: string;
  currencyId: string;
  amount: string;
  date: string;
  dueDate: string;
  description?: string;
}

export const receivedChequeKeys = {
  all: ['receivedCheques'] as const,
  lists: () => [...receivedChequeKeys.all, 'list'] as const,
  list: (params: ReceivedChequeListParams) => [...receivedChequeKeys.lists(), params] as const,
  detail: (id: string) => [...receivedChequeKeys.all, 'detail', id] as const,
};

export interface ReceivedChequeListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ReceivedChequeStatus;
}

export function useReceivedCheques(
  params: ReceivedChequeListParams = {},
  initialData?: PaginatedResponse<ReceivedChequeDto>,
) {
  return useQuery({
    queryKey: receivedChequeKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ReceivedChequeDto>>(
        orgPath('/received-cheques'),
        toQueryParams(params),
      ),
    staleTime: STALE_TIME.TRANSACTIONAL,
    initialData,
  });
}

export function useCreateReceivedCheque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReceivedChequeInput) =>
      apiClient.post<ReceivedChequeDto>(orgPath('/received-cheques'), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receivedChequeKeys.lists() });
    },
  });
}
