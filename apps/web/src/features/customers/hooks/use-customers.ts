'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';
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

export function useCustomers(params: CustomerListParams = {}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<CustomerDto>>(
        orgPath('/customers'),
        toQueryParams(params),
      ),
  });
}

export function useCustomerSearch(q: string) {
  return useQuery({
    queryKey: customerKeys.search(q),
    queryFn: () =>
      apiClient.get<CustomerDto[]>(orgPath('/customers/search'), { q }),
    enabled: q.length >= 1,
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

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(orgPath(`/customers/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
