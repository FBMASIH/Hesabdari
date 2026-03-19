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
