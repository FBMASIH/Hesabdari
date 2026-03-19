'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { STALE_TIME } from '@/shared/config/query-config';

export interface CurrencyDto {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
}

export const currencyKeys = {
  all: ['currencies'] as const,
  list: () => [...currencyKeys.all, 'list'] as const,
};

/** Fetch all currencies (system-level, not org-scoped). */
export function useCurrencies() {
  return useQuery({
    queryKey: currencyKeys.list(),
    queryFn: () => apiClient.get<CurrencyDto[]>('/api/v1/currencies'),
    staleTime: STALE_TIME.MASTER_DATA,
  });
}

/** Get the default currency ID (first active IRR currency). */
export function useDefaultCurrencyId(): string | undefined {
  const { data } = useCurrencies();
  const irr = data?.find((c) => c.code === 'IRR' && c.isActive);
  return irr?.id;
}
