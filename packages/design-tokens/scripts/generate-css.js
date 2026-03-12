import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dynamic import of built output
const { generateCssVariableString } = await import('../dist/css-variables.js');

const css = generateCssVariableString();
const outPath = join(__dirname, '..', 'dist', 'variables.css');

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, css, 'utf-8');

console.log('Generated CSS variables at', outPath);
