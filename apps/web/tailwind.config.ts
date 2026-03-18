import type { Config } from 'tailwindcss';
import { hesabdariPreset } from '@hesabdari/design-tokens/tailwind-preset';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  presets: [hesabdariPreset],
};

export default config;
