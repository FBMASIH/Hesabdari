# Release Checklist

## Pre-release

- [ ] All PRs for the release are merged to `main`
- [ ] `pnpm install --frozen-lockfile` succeeds
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
- [ ] E2E tests pass against staging: `pnpm test:e2e`
- [ ] Database migrations tested against a fresh database
- [ ] Database migrations tested as upgrade from current production schema
- [ ] No pending Prisma schema changes without a migration
- [ ] Environment variables documented and configured in target environment
- [ ] No secrets in codebase (`git log --all -p | grep -i "secret\|password\|token"`)

## Database

- [ ] Back up production database before deployment
- [ ] Run migrations: `pnpm db:migrate`
- [ ] Verify migration success (check table structure)
- [ ] Confirm rollback migration exists and is tested

## Deployment

- [ ] Deploy API
- [ ] Verify health endpoint: `GET /health`
- [ ] Verify Swagger docs load: `GET /api/docs`
- [ ] Deploy web frontend
- [ ] Verify frontend loads and connects to API
- [ ] Verify authentication flow works

## Post-deployment

- [ ] Smoke test critical paths:
  - [ ] Login / logout
  - [ ] Create journal entry
  - [ ] Create invoice
  - [ ] View reports
- [ ] Monitor error rates for 30 minutes
- [ ] Monitor API response times
- [ ] Confirm audit logging is active
- [ ] Tag the release: `git tag v<version>`

## Rollback Plan

If issues are found post-deployment:

1. Revert to previous deployment
2. If migrations were run, execute rollback migration
3. Restore database from backup if data corruption occurred
4. Notify team and document the incident
