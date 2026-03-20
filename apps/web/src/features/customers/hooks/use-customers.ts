'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';
import { STALE_TIME } from '@/shared/config/query-config';
import type { CreateCustomerDto } from '@hesabdari/contracts';

export interface CustomerDto {
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

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params: CustomerListParams) => [...customerKeys.lists(), params] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
  search: (q: string) => [...customerKeys.all, 'search', q] as const,
};

export interface CustomerListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export function useCustomers(
  params: CustomerListParams = {},
  initialData?: PaginatedResponse<CustomerDto>,
) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<CustomerDto>>(orgPath('/customers'), toQueryParams(params)),
    staleTime: STALE_TIME.MASTER_DATA,
    initialData,
  });
}

export function useCustomerSearch(q: string) {
  return useQuery({
    queryKey: customerKeys.search(q),
    queryFn: () => apiClient.get<CustomerDto[]>(orgPath('/customers/search'), { q }),
    enabled: q.length >= 1,
    staleTime: STALE_TIME.SEARCH,
  });
}

/** Fetch a single customer by ID. */
export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => apiClient.get<CustomerDto>(orgPath(`/customers/${id}`)),
    enabled: !!id,
    staleTime: STALE_TIME.MASTER_DATA,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerDto) =>
      apiClient.post<CustomerDto>(orgPath('/customers'), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

/** Update an existing customer. */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCustomerDto> }) =>
      apiClient.put<CustomerDto>(orgPath(`/customers/${id}`), data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(orgPath(`/customers/${id}`)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.lists() });
      const snapshots = queryClient.getQueriesData<PaginatedResponse<CustomerDto>>({
        queryKey: customerKeys.lists(),
      });
      queryClient.setQueriesData<PaginatedResponse<CustomerDto>>(
        { queryKey: customerKeys.lists() },
        (old) =>
          old ? { ...old, data: old.data.filter((c) => c.id !== id), total: old.total - 1 } : old,
      );
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
