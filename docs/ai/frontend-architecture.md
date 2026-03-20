# Frontend Architecture — Server/Client Boundary Guide

**Established:** 2026-03-20 (Session 7)
**Status:** Stable baseline. Do not reopen unless a real production bug requires it.

---

## Intended Pattern

Pages and layouts are Server Components. Interactive feature components (forms, lists with search/sort/filter, dropdowns, modals) are Client Components. Server Components fetch initial data close to the source and pass it as serializable props to client components.

This follows official Next.js App Router guidance: server by default, client only where hooks/state/browser APIs are required.

---

## How Auth Works Across Server and Client

Auth tokens live in **both localStorage and cookies**, kept in sync:

| Store                          | Written by                       | Read by                  | Purpose                           |
| ------------------------------ | -------------------------------- | ------------------------ | --------------------------------- |
| `localStorage.access_token`    | `useAuthStore.setTokens`         | Client-side `apiClient`  | Bearer token for client API calls |
| `localStorage.refresh_token`   | `useAuthStore.setTokens`         | Client-side `apiClient`  | Token refresh flow                |
| `localStorage.organization_id` | `useAuthStore.setOrganizationId` | Client-side `getOrgId()` | Org-scoped API paths              |
| Cookie `auth_session`          | `useAuthStore.setTokens`         | Middleware               | Route protection (flag only)      |
| Cookie `access_token`          | `useAuthStore.setTokens`         | `createServerClient()`   | Server-side API calls             |
| Cookie `organization_id`       | `useAuthStore.setOrganizationId` | `createServerClient()`   | Server-side org-scoped paths      |

Cookies are non-HttpOnly (set via `document.cookie`), `SameSite=Strict`, `Secure` in production. This matches the existing security model (tokens are already in localStorage).

**Sync invariant:** Every code path that writes localStorage also writes the corresponding cookie. Every code path that clears localStorage also deletes the corresponding cookie. This is enforced in `useAuthStore` — do not bypass it.

---

## Server-Side Data Fetching

**Where:** `shared/lib/server-api.ts`

`createServerClient()` reads `access_token` and `organization_id` from cookies via `next/headers`, creates an `ApiClient` that calls the backend directly (`API_BACKEND_URL`), and returns `{ client, orgId }`.

**Pattern for list pages:**

```tsx
// page.tsx — Server Component
export default async function CustomersPage() {
  let initialData: PaginatedResponse<CustomerDto> | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get(serverOrgPath(orgId, '/customers'), {
      page: '1',
      pageSize: '10',
    });
  } catch {
    // Server fetch failed — client handles it
  }
  return <CustomerListPage initialData={initialData} />;
}
```

**Pattern for edit pages:**

```tsx
// [id]/edit/page.tsx — Server Component
export default async function EditPage({ params }) {
  const { id } = await params;
  let entity: CustomerDto | undefined;
  try {
    const { client, orgId } = await createServerClient();
    entity = await client.get(serverOrgPath(orgId, `/customers/${id}`));
  } catch {}
  return entity ? <CustomerForm initialData={entity} /> : <CustomerEditLoader customerId={id} />;
}
```

**How initialData flows through TanStack Query:**

```tsx
// In the list component (Client Component)
const isDefaultQuery = page === 1 && !debouncedSearch && !activeFilter;
const { data } = useCustomers(
  { page, pageSize: 10, search, isActive },
  isDefaultQuery ? initialData : undefined,
);
```

The `isDefaultQuery` guard is critical: `initialData` must only be passed when the current query params match the server-prefetched params (page 1, no search, no filter). Otherwise, stale server data would populate a different query.

---

## When to Server-Prefetch

**Do prefetch:**

- List/index pages — the first page of results (page 1, no filters)
- Edit pages — the primary entity being edited

**Do NOT prefetch:**

- Dropdown/lookup data for forms (customers list for invoice form, banks list for bank account form) — this is secondary data that should not delay first paint
- `/new` create pages — there's no entity to prefetch
- Dashboard — currently client-driven (mode toggle, conditional rendering)
- Reports/settings — stubs with no meaningful server data yet
- Any data that requires complex client-side state to determine what to fetch

**Why:** The goal is faster perceived first render, not slower page loads from over-fetching. One fast API call per page is the target.

---

## When to Use `'use client'`

**Must be client:**

- Components with `useState`, `useEffect`, `useRef`, or any React hook
- Components with event handlers (`onClick`, `onChange`, `onKeyDown`)
- Components using browser APIs (`localStorage`, `window`, `document`, `matchMedia`)
- Components using TanStack Query hooks, React Hook Form, Zustand
- All forms, search bars, filter controls, dropdowns, modals, toasts, command palette

**Must be server:**

- `page.tsx` files (the route entry point — fetches data, passes props)
- `layout.tsx` files
- `loading.tsx` files (Suspense fallback skeletons)
- Pure presentational components with zero interactivity (if not consumed by a client parent)

**Rule:** Push `'use client'` as far down the tree as possible. Pages are server, feature components are client.

---

## Optimistic Mutations

Delete and cancel mutations use the `onMutate` → `onError` → `onSettled` pattern:

1. `onMutate`: Cancel in-flight queries, snapshot cache, optimistically remove/update item
2. `onError`: Restore snapshot (rollback)
3. `onSettled`: Invalidate queries (reconcile with server truth)

Applied to: all 8 entity delete hooks + invoice cancel.

**Do NOT add optimistic updates to:** create, update, or complex state transitions. These benefit from waiting for server confirmation before showing success.

---

## StaleTime Strategy

| Data type           | staleTime                                | Behavior with initialData                                                        |
| ------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| MASTER_DATA (5 min) | Customers, vendors, accounts, warehouses | Server data stays fresh — no background refetch for 5 minutes                    |
| TRANSACTIONAL (0)   | Invoices, journal entries, cheques       | Server data shown immediately, background refetch fires (stale-while-revalidate) |
| DASHBOARD (30s)     | KPIs, summaries                          | Short-lived freshness                                                            |
| SEARCH (30s)        | Search results                           | Short-lived freshness                                                            |

The background refetch for TRANSACTIONAL data means two API calls per page visit (server + client). This is invisible to users — they see data immediately from the server render.

---

## Known Caveats (Accept, Do Not Fix)

1. **First login edge case:** If the profile fetch fails during login, `organization_id` cookie is not set. The first server-side fetch falls back to client-only. The UserMenu retries on mount.

2. **Transactional double-fetch:** Pages with `staleTime: 0` fire a background client refetch after hydration even though the server just provided the data. Invisible to users.

3. **Edit page loaders retained:** `CustomerEditLoader`, `VendorEditLoader`, `ProductEditLoader` are still used as fallbacks when server-side entity fetch fails (expired token, API down).

---

## Maintainer Checklist

When adding a new feature page:

- [ ] `page.tsx` is a Server Component (no `'use client'`)
- [ ] `page.tsx` fetches initial data via `createServerClient()` + `serverOrgPath()` in a try-catch
- [ ] Feature list/form component accepts `initialData?` prop
- [ ] Hook's `useXxx()` accepts `initialData` parameter and passes to `useQuery`
- [ ] List component uses `isDefaultQuery` guard before passing `initialData`
- [ ] `loading.tsx` exists with appropriate skeleton
- [ ] Delete hook uses optimistic `onMutate` → `onError` → `onSettled` pattern
- [ ] DTO type is exported from the feature barrel (`index.ts`)
- [ ] Forms stay `'use client'` — do NOT attempt to server-render forms
- [ ] Dropdown/lookup data for forms stays client-fetched — do NOT block the route on it
