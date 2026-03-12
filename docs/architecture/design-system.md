# Design System Architecture

## Single Source of Truth

The design system is governed by a single canonical token file:

```
packages/design-tokens/src/theme.ts
```

This file composes all token categories into the authoritative `Theme` object.

## Token Categories

| Category    | File             | What it defines                             |
| ----------- | ---------------- | ------------------------------------------- |
| Colors      | `colors.ts`      | Primitive color palette                     |
| Themes      | `themes.ts`      | Light and dark semantic color mappings      |
| Typography  | `typography.ts`  | Font families, sizes, weights, line heights |
| Spacing     | `spacing.ts`     | Spacing scale (0 to 96)                     |
| Radii       | `radii.ts`       | Border radius values                        |
| Shadows     | `shadows.ts`     | Box shadow tokens                           |
| Z-Index     | `z-index.ts`     | Layering system                             |
| Motion      | `motion.ts`      | Animation durations and easings             |
| Breakpoints | `breakpoints.ts` | Responsive breakpoints                      |

## Output Chain

```
theme.ts (source of truth)
    ├── CSS variables → globals.css (:root / [data-theme="dark"])
    ├── Tailwind preset → tailwind.config.ts
    ├── TypeScript types → component authoring
    └── Storybook theme → (future)
```

## How to Change a Color

1. Edit the color in `packages/design-tokens/src/colors.ts` (primitive) or `themes.ts` (semantic)
2. The change flows to CSS variables, Tailwind classes, and UI components automatically
3. No need to edit individual component files

## UI Component Library

`packages/ui/` contains all shared components:

- Button, Input, Textarea, Select, Checkbox
- Dialog, Card, Badge, Table
- FormField, Toast
- All components use token-derived CSS variable classes
- All components accept Radix UI accessibility primitives where applicable
