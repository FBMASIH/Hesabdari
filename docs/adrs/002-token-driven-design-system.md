# ADR-002: Token-Driven Design System

## Status

Accepted

## Context

Enterprise accounting software requires visual consistency, theme support (light/dark), and maintainability across many screens. We need a strategy that prevents design drift.

## Decision

Use a **single source of truth token system** in `packages/design-tokens/` that generates CSS variables, Tailwind theme configuration, and TypeScript types.

## Rationale

- One file change updates the entire visual system
- CSS variables enable runtime theme switching
- Tailwind preset keeps utility classes in sync with tokens
- UI components in `packages/ui/` consume tokens through CSS variables
- No hardcoded magic values in product code
- Storybook can consume the same tokens for documentation

## Consequences

- All color, spacing, typography, and motion values must come from tokens
- Developers must not hardcode visual values in components
- Adding a new token category requires updating the token package and regenerating outputs
- Theme changes are instant and global
