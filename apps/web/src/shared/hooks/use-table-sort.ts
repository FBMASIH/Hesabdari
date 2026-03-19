import { useState, useMemo } from 'react';
import type { SortState } from '@hesabdari/ui';

/** Resolve dot-notation path like "bank.name" to a nested value. */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc != null && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
    return undefined;
  }, obj);
}

/** Compare two values — handles strings (locale-aware), BigInt money strings, numbers, booleans. */
function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'string' && typeof b === 'string') {
    // Pure-digit strings → BigInt comparison (safe for IRR money values beyond Number.MAX_SAFE_INTEGER)
    if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
      const aBig = BigInt(a);
      const bBig = BigInt(b);
      return aBig < bBig ? -1 : aBig > bBig ? 1 : 0;
    }
    // Natural sort: "JE-1000" sorts after "JE-200"
    return a.localeCompare(b, 'fa', { numeric: true });
  }
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), 'fa', { numeric: true });
}

/**
 * Client-side sort for paginated table data.
 * Supports dot-notation keys for nested fields (e.g. "bank.name").
 * Three-state toggle: asc → desc → unsorted.
 */
export function useTableSort<T>(data: T[]) {
  const [sort, setSort] = useState<SortState | null>(null);

  function toggleSort(key: string) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  }

  const sorted = useMemo(() => {
    if (!sort) return data;
    const { key, direction } = sort;
    return [...data].sort((a, b) => {
      const result = compare(getNestedValue(a, key), getNestedValue(b, key));
      return direction === 'asc' ? result : -result;
    });
  }, [data, sort]);

  return { sort, toggleSort, sorted } as const;
}
