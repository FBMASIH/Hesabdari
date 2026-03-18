export type ThemeMode = 'light' | 'dark';

type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

export interface ColorPrimitives {
  white: string;
  black: string;
  gray: ColorScale;
  blue: ColorScale;
  green: ColorScale;
  red: ColorScale;
  amber: ColorScale;
  violet: ColorScale;
}

export interface SemanticColors {
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    overlay: string;
  };
  fg: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
  };
  primary: {
    default: string;
    hover: string;
    active: string;
    subtle: string;
    fg: string;
  };
  success: {
    default: string;
    hover: string;
    subtle: string;
    fg: string;
  };
  warning: {
    default: string;
    hover: string;
    subtle: string;
    fg: string;
  };
  danger: {
    default: string;
    hover: string;
    subtle: string;
    fg: string;
  };
  info: {
    default: string;
    hover: string;
    subtle: string;
    fg: string;
  };
}

export interface BrandTokens {
  deep: string;
  mid: string;
  light: string;
  warm: string;
}

export interface GlassTokens {
  bg: string;
  bgHover: string;
  border: string;
  borderActive: string;
  shadow: string;
  shadowHover: string;
  blur: string;
}

/** Complete theme token set — single source of truth for a theme mode */
export interface ThemeTokens {
  semantic: SemanticColors;
  brand: BrandTokens;
  glass: GlassTokens;
}

export interface ColorToken {
  primitive: ColorPrimitives;
  semantic: SemanticColors;
}

export interface TypographyToken {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, string>;
  letterSpacing: Record<string, string>;
}

export type SpacingToken = Record<string, string>;
export type RadiusToken = Record<string, string>;
export type ShadowToken = Record<string, string>;
export type ZIndexToken = Record<string, number>;

export interface MotionToken {
  duration: Record<string, string>;
  easing: Record<string, string>;
}

export type BreakpointToken = Record<string, string>;

export interface Theme {
  color: ColorToken;
  typography: TypographyToken;
  spacing: SpacingToken;
  radius: RadiusToken;
  shadow: ShadowToken;
  zIndex: ZIndexToken;
  motion: MotionToken;
  breakpoint: BreakpointToken;
}
