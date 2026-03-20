# Decision Log — Hesabdari

## D001 — Currency: single-currency default (IRR), multi-currency-ready schema (2026-03-12)

## D002 — Money: BigInt in Rial, decimalPlaces=0 (2026-03-12)

## D003 — Quantities: Int only, fractional deferred (2026-03-12)

## D004 — Invoice party exclusivity: customer/vendor enforced by type (2026-03-12)

## D005 — Cheque state machines: forward-only, defined terminal states (2026-03-12)

## D006 — Opening balance uniqueness: one per customer/vendor per currency (2026-03-12)

## D007 — Currency consistency: bank/cashbox/cheque currency must match account (2026-03-12)

## D008 — Schema conventions: UUID IDs, snake_case mapping, Cascade/Restrict (2026-03-12)

## D009 — Prisma 7 ESM: packages/db uses `"type": "module"` (2026-03-11)

## D010 — NestJS webpack builder for ESM/CJS interop (2026-03-11)

## D011 — Warehouse required on non-PROFORMA invoice lines (2026-03-12)

## D012 — Paid cheque sayadi uniqueness at service level (2026-03-12)

## D013 — Per-record audit fields deferred (2026-03-12)

## D014 — No `any` in backend code; use Prisma typed inputs (2026-03-12)

## D015 — CostingMethod on Warehouse, not Product (2026-03-12)

## D016 — BigInt serialized as number in API responses (2026-03-12) — SUPERSEDED by D019

**Decision:** Global `BigIntSerializerInterceptor` converts all BigInt values to `number` in HTTP responses.
**Why:** `JSON.stringify` cannot handle BigInt. IRR amounts fit safely within `Number.MAX_SAFE_INTEGER` (~9e15).
**Alternatives:** String serialization (rejected — would break contract `z.number().int()` symmetry), per-DTO conversion (rejected — too scattered).
**Impact:** All monetary fields in responses are JavaScript numbers. No manual conversion needed in controllers.

## D017 — Deny-by-default auth via APP_GUARD (2026-03-12)

**Decision:** `JwtAuthGuard` and `OrgMembershipGuard` registered as global `APP_GUARD`. All endpoints require JWT unless decorated `@Public()`. Org-scoped endpoints (with `:orgId` param) additionally verify organization membership.
**Why:** CLAUDE.md mandates deny-by-default and organization membership verification for every request.
**Alternatives:** Per-controller `@UseGuards()` (rejected — too fragile for 21 controllers).
**Impact:** Health and auth endpoints marked `@Public()`. All business endpoints automatically protected. Org membership enforced globally for org-scoped routes.

## D018 — Structured error response shape (2026-03-12)

**Decision:** All API errors return `{ error: { code: string, message: string, details?: unknown } }`. ZodError→400, ApplicationError→statusCode, DomainError→422, HttpException→status, unknown→500.
**Why:** Consistent error shape for frontend consumption. No internal detail leakage on 500s.
**Impact:** Global `GlobalExceptionFilter` registered in `main.ts`. Controllers don't need try/catch for Zod parsing.

## D019 — BigInt serialized as string in API responses (2026-03-19) — supersedes D016

**Decision:** `BigIntSerializerInterceptor` now converts BigInt values to integer strings (`value.toString()`) instead of numbers.
**Why:** CLAUDE.md mandates "Money MUST be sent over JSON as an integer string." Contracts were updated to `z.string().regex(/^\d+$/)`. String serialization prevents precision loss for large monetary values and aligns with the API boundary specification.
**Alternatives:** Number serialization (D016, now superseded — risks precision loss for values near `Number.MAX_SAFE_INTEGER`).
**Impact:** All monetary fields in responses are strings. Frontend must parse with string-based logic. Contracts already expect strings.

## D020 — Server-side initial data fetch via cookie-synced auth (2026-03-20)

**Decision:** List and edit pages fetch initial data in Server Components via `createServerClient()`, which reads auth tokens from cookies. Auth cookies are synced alongside localStorage by `useAuthStore`. Client-side TanStack Query receives `initialData` from the server and handles ongoing interactivity (search, filter, pagination, mutations).
**Why:** Empty Server Component pages caused blank→spinner→data on every navigation. Official Next.js docs recommend fetching data in Server Components and passing as props. Server-first rendering eliminates the spinner for first-page loads.
**Alternatives:** Full client-only rendering (pre-refactor — visible spinner on every navigation), Server Actions for mutations (rejected — would regress React Hook Form + TanStack Query workflows), sync engine / local-first (rejected — excessive complexity for current stage).
**Constraints:** Forms remain Client Components. Only the primary entity and first page of list results are server-prefetched. Dropdown/lookup data for forms stays client-fetched. Edit page loaders are retained as fallbacks when server fetch fails.
**Impact:** 15 pages now server-fetch initial data. 9 hooks have optimistic deletes/cancels. Build: 8/8, typecheck clean. See `docs/ai/frontend-architecture.md` for full guide.
**Security note:** Auth cookies are non-HttpOnly (set via `document.cookie`) because Server Components read them via `cookies()` from `next/headers`. The JWT is already in localStorage (same XSS surface). A BFF layer or proxy API route for HttpOnly cookies is deferred until production hardening.

## D021 — Repository org-scoping hardening (2026-03-20)

**Decision:** Every repository `update`, `updateStatus`, `close`, and `findByProduct` method must include `organizationId` in the `where` clause, not just `id`. Services pass `organizationId` from their parameters.
**Why:** CLAUDE.md mandates "Every repository query MUST be scoped by `organizationId` — no exceptions." Audit found 8+ repository methods using `where: { id }` without org scope. While services checked org membership before calling, the repository itself had no guard — creating TOCTOU risk and violating defense-in-depth.
**Impact:** Fixed in: JournalEntryRepository (updateWithLines, updateStatus), InvoiceRepository (updateWithLines, updateStatus), PeriodRepository (close), BankAccountRepository (update), CashboxRepository (update), ExpenseRepository (update), WarehouseRepository (update), ProductWarehouseStockRepository (findByProduct). All corresponding services updated to pass organizationId.

## D022 — Cross-layer contract alignment (2026-03-20)

**Decision:** Frontend DTO types must accurately reflect what the API actually returns. Fields that only appear in detail responses (not lists) must be optional. Field names must match the response shape (nested objects vs flat fields).
**Why:** Audit found: InvoiceDto.lines was required but absent from list responses, ProductWarehouseStockDto.warehouseName didn't exist (backend returns nested warehouse object), currencyId was optional in frontend but required by backend contract, product stock URL path mismatched between frontend and backend.
**Impact:** Fixed InvoiceDto.lines to optional, ProductWarehouseStockDto to use nested warehouse object, cheque currencyId to required, product stock URL from `/stocks` to `/warehouse-stocks`.
