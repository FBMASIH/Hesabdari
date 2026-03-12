# Open Questions — Hesabdari

## OQ-001 — ReceivedCheque schema may be incomplete

The schema has `customerId` as required (non-optional) but no fields for bank name, branch, or drawer name. The spec's API contracts assumed these existed. Currently aligned to schema (no bank/branch/drawer). **May need schema migration** to add these fields if business requires them.

## OQ-002 — PaidCheque schema may be incomplete

Similar to OQ-001: no `payeeName` field in schema. The contract was stripped to match schema. **May need schema migration** to add payee info.

## OQ-003 — Invoice line warehouse validation scope

Zod contract validates warehouseId requirement for non-PROFORMA invoices. Service does NOT re-validate this (trusts the contract). If a non-contract code path creates invoices, the warehouse rule could be bypassed. Acceptable for now since all creation goes through the controller.

## OQ-004 — Auth guards not wired

Business endpoints have `@ApiBearerAuth()` swagger decorator but no actual NestJS auth guard (`@UseGuards(JwtAuthGuard)`) on business controllers. All endpoints are effectively public. Needs wiring.

## OQ-005 — Error filter not implemented

Zod validation errors and `ApplicationError` subclasses are thrown but there's no global NestJS exception filter to convert them to proper HTTP responses. Fastify will return 500 for unhandled errors.

## OQ-006 — BigInt JSON serialization

BigInt values cannot be serialized to JSON natively (`TypeError: Do not know how to serialize a BigInt`). Need a global serializer or transformer. Not yet implemented.

## OQ-007 — Seed data not implemented

Currency (IRR) and Bank (22 Iranian banks) seed data defined in spec but not implemented in code.

## OQ-008 — Opening balance date fields — RESOLVED (2026-03-12)

Fixed: contracts, services, and repositories now use `date` matching the schema. `Date | undefined` (not null) since schema has `@default(now())`.
