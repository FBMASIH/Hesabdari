/**
 * Shared Tailwind class strings for recurring UI patterns.
 *
 * Extract a pattern here when the exact same class string appears in three or
 * more components. Keep individual constants small and composable — callers
 * can merge them with `cn()` when extra classes are needed.
 */

/** Floating dropdown panel (date pickers, selectors, comboboxes). */
export const DROPDOWN_PANEL =
  'overflow-hidden rounded-xl border-[0.5px] border-border-primary bg-bg-secondary/95 p-1 shadow-lg backdrop-blur-xl';

/** 32px icon circle used in stat cards and link lists. */
export const ICON_CIRCLE = 'flex h-8 w-8 items-center justify-center rounded-xl';

/** Hover / active micro-interaction for card-style navigation links. */
export const LINK_HOVER =
  'transition-all duration-150 hover:bg-bg-tertiary/50 hover:shadow-xs active:scale-[0.98]';

/** Full-height glass panel section (journal status, report shortcuts, charts). */
export const GLASS_PANEL = 'glass-surface-static flex h-full flex-col rounded-2xl p-5';
