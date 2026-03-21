'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams } from '@/shared/lib/query-helpers';
import { STALE_TIME } from '@/shared/config/query-config';

export interface ExchangeRateDto {
  id: string;
  organizationId: string;
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: string;
  date: string;
  source: 'MANUAL' | 'API';
  fromCurrency: { id: string; code: string; name: string; symbol: string };
  toCurrency: { id: string; code: string; name: string; symbol: string };
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRateQueryParams {
  fromCurrencyId?: string;
  toCurrencyId?: string;
  startDate?: string;
  endDate?: string;
}

export const exchangeRateKeys = {
  all: ['exchange-rates'] as const,
  lists: () => [...exchangeRateKeys.all, 'list'] as const,
  list: (params?: ExchangeRateQueryParams) => [...exchangeRateKeys.lists(), params] as const,
};

export function useExchangeRates(
  query?: ExchangeRateQueryParams,
  initialData?: { data: ExchangeRateDto[]; total: number },
) {
  return useQuery({
    queryKey: exchangeRateKeys.list(query),
    queryFn: () =>
      apiClient.get<{ data: ExchangeRateDto[]; total: number }>(
        orgPath('/exchange-rates'),
        query ? toQueryParams(query) : undefined,
      ),
    staleTime: STALE_TIME.TRANSACTIONAL,
    initialData,
  });
}

export function useCreateExchangeRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      fromCurrencyId: string;
      toCurrencyId: string;
      rate: string;
      date: string;
    }) =>
      apiClient.post<ExchangeRateDto>(orgPath('/exchange-rates'), {
        ...data,
        source: 'MANUAL',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exchangeRateKeys.all });
    },
  });
}

export function useDeleteExchangeRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(orgPath(`/exchange-rates/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exchangeRateKeys.all });
    },
  });
}

export function useSyncExchangeRates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post<{ synced: number; errors: string[] }>(orgPath('/exchange-rates/sync')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exchangeRateKeys.all });
    },
  });
}
