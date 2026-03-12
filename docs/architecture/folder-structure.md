# Folder Structure Guide

## Root Level

| Path                      | Purpose                                                  |
| ------------------------- | -------------------------------------------------------- |
| `apps/web/`               | Next.js frontend application                             |
| `apps/api/`               | NestJS backend application                               |
| `packages/design-tokens/` | Design system token definitions (single source of truth) |
| `packages/ui/`            | Shared React UI components                               |
| `packages/db/`            | Prisma schema, migrations, seeds                         |
| `packages/shared/`        | Shared TypeScript types and utilities                    |
| `packages/contracts/`     | API contract schemas (Zod)                               |
| `packages/api-client/`    | Typed HTTP client for the API                            |
| `packages/config/`        | Shared tool configurations                               |
| `docs/`                   | Project documentation                                    |
| `.github/`                | CI/CD workflows                                          |

## How Design Tokens Control the UI

1. **Token source**: `packages/design-tokens/src/theme.ts` defines all visual primitives
2. **CSS variables**: Generated from tokens, applied to `:root` and `[data-theme="dark"]`
3. **Tailwind preset**: `packages/design-tokens/src/tailwind-preset.ts` maps tokens to Tailwind classes
4. **UI components**: `packages/ui/` uses token-derived CSS variable classes
5. **To change the design**: Modify `theme.ts` → rebuild → entire UI updates

## How to Add a New Backend Module

1. Create directory: `apps/api/src/modules/<name>/`
2. Add internal layers: `domain/`, `application/`, `infrastructure/`, `presentation/`, `tests/`
3. Create the NestJS module file: `<name>.module.ts`
4. Register it in `apps/api/src/app.module.ts`
5. Add domain entities in `domain/entities/`
6. Define repository interfaces in `domain/repositories/`
7. Implement services in `application/services/`
8. Implement repositories in `infrastructure/repositories/`
9. Create controllers in `presentation/http/controllers/`
10. Add tests in `tests/`

## How to Add a New Frontend Feature

1. Create directory: `apps/web/src/features/<name>/`
2. Add components: `components/`
3. Add hooks if needed: `hooks/`
4. Add route pages: `apps/web/src/app/(dashboard)/<name>/page.tsx`
5. Export from barrel: `index.ts`
6. Features must only depend on `shared/` and `entities/`, not on other features
