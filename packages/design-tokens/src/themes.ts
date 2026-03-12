import type { SemanticColors } from './types';
import { colorPrimitives } from './colors';

export const lightSemanticColors: SemanticColors = {
  bg: {
    primary: colorPrimitives.white,
    secondary: colorPrimitives.gray[50],
    tertiary: colorPrimitives.gray[100],
    inverse: colorPrimitives.gray[900],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  fg: {
    primary: colorPrimitives.gray[900],
    secondary: colorPrimitives.gray[600],
    tertiary: colorPrimitives.gray[500],
    disabled: colorPrimitives.gray[400],
    inverse: colorPrimitives.white,
    link: colorPrimitives.blue[600],
  },
  border: {
    primary: colorPrimitives.gray[200],
    secondary: colorPrimitives.gray[100],
    focus: colorPrimitives.blue[500],
    error: colorPrimitives.red[500],
  },
  primary: {
    default: colorPrimitives.blue[600],
    hover: colorPrimitives.blue[700],
    active: colorPrimitives.blue[800],
    subtle: colorPrimitives.blue[50],
    fg: colorPrimitives.white,
  },
  success: {
    default: colorPrimitives.green[600],
    hover: colorPrimitives.green[700],
    subtle: colorPrimitives.green[50],
    fg: colorPrimitives.white,
  },
  warning: {
    default: colorPrimitives.amber[500],
    hover: colorPrimitives.amber[600],
    subtle: colorPrimitives.amber[50],
    fg: colorPrimitives.white,
  },
  danger: {
    default: colorPrimitives.red[600],
    hover: colorPrimitives.red[700],
    subtle: colorPrimitives.red[50],
    fg: colorPrimitives.white,
  },
  info: {
    default: colorPrimitives.blue[500],
    hover: colorPrimitives.blue[600],
    subtle: colorPrimitives.blue[50],
    fg: colorPrimitives.white,
  },
};

export const darkSemanticColors: SemanticColors = {
  bg: {
    primary: colorPrimitives.gray[950],
    secondary: colorPrimitives.gray[900],
    tertiary: colorPrimitives.gray[800],
    inverse: colorPrimitives.gray[50],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  fg: {
    primary: colorPrimitives.gray[50],
    secondary: colorPrimitives.gray[400],
    tertiary: colorPrimitives.gray[500],
    disabled: colorPrimitives.gray[600],
    inverse: colorPrimitives.gray[900],
    link: colorPrimitives.blue[400],
  },
  border: {
    primary: colorPrimitives.gray[800],
    secondary: colorPrimitives.gray[700],
    focus: colorPrimitives.blue[500],
    error: colorPrimitives.red[500],
  },
  primary: {
    default: colorPrimitives.blue[500],
    hover: colorPrimitives.blue[400],
    active: colorPrimitives.blue[300],
    subtle: colorPrimitives.blue[950],
    fg: colorPrimitives.white,
  },
  success: {
    default: colorPrimitives.green[500],
    hover: colorPrimitives.green[400],
    subtle: colorPrimitives.green[950],
    fg: colorPrimitives.white,
  },
  warning: {
    default: colorPrimitives.amber[500],
    hover: colorPrimitives.amber[400],
    subtle: colorPrimitives.amber[950],
    fg: colorPrimitives.white,
  },
  danger: {
    default: colorPrimitives.red[500],
    hover: colorPrimitives.red[400],
    subtle: colorPrimitives.red[950],
    fg: colorPrimitives.white,
  },
  info: {
    default: colorPrimitives.blue[500],
    hover: colorPrimitives.blue[400],
    subtle: colorPrimitives.blue[950],
    fg: colorPrimitives.white,
  },
};

export const lightTheme = {
  semantic: lightSemanticColors,
};

export const darkTheme = {
  semantic: darkSemanticColors,
};
