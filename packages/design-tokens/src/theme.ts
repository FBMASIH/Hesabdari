import type { Theme } from './types';
import { colorPrimitives } from './colors';
import { lightSemanticColors } from './themes';
import { typography } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';
import { shadows } from './shadows';
import { zIndex } from './z-index';
import { motion } from './motion';
import { breakpoints } from './breakpoints';

/**
 * The canonical theme definition — single source of truth for the entire design system.
 *
 * All CSS variables, Tailwind theme values, and component styles
 * are derived from this object. To change the design system globally,
 * modify values here.
 */
export const theme: Theme = {
  color: {
    primitive: colorPrimitives,
    semantic: lightSemanticColors,
  },
  typography,
  spacing,
  radius: radii,
  shadow: shadows,
  zIndex,
  motion,
  breakpoint: breakpoints,
};
