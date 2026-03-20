'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';
import { STALE_TIME } from '@/shared/config/query-config';
import type { CreateVendorDto } from '@hesabdari/contracts';

export interface VendorDto {
  id: string;
  code: string;
  name: string;
  phone1: string | null;
  address: string | null;
  creditLimit: string | null;
  nationalId: string | null;
  isActive: boolean;
  createdAt: string;
}

export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (params: VendorListParams) => [...vendorKeys.lists(), params] as const,
  detail: (id: string) => [...vendorKeys.all, 'detail', id] as const,
  search: (q: string) => [...vendorKeys.all, 'search', q] as const,
};

export interface VendorListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export function useVendors(
  params: VendorListParams = {},
  initialData?: PaginatedResponse<VendorDto>,
) {
  return useQuery({
    queryKey: vendorKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<VendorDto>>(orgPath('/vendors'), toQueryParams(params)),
    staleTime: STALE_TIME.MASTER_DATA,
    initialData,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVendorDto) => apiClient.post<VendorDto>(orgPath('/vendors'), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}

export function useVendor(id: string, initialData?: VendorDto) {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => apiClient.get<VendorDto>(orgPath(`/vendors/${id}`)),
    enabled: !!id,
    staleTime: STALE_TIME.MASTER_DATA,
    initialData,
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVendorDto> }) =>
      apiClient.put<VendorDto>(orgPath(`/vendors/${id}`), data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(variables.id) });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(orgPath(`/vendors/${id}`)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: vendorKeys.lists() });
      const snapshots = queryClient.getQueriesData<PaginatedResponse<VendorDto>>({
        queryKey: vendorKeys.lists(),
      });
      queryClient.setQueriesData<PaginatedResponse<VendorDto>>(
        { queryKey: vendorKeys.lists() },
        (old) =>
          old ? { ...old, data: old.data.filter((c) => c.id !== id), total: old.total - 1 } : old,
      );
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}
