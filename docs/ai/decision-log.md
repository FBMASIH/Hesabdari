# Decision Log — Hesabdari

## D001 — Currency storage strategy (2026-03-12)
**Decision:** Single-currency default (IRR) with multi-currency-ready schema.
**Why:** Reduces complexity now. Currency table + FK on every monetary entity allows future multi-currency without migration.
**Alternatives:** Full multi-currency now (rejected — premature), hardcoded IRR (rejected — no extensibility).
**Impact:** All monetary entities have `currencyId` FK. Seed includes IRR only.

## D002 — Money type: BigInt in Rial (2026-03-12)
**Decision:** All monetary values stored as `BigInt` in Rial (IRR), decimalPlaces=0.
**Why:** Integer-safe. No floating-point rounding. Rial is the legal unit. Toman (÷10) is display-only.
**Impact:** Zod contracts accept `z.number().int()` at API boundary; services convert to `BigInt`.

## D003 — Quantity type: Int only (2026-03-12)
**Decision:** All quantities are `Int`. Fractional quantities deferred.
**Why:** Simpler schema and validation. Most Iranian accounting uses whole-number quantities. Migration to `Decimal` later if needed.
**Impact:** `InvoiceLine.quantity`, `ProductWarehouseStock.quantity` are `Int`.

## D004 — Invoice party exclusivity (2026-03-12)
**Decision:** SALES/SALES_RETURN/PROFORMA require `customerId`, forbid `vendorId`. PURCHASE/PURCHASE_RETURN require `vendorId`, forbid `customerId`.
**Why:** Accounting correctness. A sales invoice must have a customer, never a vendor.
**Impact:** Enforced via Zod discriminated union + service-level validation.

## D005 — Cheque state machines (2026-03-12)
**Decision:** Forward-only transitions (except RETURNED→OPEN for re-deposit). Terminal states: CASHED, BOUNCED, CANCELLED (received); CLEARED, CANCELLED (paid).
**Why:** Accounting audit trail. Cheques cannot go backward arbitrarily.
**Impact:** `VALID_TRANSITIONS` lookup in cheque services.

## D006 — Opening balance uniqueness (2026-03-12)
**Decision:** Customer/vendor opening balances: one per entity per currency (enforced in service). Bank/cashbox: multiple entries allowed.
**Why:** Customer/vendor balances represent a single opening position. Bank deposits accumulate.
**Impact:** Service-level uniqueness check + DB `@@unique` on customer/vendor opening balances.

## D007 — Currency consistency rules (2026-03-12)
**Decision:** BankOpeningBalance.currencyId must match BankAccount.currencyId. Same for cashbox. PaidCheque.currencyId must match BankAccount.currencyId. ReceivedCheque deposit must match.
**Why:** Prevents cross-currency accounting errors.
**Impact:** Service-level validation in treasury module.

## D008 — Schema conventions (2026-03-12)
**Decision:** UUID IDs (`@default(uuid()) @db.Uuid`), snake_case mapping, `onDelete: Cascade` for org children, `Restrict` for critical business refs.
**Why:** Consistency. PostgreSQL-friendly. Prevents accidental data loss.
**Impact:** All 30 models follow this convention.

## D009 — Prisma 7 ESM compatibility (2026-03-11)
**Decision:** `packages/db/package.json` has `"type": "module"`. Required because Prisma 7 generated client uses `import.meta.url`.
**Why:** Without it, tsc outputs CJS which can't handle `import.meta.url`.
**Impact:** All imports from db package use `.js` extensions.

## D010 — NestJS webpack builder (2026-03-11)
**Decision:** API uses webpack builder (nest-cli.json `"builder": "webpack"`).
**Why:** Handles ESM/CJS interop between NestJS (CJS) and Prisma 7 (ESM).
**Impact:** Requires `ts-loader` + `webpack` devDependencies.

## D011 — Warehouse requirement on invoice lines (2026-03-12)
**Decision:** PROFORMA: warehouseId optional. All other invoice types: warehouseId REQUIRED on every line.
**Why:** Inventory-affecting documents must have warehouse context for stock tracking.
**Impact:** Validated in Zod contract `.superRefine()`.

## D012 — Paid cheque sayadi validation (2026-03-12)
**Decision:** PaidCheque.sayadiNumber uniqueness enforced at service level (not DB) when provided and non-empty.
**Why:** Nullable partial-unique is awkward in Prisma. Service validation is sufficient.
**Impact:** Service checks on create/update.

## D013 — Per-record audit fields deferred (2026-03-12)
**Decision:** `createdByUserId`/`updatedByUserId` on business records deferred.
**Why:** Auth/request user context not yet injected into service methods. AuditLog table provides event-level tracking.
**Impact:** Future phase will wire request user through NestJS DI chain.
