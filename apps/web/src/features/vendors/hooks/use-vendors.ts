'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';
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

export function useVendors(params: VendorListParams = {}) {
  return useQuery({
    queryKey: vendorKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<VendorDto>>(
        orgPath('/vendors'),
        toQueryParams(params),
      ),
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVendorDto) =>
      apiClient.post<VendorDto>(orgPath('/vendors'), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(orgPath(`/vendors/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}
