/**
 * Tiered staleTime constants for TanStack Query.
 *
 * Accounting apps benefit from aggressive caching because most data
 * changes infrequently. These tiers prevent redundant refetches
 * when users switch between tabs while keeping active data fresh.
 */
export const STALE_TIME = {
  /** Customers, vendors, accounts, warehouses, currencies, periods — rarely change. */
  MASTER_DATA: 5 * 60 * 1000, // 5 minutes

  /** Invoices, journal entries, cheques — change during active work sessions. */
  TRANSACTIONAL: 2 * 60 * 1000, // 2 minutes

  /** Dashboard KPIs, summaries — should reflect recent activity. */
  DASHBOARD: 30 * 1000, // 30 seconds

  /** Search results — short-lived, user types quickly. */
  SEARCH: 30 * 1000, // 30 seconds
} as const;
