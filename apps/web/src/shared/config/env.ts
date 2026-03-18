export const env = {
  /** API base URL — empty string means same origin (via Next.js rewrite proxy) */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Hesabdari',
} as const;
