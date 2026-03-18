'use client';

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import {
  ToastProvider as RadixToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastViewport,
} from '@hesabdari/ui';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES = {
  default: {
    toast: 'toast-default',
    accent: 'bg-brand-deep',
    title: 'text-fg-primary',
  },
  success: {
    toast: 'toast-success',
    accent: 'bg-success-default',
    title: 'text-success-default',
  },
  error: {
    toast: 'toast-error',
    accent: 'bg-danger-default',
    title: 'text-danger-default',
  },
} as const;

export function ToastManager({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const handleOpenChange = useCallback((id: string, open: boolean) => {
    if (!open) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <RadixToastProvider duration={4000}>
        {children}
        {toasts.map((toast) => {
          const v = VARIANT_STYLES[toast.variant ?? 'default'];
          return (
            <Toast
              key={toast.id}
              onOpenChange={(open) => handleOpenChange(toast.id, open)}
              className={v.toast}
            >
              <div className={`absolute inset-y-0 start-0 w-[3px] rounded-full ${v.accent}`} />
              <div className="flex flex-col gap-0.5 ps-2">
                <ToastTitle className={v.title}>
                  {toast.title}
                </ToastTitle>
                {toast.description && (
                  <ToastDescription>{toast.description}</ToastDescription>
                )}
              </div>
            </Toast>
          );
        })}
        <ToastViewport />
      </RadixToastProvider>
    </ToastContext.Provider>
  );
}

/** Access the toast system from any client component. */
export function useAppToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useAppToast must be used within ToastManager');
  }
  return ctx;
}
