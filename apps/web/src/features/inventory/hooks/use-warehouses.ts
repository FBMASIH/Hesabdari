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

export function useWarehouses(
  params: WarehouseListParams = {},
  initialData?: PaginatedResponse<WarehouseDto>,
) {
  return useQuery({
    queryKey: warehouseKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<WarehouseDto>>(orgPath('/warehouses'), toQueryParams(params)),
    staleTime: STALE_TIME.MASTER_DATA,
    initialData,
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: warehouseKeys.lists() });
      const snapshots = queryClient.getQueriesData<PaginatedResponse<WarehouseDto>>({
        queryKey: warehouseKeys.lists(),
      });
      queryClient.setQueriesData<PaginatedResponse<WarehouseDto>>(
        { queryKey: warehouseKeys.lists() },
        (old) =>
          old ? { ...old, data: old.data.filter((c) => c.id !== id), total: old.total - 1 } : old,
      );
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
}
