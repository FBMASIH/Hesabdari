/**
 * Blocking theme initialization script — prevents light→dark flash on page load.
 *
 * Runs synchronously before React hydrates. Reads localStorage and sets
 * data-theme on the root element. Content is a compile-time constant string
 * with no user input — safe for inline script injection.
 *
 * This is the standard pattern used by next-themes, Radix Themes, and
 * other production Next.js theme libraries.
 *
 * Handles three localStorage values:
 * - 'dark'   → always set dark
 * - 'light'  → do nothing (light is the default)
 * - 'system' → check OS preference via matchMedia
 * The condition `t !== 'light'` intentionally covers both 'dark' and 'system'.
 */

const THEME_INIT = [
  '(function(){',
  'try{',
  "var t=localStorage.getItem('theme');",
  "if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))",
  "{document.documentElement.setAttribute('data-theme','dark')}",
  '}catch(e){}',
  '})()',
].join('');

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />;
}
