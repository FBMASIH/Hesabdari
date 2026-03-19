import type { ShadowToken } from './types';

/** macOS-style layered shadows — subtle ring + soft drop + inset highlight */
export const shadows: ShadowToken = {
  xs: '0 0 0 0.5px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.04)',
  sm: '0 0 0 0.5px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06)',
  md: '0 0 0 0.5px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
  lg: '0 0 0 0.5px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.08)',
  xl: '0 0 0 0.5px rgba(0,0,0,0.03), 0 16px 40px rgba(0,0,0,0.1)',
  '2xl': '0 0 0 0.5px rgba(0,0,0,0.02), 0 24px 56px rgba(0,0,0,0.12)',
  glass: '0 0 0 0.5px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
  'glass-hover': '0 0 0 0.5px rgba(0,0,0,0.06), 0 8px 28px rgba(0,0,0,0.08)',
  'glass-active': '0 0 0 0.5px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)',
  'card-hover':
    '0 0 0 0.5px rgba(0,0,0,0.04), 0 8px 24px -4px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.04)',
  inner: 'inset 0 1px 2px rgba(0,0,0,0.04)',
  none: 'none',

  /* Brand-colored glow — primary CTA buttons (sapphire blue) */
  'brand-glow': '0 1px 3px rgba(0,0,0,0.12), 0 2px 8px -1px rgba(37,99,235,0.30)',
  'brand-glow-hover': '0 2px 6px rgba(0,0,0,0.12), 0 6px 16px -2px rgba(37,99,235,0.35)',

  /* Danger-colored glow — destructive CTA buttons */
  'danger-glow': '0 1px 3px rgba(0,0,0,0.12), 0 2px 8px -1px rgba(220,38,38,0.30)',
  'danger-glow-hover': '0 2px 6px rgba(0,0,0,0.12), 0 6px 16px -2px rgba(220,38,38,0.35)',

  /* Subtle brand ring — active badges, pills, brand accents */
  'brand-ring': '0 1px 4px rgba(37,99,235,0.25)',

  /* Input focus — inset + brand ring (sapphire) */
  'focus-brand': 'inset 0 1px 2px rgba(0,0,0,0.04), 0 0 0 3px rgba(37,99,235,0.15)',

  /* Active/pressed state */
  pressed: '0 1px 2px rgba(0,0,0,0.12)',
};
