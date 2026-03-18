import type { SemanticColors, BrandTokens, GlassTokens, ThemeTokens } from './types';

/**
 * Hesabdari design system — macOS Human Interface inspired.
 *
 * This file is the SINGLE SOURCE OF TRUTH for all theme colors.
 * globals.css variables are generated from these values — never hand-written.
 */

// ── Semantic Colors ──────────────────────────────

export const lightSemanticColors: SemanticColors = {
  bg: {
    primary: '#F7F8F0',
    secondary: '#FFFFFF',
    tertiary: '#EDF0E6',
    inverse: '#1D2B36',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  fg: {
    primary: '#1D2B36',
    secondary: '#4A6274',
    tertiary: '#8DA4B4',
    disabled: '#B8C8D4',
    inverse: '#FFFFFF',
    link: '#4A8DB8',
  },
  border: {
    primary: 'rgba(53, 88, 114, 0.14)',
    secondary: 'rgba(53, 88, 114, 0.07)',
    focus: '#7AACCE',
    error: '#D64545',
  },
  primary: {
    default: '#4A8DB8',
    hover: '#3D7BA6',
    active: '#356A94',
    subtle: 'rgba(122, 172, 206, 0.1)',
    fg: '#FFFFFF',
  },
  success: {
    default: '#34C759',
    hover: '#2DB84E',
    subtle: 'rgba(52, 199, 89, 0.08)',
    fg: '#FFFFFF',
  },
  warning: {
    default: '#FF9500',
    hover: '#E68600',
    subtle: 'rgba(255, 149, 0, 0.08)',
    fg: '#FFFFFF',
  },
  danger: {
    default: '#FF3B30',
    hover: '#E6352B',
    subtle: 'rgba(255, 59, 48, 0.08)',
    fg: '#FFFFFF',
  },
  info: {
    default: '#5AC8FA',
    hover: '#4FB8E8',
    subtle: 'rgba(90, 200, 250, 0.08)',
    fg: '#FFFFFF',
  },
};

export const darkSemanticColors: SemanticColors = {
  bg: {
    primary: '#111B22',
    secondary: '#1A2830',
    tertiary: '#243540',
    inverse: '#E8ECE0',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
  fg: {
    primary: '#E8ECE0',
    secondary: '#8DA4B4',
    tertiary: '#4E6878',
    disabled: '#3A4F5E',
    inverse: '#111B22',
    link: '#9CD5FF',
  },
  border: {
    primary: 'rgba(156, 213, 255, 0.12)',
    secondary: 'rgba(156, 213, 255, 0.06)',
    focus: '#9CD5FF',
    error: '#FF6B6B',
  },
  primary: {
    default: '#4A8DB8',
    hover: '#5CA0CC',
    active: '#7AACCE',
    subtle: 'rgba(74, 141, 184, 0.15)',
    fg: '#FFFFFF',
  },
  success: {
    default: '#30D158',
    hover: '#4ADE6E',
    subtle: 'rgba(48, 209, 88, 0.12)',
    fg: '#1C1C1E',
  },
  warning: {
    default: '#FF9F0A',
    hover: '#FFB340',
    subtle: 'rgba(255, 159, 10, 0.12)',
    fg: '#1C1C1E',
  },
  danger: {
    default: '#FF453A',
    hover: '#FF6961',
    subtle: 'rgba(255, 69, 58, 0.12)',
    fg: '#FFFFFF',
  },
  info: {
    default: '#64D2FF',
    hover: '#7EDAFF',
    subtle: 'rgba(100, 210, 255, 0.12)',
    fg: '#1C1C1E',
  },
};

// ── Brand Tokens ─────────────────────────────────

export const lightBrand: BrandTokens = {
  deep: '#4A8DB8',
  mid: '#7AACCE',
  light: '#9CD5FF',
  warm: '#F7F8F0',
};

export const darkBrand: BrandTokens = {
  deep: '#4A8DB8',
  mid: '#7AACCE',
  light: '#9CD5FF',
  warm: '#1A2830',
};

// ── Glass (Vibrancy Material) Tokens ─────────────

export const lightGlass: GlassTokens = {
  bg: 'rgba(247, 248, 240, 0.78)',
  bgHover: 'rgba(247, 248, 240, 0.88)',
  border: 'rgba(53, 88, 114, 0.08)',
  borderActive: 'rgba(74, 141, 184, 0.35)',
  shadow: '0 0 0 0.5px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
  shadowHover: '0 0 0 0.5px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
  blur: '20px',
};

export const darkGlass: GlassTokens = {
  bg: 'rgba(44, 44, 46, 0.78)',
  bgHover: 'rgba(44, 44, 46, 0.88)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(10, 132, 255, 0.3)',
  shadow: '0 0 0 0.5px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.15)',
  shadowHover: '0 0 0 0.5px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.2)',
  blur: '20px',
};

// ── Complete Theme Exports ───────────────────────

export const lightTheme: ThemeTokens = {
  semantic: lightSemanticColors,
  brand: lightBrand,
  glass: lightGlass,
};

export const darkTheme: ThemeTokens = {
  semantic: darkSemanticColors,
  brand: darkBrand,
  glass: darkGlass,
};
