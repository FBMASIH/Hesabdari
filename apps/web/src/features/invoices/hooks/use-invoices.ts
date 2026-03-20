'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';
import { STALE_TIME } from '@/shared/config/query-config';

// ── API response types (matching backend) ───────────

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  documentType: 'SALES' | 'PURCHASE' | 'SALES_RETURN' | 'PURCHASE_RETURN' | 'PROFORMA';
  invoiceDate: string;
  dueDate: string | null;
  totalAmount: string; // integer string (Rial)
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  description: string | null;
  customer?: { id: string; name: string } | null;
  vendor?: { id: string; name: string } | null;
  lines?: InvoiceLineDto[];
  createdAt: string;
}

export interface InvoiceLineDto {
  id: string;
  lineNumber: number;
  productId: string;
  description: string | null;
  quantity: number;
  unitPrice: string;
  discount: string;
  tax: string;
  totalPrice: string;
}

// ── Query keys ──────────────────────────────────────

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (params: InvoiceListParams) => [...invoiceKeys.lists(), params] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

// ── Query params ────────────────────────────────────

export interface InvoiceListParams {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ── Hooks ───────────────────────────────────────────

export function useInvoices(
  params: InvoiceListParams = {},
  initialData?: PaginatedResponse<InvoiceDto>,
) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<InvoiceDto>>(orgPath('/invoices'), toQueryParams(params)),
    staleTime: STALE_TIME.TRANSACTIONAL,
    initialData,
  });
}

export function useInvoice(id: string, initialData?: InvoiceDto) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => apiClient.get<InvoiceDto>(orgPath(`/invoices/${id}`)),
    enabled: !!id,
    staleTime: STALE_TIME.TRANSACTIONAL,
    initialData,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    // TODO: Use CreateInvoiceDto from @hesabdari/contracts once the frontend import path is configured
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post<InvoiceDto>(orgPath('/invoices'), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    // TODO: Use UpdateInvoiceDto from @hesabdari/contracts once the frontend import path is configured
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient.put<InvoiceDto>(orgPath(`/invoices/${id}`), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useConfirmInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<InvoiceDto>(orgPath(`/invoices/${id}/confirm`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<InvoiceDto>(orgPath(`/invoices/${id}/cancel`)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: invoiceKeys.lists() });
      const snapshots = queryClient.getQueriesData<PaginatedResponse<InvoiceDto>>({
        queryKey: invoiceKeys.lists(),
      });
      queryClient.setQueriesData<PaginatedResponse<InvoiceDto>>(
        { queryKey: invoiceKeys.lists() },
        (old) =>
          old
            ? {
                ...old,
                data: old.data.map((c) =>
                  c.id === id ? { ...c, status: 'CANCELLED' as const } : c,
                ),
              }
            : old,
      );
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}
