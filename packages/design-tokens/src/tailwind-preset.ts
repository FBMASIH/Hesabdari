import { theme } from './theme';

function cssVar(name: string): string {
  return `var(--color-${name})`;
}

/**
 * Tailwind CSS preset derived from the design token source of truth.
 * Import this preset in your Tailwind config to keep Tailwind in sync with tokens.
 */
export const hesabdariPreset = {
  theme: {
    extend: {
      colors: {
        bg: {
          primary: cssVar('bg-primary'),
          secondary: cssVar('bg-secondary'),
          tertiary: cssVar('bg-tertiary'),
          inverse: cssVar('bg-inverse'),
        },
        fg: {
          primary: cssVar('fg-primary'),
          secondary: cssVar('fg-secondary'),
          tertiary: cssVar('fg-tertiary'),
          disabled: cssVar('fg-disabled'),
          inverse: cssVar('fg-inverse'),
          link: cssVar('fg-link'),
        },
        border: {
          DEFAULT: cssVar('border-primary'),
          primary: cssVar('border-primary'),
          secondary: cssVar('border-secondary'),
          focus: cssVar('border-focus'),
          error: cssVar('border-error'),
        },
        primary: {
          DEFAULT: cssVar('primary-default'),
          hover: cssVar('primary-hover'),
          active: cssVar('primary-active'),
          subtle: cssVar('primary-subtle'),
          fg: cssVar('primary-fg'),
        },
        success: {
          DEFAULT: cssVar('success-default'),
          hover: cssVar('success-hover'),
          subtle: cssVar('success-subtle'),
          fg: cssVar('success-fg'),
        },
        warning: {
          DEFAULT: cssVar('warning-default'),
          hover: cssVar('warning-hover'),
          subtle: cssVar('warning-subtle'),
          fg: cssVar('warning-fg'),
        },
        danger: {
          DEFAULT: cssVar('danger-default'),
          hover: cssVar('danger-hover'),
          subtle: cssVar('danger-subtle'),
          fg: cssVar('danger-fg'),
        },
        info: {
          DEFAULT: cssVar('info-default'),
          hover: cssVar('info-hover'),
          subtle: cssVar('info-subtle'),
          fg: cssVar('info-fg'),
        },
      },
      fontFamily: {
        sans: [theme.typography.fontFamily.sans],
        mono: [theme.typography.fontFamily.mono],
      },
      fontSize: theme.typography.fontSize,
      fontWeight: Object.fromEntries(
        Object.entries(theme.typography.fontWeight).map(([k, v]) => [k, String(v)]),
      ),
      lineHeight: theme.typography.lineHeight,
      letterSpacing: theme.typography.letterSpacing,
      spacing: theme.spacing,
      borderRadius: theme.radius,
      boxShadow: theme.shadow,
      zIndex: Object.fromEntries(Object.entries(theme.zIndex).map(([k, v]) => [k, String(v)])),
      transitionDuration: theme.motion.duration,
      transitionTimingFunction: theme.motion.easing,
      screens: theme.breakpoint,
    },
  },
};

export default hesabdariPreset;
