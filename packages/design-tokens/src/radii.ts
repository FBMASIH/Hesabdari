import type { RadiusToken } from './types';

/** macOS-style border radii — larger, more rounded */
export const radii: RadiusToken = {
  none: '0',
  sm: '4px',       // small pills, tags
  md: '8px',       // inputs, buttons
  lg: '10px',      // cards, panels
  xl: '14px',      // modal, large cards
  '2xl': '18px',   // hero cards
  '3xl': '22px',   // large panels, sheets
  full: '9999px',
};
