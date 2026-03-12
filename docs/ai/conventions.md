# Conventions — Hesabdari

## Schema Conventions

- **IDs:** `String @id @default(uuid()) @db.Uuid`
- **FK fields:** `String @map("snake_case") @db.Uuid`
- **Field mapping:** Every camelCase field gets `@map("snake_case")`
- **Table mapping:** Every model gets `@@map("table_name")`
- **Timestamps:** `createdAt DateTime @default(now()) @map("created_at")`, `updatedAt DateTime @updatedAt @map("updated_at")`
- **Booleans:** `@map("snake_case")` (e.g., `isActive @map("is_active")`)
- **onDelete:** `Cascade` for org-child relations. `Restrict` for critical business FKs. `SetNull` for optional FKs.
- **Money:** `BigInt` type. Always in IRR (Rial). Integer-only.
- **Quantities:** `Int` type. Whole numbers only.

## Contract Conventions

- File per entity in `packages/contracts/src/`
- `create*Schema` — required fields for creation
- `update*Schema` — `create.partial().extend({ id: z.string().uuid() })`
- `*QuerySchema` — `paginationSchema.extend({ ...filters })`
- Money at API boundary: `z.number().int()` (converted to BigInt in service)
- Dates: `z.coerce.date()`
- Barrel export in `index.ts` with `.js` extensions (ESM)

## Service Conventions

- One service per entity (or closely related group)
- Constructor injection of repository (and cross-repo when needed)
- `findById()` throws `NotFoundError` if not found
- `create()` checks code uniqueness via `findByCode()`, throws `ConflictError`
- `update()` re-checks uniqueness if code changed
- `softDelete()` sets `isActive: false`
- Money conversion: `BigInt(data.amount)` at service boundary
- State transitions: `VALID_TRANSITIONS` Record lookup, throw `ApplicationError` on invalid

## Repository Conventions

- One repository per Prisma model
- Constructor injection of `PrismaService`
- Paginated list: returns `{ data, total, page, pageSize }`
- Search: `findMany` with `contains` + `mode: 'insensitive'`, `take: 20`
- `findByCode`: returns first match for org-scoped uniqueness check
- `create`/`update`: accept plain data objects, return Prisma result

## Controller Conventions

- Thin controllers — parse Zod, delegate to service
- `@Body() body: unknown` — parse via Zod schema in method body
- `@Query() query: unknown` — same pattern
- `@Param('orgId') orgId: string` for org-scoped routes
- Route pattern: `organizations/:orgId/<entity>` (org-scoped) or `<entity>` (global)
- Swagger: `@ApiTags`, `@ApiBearerAuth()`, `@ApiOperation({ summary })` on each method
- Update pattern: `parse({ ...body, id })` then destructure `{ id: _id, ...rest }`

## Module Conventions

- One module file per business domain
- Registers: controllers, providers (services + repositories), exports (services)
- Cross-module dependencies via NestJS DI (services injected across modules when needed)

## Naming

- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Services: `EntityService`
- Repositories: `EntityRepository`
- Controllers: `EntitiesController` (plural)
- Modules: `EntitiesModule` (plural, matches directory)

## Transaction Pattern

- Invoice create/update: `prisma.$transaction(async (tx) => { ... })`
- Delete + recreate lines atomically
- Line numbers auto-assigned: `index + 1`

## Validation Pattern

- Zod at API boundary (controller)
- Business rules in service (uniqueness, state transitions, currency consistency)
- Prisma constraints as last line of defense (unique indexes, FK constraints)
