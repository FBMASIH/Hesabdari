'use client';

import type { ReactNode } from 'react';
import { ErrorBoundary } from '@hesabdari/ui';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { ToastManager } from './toast-provider';
import { initPersianValidation } from '@/shared/lib/zod-error-map';

// Set Persian Zod error map globally — all validation errors will be in Persian
initPersianValidation();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastManager>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ToastManager>
      </QueryProvider>
    </ThemeProvider>
  );
}
