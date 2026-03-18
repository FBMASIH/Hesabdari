import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCssVariableString, generateThemeTokensString } from '../src/css-variables.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webAppDir = join(__dirname, '..', '..', '..', 'apps', 'web', 'src', 'app');
const distDir = join(__dirname, '..', 'dist');

mkdirSync(webAppDir, { recursive: true });
mkdirSync(distDir, { recursive: true });

// theme-vars.css — runtime CSS variables (:root + [data-theme="dark"])
const vars = generateCssVariableString();
writeFileSync(join(webAppDir, 'theme-vars.css'), vars, 'utf-8');
writeFileSync(join(distDir, 'variables.css'), vars, 'utf-8');

// theme-tokens.css — Tailwind @theme block with actual light-mode values
const tokens = generateThemeTokensString();
writeFileSync(join(webAppDir, 'theme-tokens.css'), tokens, 'utf-8');

console.log('Generated theme-vars.css + theme-tokens.css');
