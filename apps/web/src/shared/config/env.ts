export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Hesabdari',
} as const;
