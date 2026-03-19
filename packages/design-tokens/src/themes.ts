import type { SemanticColors, BrandTokens, GlassTokens, ThemeTokens } from './types';

/**
 * Hesabdari design system — "Sapphire & Slate" palette.
 *
 * Design philosophy: Calm Authority
 * - Slate grays (blue undertone) harmonize with sapphire primary
 * - Cool off-white backgrounds reduce eye strain for all-day accounting work
 * - Deep navy text is softer than pure black, easier to read for long sessions
 * - Semantic colors are distinct: blue=action, green=profit, red=loss, amber=caution, cyan=info
 *
 * This file is the SINGLE SOURCE OF TRUTH for all theme colors.
 * globals.css variables are generated from these values — never hand-written.
 */

// ── Semantic Colors ──────────────────────────────

export const lightSemanticColors: SemanticColors = {
  bg: {
    primary: '#F8FAFC' /* Slate-50 — cool off-white, anti-glare */,
    secondary: '#FFFFFF' /* Pure white for cards/inputs */,
    tertiary: '#F1F5F9' /* Slate-100 — subtle depth layer */,
    inverse: '#0F172A' /* Slate-900 — deep navy */,
    overlay: 'rgba(15, 23, 42, 0.45)',
  },
  fg: {
    primary: '#0F172A' /* Slate-900 — deep navy, softer than black */,
    secondary: '#475569' /* Slate-600 — comfortable reading gray */,
    tertiary: '#64748B' /* Slate-500 — hints and labels (WCAG AA 4.6:1 on white) */,
    disabled: '#CBD5E1' /* Slate-300 */,
    inverse: '#FFFFFF',
    link: '#2563EB' /* Blue-600 — matches primary */,
  },
  border: {
    primary: 'rgba(15, 23, 42, 0.10)' /* Slate-900 at 10% */,
    secondary: 'rgba(15, 23, 42, 0.06)' /* Slate-900 at 6% */,
    focus: '#3B82F6' /* Blue-500 — WCAG 3:1 for non-text UI (3.98:1) */,
    error: '#DC2626' /* Red-600 */,
  },
  primary: {
    default: '#2563EB' /* Blue-600 — authoritative sapphire */,
    hover: '#1D4ED8' /* Blue-700 */,
    active: '#1E40AF' /* Blue-800 */,
    subtle: 'rgba(37, 99, 235, 0.08)',
    fg: '#FFFFFF',
  },
  success: {
    default: '#15803D' /* Green-700 — WCAG AA 4.6:1 with white fg */,
    hover: '#166534' /* Green-800 */,
    subtle: 'rgba(22, 163, 74, 0.08)',
    fg: '#FFFFFF',
  },
  warning: {
    default: '#B45309' /* Amber-700 — WCAG AA 4.8:1 with white fg */,
    hover: '#92400E' /* Amber-800 */,
    subtle: 'rgba(217, 119, 6, 0.08)',
    fg: '#FFFFFF',
  },
  danger: {
    default: '#DC2626' /* Red-600 — serious but not aggressive */,
    hover: '#B91C1C' /* Red-700 */,
    subtle: 'rgba(220, 38, 38, 0.08)',
    fg: '#FFFFFF',
  },
  info: {
    default: '#0E7490' /* Cyan-700 — WCAG AA 4.7:1 with white fg */,
    hover: '#155E75' /* Cyan-800 */,
    subtle: 'rgba(8, 145, 178, 0.08)',
    fg: '#FFFFFF',
  },
};

export const darkSemanticColors: SemanticColors = {
  bg: {
    primary: '#0F172A' /* Slate-900 — deep navy, no pure black */,
    secondary: '#1E293B' /* Slate-800 — card surfaces */,
    tertiary: '#334155' /* Slate-700 — elevated surfaces */,
    inverse: '#F1F5F9' /* Slate-100 */,
    overlay: 'rgba(0, 0, 0, 0.60)',
  },
  fg: {
    primary: '#F1F5F9' /* Slate-100 — warm off-white, not pure white */,
    secondary: '#94A3B8' /* Slate-400 */,
    tertiary: '#64748B' /* Slate-500 */,
    disabled: '#475569' /* Slate-600 */,
    inverse: '#0F172A' /* Slate-900 */,
    link: '#60A5FA' /* Blue-400 */,
  },
  border: {
    primary: 'rgba(148, 163, 184, 0.12)' /* Slate-400 at 12% */,
    secondary: 'rgba(148, 163, 184, 0.06)' /* Slate-400 at 6% */,
    focus: '#60A5FA' /* Blue-400 */,
    error: '#F87171' /* Red-400 */,
  },
  primary: {
    default: '#2563EB' /* Blue-600 — same as light for WCAG AA (5.17:1 w/ white) */,
    hover: '#3B82F6' /* Blue-500 */,
    active: '#60A5FA' /* Blue-400 */,
    subtle: 'rgba(37, 99, 235, 0.15)',
    fg: '#FFFFFF',
  },
  success: {
    default: '#22C55E' /* Green-500 */,
    hover: '#4ADE80' /* Green-400 */,
    subtle: 'rgba(34, 197, 94, 0.12)',
    fg: '#0F172A',
  },
  warning: {
    default: '#F59E0B' /* Amber-500 */,
    hover: '#FBBF24' /* Amber-400 */,
    subtle: 'rgba(245, 158, 11, 0.12)',
    fg: '#0F172A',
  },
  danger: {
    default: '#F87171' /* Red-400 — WCAG AA 6.0:1 on Slate-800 */,
    hover: '#FCA5A5' /* Red-300 */,
    subtle: 'rgba(248, 113, 113, 0.12)',
    fg: '#0F172A' /* Dark text on bright red */,
  },
  info: {
    default: '#06B6D4' /* Cyan-500 */,
    hover: '#22D3EE' /* Cyan-400 */,
    subtle: 'rgba(6, 182, 212, 0.12)',
    fg: '#0F172A',
  },
};

// ── Brand Tokens ─────────────────────────────────

export const lightBrand: BrandTokens = {
  deep: '#2563EB' /* Primary sapphire */,
  mid: '#60A5FA' /* Medium blue — charts, secondary accents */,
  light: '#BFDBFE' /* Light blue — subtle backgrounds */,
  warm: '#F8FAFC' /* Page background */,
};

export const darkBrand: BrandTokens = {
  deep: '#3B82F6' /* Brighter sapphire for dark mode */,
  mid: '#60A5FA',
  light: '#93C5FD',
  warm: '#1E293B' /* Card surface */,
};

// ── Glass (Vibrancy Material) Tokens ─────────────

export const lightGlass: GlassTokens = {
  bg: 'rgba(248, 250, 252, 0.78)',
  bgHover: 'rgba(255, 255, 255, 0.92)',
  border: 'rgba(15, 23, 42, 0.06)',
  borderActive: 'rgba(37, 99, 235, 0.30)',
  shadow: '0 0 0 0.5px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.03)',
  shadowHover:
    '0 0 0 0.5px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05), 0 12px 32px -4px rgba(0,0,0,0.08)',
  blur: '20px',
};

export const darkGlass: GlassTokens = {
  bg: 'rgba(30, 41, 59, 0.82)',
  bgHover: 'rgba(51, 65, 85, 0.92)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(59, 130, 246, 0.30)',
  shadow: '0 0 0 0.5px rgba(0,0,0,0.30), 0 2px 8px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.10)',
  shadowHover:
    '0 0 0 0.5px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.15), 0 12px 32px -4px rgba(0,0,0,0.20)',
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
