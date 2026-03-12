# Database Migrations

## Overview

We use Prisma Migrate for schema management. All migrations live in `packages/db/prisma/migrations/`.

## Creating a Migration

1. Edit the schema: `packages/db/prisma/schema.prisma`
2. Generate the migration:

   ```bash
   pnpm db:migrate
   ```

   Prisma will prompt for a migration name. Use descriptive names:
   - `add_currency_to_invoice`
   - `create_warehouse_table`
   - `add_index_on_journal_entry_date`

3. Review the generated SQL in `packages/db/prisma/migrations/<timestamp>_<name>/migration.sql`
4. Regenerate Prisma client: `pnpm db:generate`

## Rules

### Never edit existing migrations

Once a migration has been committed and shared, it is immutable. Create a new migration to make further changes.

### Always test migrations

Before committing:

```bash
# Reset and replay all migrations on a fresh database
pnpm --filter @hesabdari/db exec prisma migrate reset --force
```

### Backward compatibility

- Avoid `DROP COLUMN` in production unless the column is confirmed unused
- Add new columns as nullable or with defaults
- Rename operations should be done in two steps: add new → migrate data → remove old

### Data migrations

For data transformations (not just schema changes):

- Write a separate seed/script in `packages/db/src/migrations/`
- Document the data migration in the PR description
- Test with production-like data volumes

## Common Commands

```bash
# Generate Prisma client from schema
pnpm db:generate

# Create and apply a new migration
pnpm db:migrate

# Reset database (destructive — dev only)
pnpm --filter @hesabdari/db exec prisma migrate reset --force

# Check migration status
pnpm --filter @hesabdari/db exec prisma migrate status

# Seed the database
pnpm db:seed

# Open Prisma Studio (GUI)
pnpm --filter @hesabdari/db exec prisma studio
```

## Troubleshooting

### "Migration failed to apply cleanly"

1. Check the error in the migration SQL
2. If in development, reset: `prisma migrate reset --force`
3. If in production, fix the SQL manually and mark as applied: `prisma migrate resolve --applied <migration_name>`

### Schema drift

If the database schema doesn't match the expected state:

```bash
pnpm --filter @hesabdari/db exec prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma
```
