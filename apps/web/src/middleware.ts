import { NextResponse, type NextRequest } from 'next/server';

/**
 * Server-side route protection.
 *
 * Checks for `auth_session` cookie (set by useAuthStore.setTokens).
 * Redirects unauthenticated users to /login for all dashboard routes.
 * Public routes (/login) bypass the check.
 *
 * Note: The cookie only signals "user has logged in" — actual JWT
 * validation happens at the API level. This prevents the flash-of-
 * content that the client-side AuthGuard alone cannot prevent.
 */
/** Params that must NEVER appear in a URL — strip immediately */
const SENSITIVE_PARAMS = ['password', 'token', 'secret', 'access_token', 'refresh_token', 'api_key', 'apikey', 'authorization', 'jwt', 'session_id', 'credential'];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Public routes — no auth required (let /api routes pass through untouched)
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Security: strip any sensitive params from non-public URLs
  const hasSensitive = SENSITIVE_PARAMS.some((p) => searchParams.has(p));
  if (hasSensitive) {
    const clean = request.nextUrl.clone();
    SENSITIVE_PARAMS.forEach((p) => clean.searchParams.delete(p));
    return NextResponse.redirect(clean);
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('auth_session');
  if (!authCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
