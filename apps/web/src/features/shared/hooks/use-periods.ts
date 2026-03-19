'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath } from '@/shared/lib/query-helpers';
import { STALE_TIME } from '@/shared/config/query-config';

export interface PeriodDto {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED';
}

export const periodKeys = {
  all: ['periods'] as const,
  list: () => [...periodKeys.all, 'list'] as const,
};

/** Fetch accounting periods for the current organization. */
export function usePeriods() {
  return useQuery({
    queryKey: periodKeys.list(),
    queryFn: () => apiClient.get<PeriodDto[]>(orgPath('/periods')),
    staleTime: STALE_TIME.MASTER_DATA,
  });
}

/** Get the active (OPEN) period ID. */
export function useActivePeriodId(): string | undefined {
  const { data } = usePeriods();
  const open = data?.find((p) => p.status === 'OPEN');
  return open?.id;
}
