import type { SemanticColors } from './types';
import { lightSemanticColors, darkSemanticColors } from './themes';

function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const cssKey = prefix ? `${prefix}-${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, any>, cssKey));
    } else {
      result[cssKey] = String(value);
    }
  }
  return result;
}

function semanticToCssVars(semantic: SemanticColors, prefix = '--color'): Record<string, string> {
  return flattenObject(semantic as unknown as Record<string, any>, prefix);
}

export function generateLightCssVars(): Record<string, string> {
  return semanticToCssVars(lightSemanticColors);
}

export function generateDarkCssVars(): Record<string, string> {
  return semanticToCssVars(darkSemanticColors);
}

export function generateCssVariableString(): string {
  const lightVars = generateLightCssVars();
  const darkVars = generateDarkCssVars();

  const lightBlock = Object.entries(lightVars)
    .map(([key, value]) => `  --color-${key}: ${value};`)
    .join('\n');

  const darkBlock = Object.entries(darkVars)
    .map(([key, value]) => `  --color-${key}: ${value};`)
    .join('\n');

  return `:root {\n${lightBlock}\n}\n\n[data-theme="dark"] {\n${darkBlock}\n}\n`;
}
