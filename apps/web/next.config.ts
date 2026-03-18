import type { NextConfig } from 'next';

/** Backend URL — only used server-side for the rewrite proxy */
const API_BACKEND = process.env.API_BACKEND_URL ?? 'http://localhost:4000';

const isDev = process.env.NODE_ENV === 'development';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'", // Tailwind injects styles
      "img-src 'self' data: blob:",
      "font-src 'self'",
      isDev
        ? "connect-src 'self' ws: wss: http://localhost:* http://127.0.0.1:*"  // Dev: allow HMR websockets + local API
        : "connect-src 'self'",  // Prod: API goes through rewrite proxy — same origin only
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ['@hesabdari/ui', '@hesabdari/design-tokens'],
  typedRoutes: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        // Proxy all /api/* requests to the backend server.
        // The browser never sees the backend URL — works from any machine.
        source: '/api/:path*',
        destination: `${API_BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
