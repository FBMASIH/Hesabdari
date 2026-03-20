# Progress Log — Hesabdari

## Completed

### Phase 0: Scaffold (2026-03-11)

247 files, both apps build and serve.

### Phase 1: Schema + Contracts + Backend (2026-03-12)

30 Prisma models, 15 Zod contracts, 6 modules fully implemented. Build 8/8.

### Phase 1.5: Type safety pass (2026-03-12)

Removed all `any` from backend. Aligned Product (3 sale prices), Warehouse (costingMethod), Account (connect syntax).

### Phase 2: Runtime safety hardening (2026-03-12)

- BigInt serialization: global interceptor, BigInt→number in all responses
- Auth: JwtAuthGuard as APP_GUARD (deny-by-default), @Public() on health/auth
- Error handling: GlobalExceptionFilter with ZodError support, consistent error shape
- Logging: global LoggingInterceptor

### Phase 2.5: Test hardening (2026-03-12)

- 45 tests across 6 files, all passing
- BigInt serializer: 7 tests (nested, arrays, dates, realistic Prisma shapes)
- Exception filter: 9 tests (all error types, shape consistency, no detail leakage)
- Cheque state machines: 23 tests (received/paid/invoice transitions, terminal states)
- Journal balancing: 4 tests (existing, fixed assertions)
- Placeholder tests: 2 (auth, org — need service-level tests)

### Phase 3: Frontend UI implementation (2026-03-13 – 2026-03-19)

- Full Next.js 16 App Router frontend with 29 route pages
- 11 feature modules: auth, dashboard, customers, vendors, invoices, journal, treasury (bank accounts, cashboxes, paid/received cheques), inventory (products, warehouses), accounting, reports, settings
- Shared UI components: DataPageHeader, DataFilterBar, DataTableSkeleton, FormSection, FormActions, SearchableSelect, SpotlightSearch, etc.
- Persian RTL layout, Jalali calendar, IRANSans/Vazirmatn typography, i18n system
- TanStack Query for client data cache + mutations, React Hook Form + Zod for forms

### Phase 4: Server/Client architecture refactor (2026-03-20)

- Created `server-api.ts` — server-side ApiClient factory reading auth from cookies
- Synced auth tokens to cookies alongside localStorage (`useAuthStore`)
- 15 pages now server-fetch initial data (10 list pages + 5 edit pages)
- 11 list/tree components accept `initialData` prop with `isDefaultQuery` guard
- 9 delete/cancel hooks use optimistic `onMutate` → `onError` → `onSettled` pattern
- All 28 `loading.tsx` files verified present
- Build 8/8, typecheck clean, all routes correctly marked dynamic/static
- Architecture documented in `docs/ai/frontend-architecture.md` (D020)

### Phase 5: Full-project audit and hardening (2026-03-20)

- **Security — repository org-scoping (D021):** Fixed 8 repository methods that used `where: { id }` without organizationId. Updated 8 corresponding services. Enforces multi-tenant isolation at database query level.
- **Cross-layer DTO alignment (D022):** Fixed product stock URL mismatch (404), InvoiceDto.lines optional, cheque currencyId required, ProductWarehouseStockDto nested warehouse, creditLimit zero display.
- **Contract consistency:** Added missing exports (organization, accounting-period) to contracts barrel. Standardized invoice dates from z.coerce.date() to ISO string regex. Added error messages to money field regex validations.
- **Backend error taxonomy:** Replaced raw `throw new Error()` with `ApplicationError` in auth.service.ts. Added explicit return types to 3 key service files.
- **i18n completeness:** Replaced 8 hardcoded Persian strings with i18n keys (searchable-select, auth-form, auth-tabs, invoice-edit-page, product-form).
- **Design system:** Fixed button disabled opacity (40→60), date-picker hardcoded text-white→text-primary-fg.
- **JournalEntryService.post:** Now returns the updated entry instead of void.
- Build 8/8, typecheck 14/14, tests 45/45 all pass.

## Remaining

1. **Database migrations** (requires PostgreSQL)
2. **Seed data** (IRR, 22 banks)
3. **Integration tests** (service-level with mocked repos)
4. **Reports / Notifications / Files** module implementation
5. **Per-record audit fields** (D013)
6. **URL-based filter/search state** (optional — move useState to useSearchParams)
7. **Table virtualization** (optional — when datasets exceed ~500 rows)
8. **Refresh token hashing** (defense-in-depth — store SHA-256 hash instead of plaintext)
9. **HttpOnly cookie auth** (production hardening — requires BFF/proxy layer)

## Last Build/Test

```
pnpm build — 8/8 successful (2026-03-20)
pnpm typecheck — 14/14 clean
pnpm test — 6 files, 45 tests, all passed
Route split: 15 dynamic (ƒ), 13 static (○)
```
