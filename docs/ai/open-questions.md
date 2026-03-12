# Open Questions — Hesabdari

## OQ-001 — ReceivedCheque schema may be incomplete

No fields for bank name, branch, or drawer name. May need migration.

## OQ-002 — PaidCheque schema may be incomplete

No `payeeName` field. May need migration.

## OQ-003 — Invoice line warehouse validation scope

Zod validates warehouseId for non-PROFORMA. Service trusts contract. Acceptable since all creation goes through controller.

## OQ-007 — Seed data not implemented

IRR currency and 22 Iranian banks defined in spec but not in code.

## OQ-009 — Organization membership not validated in auth guard

JwtAuthGuard authenticates the user (JWT) but does NOT verify the user is a member of the `orgId` in the URL. CLAUDE.md requires this. Needs an OrgMemberGuard or middleware.

## Resolved

- **OQ-004** (2026-03-12, Session 5): Auth guards wired globally via APP_GUARD.
- **OQ-005** (2026-03-12, Session 5): GlobalExceptionFilter registered with ZodError handling.
- **OQ-006** (2026-03-12, Session 5): BigInt serialized as number via global interceptor.
- **OQ-008** (2026-03-12): Opening balance date fields aligned to schema.
