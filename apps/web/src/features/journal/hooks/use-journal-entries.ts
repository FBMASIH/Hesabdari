'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';

// ── API response types ──────────────────────────────

export interface JournalEntryDto {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  status: 'DRAFT' | 'POSTED' | 'REVERSED';
  postedAt: string | null;
  lines: JournalLineDto[];
  createdAt: string;
}

export interface JournalLineDto {
  id: string;
  accountId: string;
  account?: { id: string; code: string; name: string };
  description: string | null;
  debitAmount: string;
  creditAmount: string;
}

// ── Query keys ──────────────────────────────────────

export const journalKeys = {
  all: ['journal-entries'] as const,
  lists: () => [...journalKeys.all, 'list'] as const,
  list: (params: JournalListParams) => [...journalKeys.lists(), params] as const,
  details: () => [...journalKeys.all, 'detail'] as const,
  detail: (id: string) => [...journalKeys.details(), id] as const,
};

// ── Query params ────────────────────────────────────

export interface JournalListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

// ── Hooks ───────────────────────────────────────────

export function useJournalEntries(params: JournalListParams = {}) {
  return useQuery({
    queryKey: journalKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<JournalEntryDto>>(
        orgPath('/journal-entries'),
        toQueryParams(params),
      ),
  });
}

export function useJournalEntry(id: string) {
  return useQuery({
    queryKey: journalKeys.detail(id),
    queryFn: () => apiClient.get<JournalEntryDto>(orgPath(`/journal-entries/${id}`)),
    enabled: !!id,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) =>
      apiClient.post<JournalEntryDto>(orgPath('/journal-entries'), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      apiClient.put<JournalEntryDto>(orgPath(`/journal-entries/${id}`), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
    },
  });
}

export function usePostJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<JournalEntryDto>(orgPath(`/journal-entries/${id}/post`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
    },
  });
}
