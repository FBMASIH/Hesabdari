'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';
import { STALE_TIME } from '@/shared/config/query-config';
import type { CreateWarehouseDto } from '@hesabdari/contracts';

export interface WarehouseDto {
  id: string;
  code: string;
  name: string;
  costingMethod: 'FIFO' | 'LIFO' | 'AVERAGE';
  isActive: boolean;
  createdAt: string;
}

export const warehouseKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseKeys.all, 'list'] as const,
  list: (params: WarehouseListParams) => [...warehouseKeys.lists(), params] as const,
  detail: (id: string) => [...warehouseKeys.all, 'detail', id] as const,
};

export interface WarehouseListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export function useWarehouses(params: WarehouseListParams = {}) {
  return useQuery({
    queryKey: warehouseKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<WarehouseDto>>(orgPath('/warehouses'), toQueryParams(params)),
    staleTime: STALE_TIME.MASTER_DATA,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWarehouseDto) =>
      apiClient.post<WarehouseDto>(orgPath('/warehouses'), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(orgPath(`/warehouses/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
}
