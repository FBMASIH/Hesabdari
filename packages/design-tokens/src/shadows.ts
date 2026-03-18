import type { ShadowToken } from './types';

/** macOS-style layered shadows — subtle ring + soft drop */
export const shadows: ShadowToken = {
  xs: '0 0 0 0.5px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.04)',
  sm: '0 0 0 0.5px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06)',
  md: '0 0 0 0.5px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
  lg: '0 0 0 0.5px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.08)',
  xl: '0 0 0 0.5px rgba(0,0,0,0.03), 0 16px 40px rgba(0,0,0,0.1)',
  '2xl': '0 0 0 0.5px rgba(0,0,0,0.02), 0 24px 56px rgba(0,0,0,0.12)',
  glass: '0 0 0 0.5px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
  'glass-hover': '0 0 0 0.5px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
  'glass-active': '0 0 0 0.5px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)',
  inner: 'inset 0 1px 2px rgba(0,0,0,0.04)',
  none: 'none',
};
