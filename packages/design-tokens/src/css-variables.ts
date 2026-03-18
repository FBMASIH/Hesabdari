import type { ThemeTokens } from './types';
import { lightTheme, darkTheme } from './themes';

/** Recursively flatten a nested object into dot-separated keys */
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const cssKey = prefix ? `${prefix}-${key}` : key;
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, cssKey));
    } else {
      result[cssKey] = String(value);
    }
  }
  return result;
}

/** Convert a ThemeTokens object into a flat map of CSS variable name → value */
function themeToVars(theme: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {};

  // Semantic: --color-bg-primary, --color-fg-secondary, etc.
  for (const [k, v] of Object.entries(flattenObject(theme.semantic as unknown as Record<string, unknown>, 'color'))) {
    vars[`--${k}`] = v;
  }

  // Brand: both --brand-deep (legacy/CSS) and --color-brand-deep (Tailwind @theme)
  for (const [k, v] of Object.entries(theme.brand)) {
    vars[`--brand-${k}`] = v;
    vars[`--color-brand-${k}`] = v;
  }

  // Glass: --glass-bg, --glass-bg-hover, --glass-border, etc.
  const glassMap: Record<string, string> = {
    bg: theme.glass.bg,
    'bg-hover': theme.glass.bgHover,
    border: theme.glass.border,
    'border-active': theme.glass.borderActive,
    shadow: theme.glass.shadow,
    'shadow-hover': theme.glass.shadowHover,
    blur: theme.glass.blur,
  };
  for (const [k, v] of Object.entries(glassMap)) {
    vars[`--glass-${k}`] = v;
  }

  return vars;
}

/** Format a CSS rule block */
function formatBlock(selector: string, vars: Record<string, string>): string {
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `${selector} {\n${body}\n}`;
}

/** Generate the CSS variable stylesheet (light :root + dark override) */
export function generateCssVariableString(): string {
  const lightVars = themeToVars(lightTheme);
  const darkVars = themeToVars(darkTheme);

  return [
    '/* Auto-generated from packages/design-tokens/src/themes.ts — DO NOT EDIT */',
    '',
    formatBlock(':root', lightVars),
    '',
    formatBlock('[data-theme="dark"]', darkVars),
    '',
  ].join('\n');
}

/**
 * Generate the Tailwind 4 @theme block with actual light-mode values.
 * Tailwind uses these at build time for JIT utility generation.
 * Runtime dark-mode switching happens via the CSS variable cascade in theme-vars.css.
 */
export function generateThemeTokensString(): string {
  const lightVars = themeToVars(lightTheme);

  const body = Object.entries(lightVars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');

  return [
    '/* Auto-generated Tailwind @theme tokens — DO NOT EDIT */',
    '/* Run: pnpm --filter @hesabdari/design-tokens generate:css */',
    '',
    `@theme {\n${body}\n}`,
    '',
  ].join('\n');
}
