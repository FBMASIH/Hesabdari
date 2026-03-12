# Conventions — Hesabdari

## Schema Conventions

- **IDs:** `String @id @default(uuid()) @db.Uuid`
- **FK fields:** `String @map("snake_case") @db.Uuid`
- **Field mapping:** Every camelCase field gets `@map("snake_case")`
- **Table mapping:** Every model gets `@@map("table_name")`
- **Timestamps:** `createdAt DateTime @default(now()) @map("created_at")`, `updatedAt DateTime @updatedAt @map("updated_at")`
- **onDelete:** `Cascade` for org-child. `Restrict` for critical business FKs. `SetNull` for optional.
- **Money:** `BigInt`, always IRR, integer-only
- **Quantities:** `Int`, whole numbers only

## DB Package

- Exports: `PrismaClient`, `Prisma` namespace, `PrismaPg`, all model/enum types
- `Prisma` namespace: `Prisma.*CreateInput`, `Prisma.*UpdateInput`, `Prisma.*WhereInput`

## Contract Conventions

- File per entity in `packages/contracts/src/`
- `create*Schema`, `update*Schema` (partial + id), `*QuerySchema` (pagination + filters)
- Money: `z.number().int()` at API boundary → `BigInt()` in service
- Dates: `z.coerce.date()`
- Barrel export in `index.ts` with `.js` extensions

## Repository Conventions

- One per Prisma model, constructor-injected `PrismaService`
- Typed parameters: `Prisma.*Input` types — never `any`
- Paginated: `{ data, total, page, pageSize }`
- Date ranges: `{ ...(fromDate ? { gte } : {}), ...(toDate ? { lte } : {}) }`

## Service Conventions

- One per entity, constructor-injected repository
- `findById()` → `NotFoundError`, `create()` → `ConflictError` on duplicate code
- Money: `BigInt(data.amount)` at service boundary
- State transitions: `VALID_TRANSITIONS` Record, `ApplicationError` on invalid
- Relations: `{ connect: { id } }` / `{ disconnect: true }` syntax

## Controller Conventions

- Thin: `@Body() body: unknown` → `schema.parse(body)` → delegate to service
- Route: `organizations/:orgId/<entity>` (org-scoped)
- Swagger: `@ApiTags`, `@ApiBearerAuth()`, `@ApiOperation`

## Auth Convention (D017)

- `JwtAuthGuard` is global `APP_GUARD` — all endpoints require JWT by default
- `@Public()` for unauthenticated endpoints (health, auth)
- No per-controller `@UseGuards()` needed

## Error Response Convention (D018)

```json
{ "error": { "code": "ERROR_CODE", "message": "Human-readable", "details": [...] } }
```

- ZodError → 400, VALIDATION_ERROR, issues as details
- ApplicationError → statusCode, code, message
- DomainError → 422, code, message
- HttpException → status, HTTP_ERROR
- Unknown → 500, INTERNAL_ERROR, generic message (no leak)

## BigInt Serialization Convention (D016)

- Global `BigIntSerializerInterceptor` converts BigInt→number in all responses
- No manual conversion in controllers or services
- Safe for IRR (amounts << Number.MAX_SAFE_INTEGER)

## Type Safety (D014)

- No `any` in repos, services, platform code
- Import `type { Prisma }` from `@hesabdari/db` for input types
- Import enums directly: `import { CostingMethod } from '@hesabdari/db'`

## Test Conventions

- Vitest, `src/**/*.spec.ts`
- `@` alias resolves to `apps/api/src`
- State machine tests: duplicate `VALID_TRANSITIONS` in test, test valid/invalid/terminal
- Error filter tests: mock `ArgumentsHost` with `{ switchToHttp → getResponse → { status, send } }`
- Interceptor tests: mock `CallHandler` with `{ handle: () => of(data) }`
