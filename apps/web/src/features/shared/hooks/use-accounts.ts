'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath } from '@/shared/lib/query-helpers';
import { STALE_TIME } from '@/shared/config/query-config';

export interface AccountDto {
  id: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parentId: string | null;
  isActive: boolean;
}

export const accountKeys = {
  all: ['accounts'] as const,
  list: () => [...accountKeys.all, 'list'] as const,
};

export function useAccounts(initialData?: AccountDto[]) {
  return useQuery({
    queryKey: accountKeys.list(),
    queryFn: () => apiClient.get<AccountDto[]>(orgPath('/accounts')),
    staleTime: STALE_TIME.MASTER_DATA,
    initialData,
  });
}
