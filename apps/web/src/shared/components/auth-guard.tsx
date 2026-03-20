'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/hooks/use-auth';
import { Spinner } from '@hesabdari/ui';

/**
 * Client-side auth guard. Redirects to /login if no access token found.
 *
 * Uses a mounting state to prevent hydration mismatch:
 * Server always renders children (middleware handles server-side protection).
 * Client checks localStorage after mount and redirects if needed.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (!isAuth) {
      router.replace('/login');
    }
  }, [router]);

  if (!mounted) {
    return null;
  }

  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
