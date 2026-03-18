'use client';

import { createContext, useContext, useCallback, useState, useEffect, useRef, type ReactNode } from 'react';
import {
  ToastProvider as RadixToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastViewport,
  ToastClose,
  IconInfoCircle,
  IconCheck,
  IconClose,
} from '@hesabdari/ui';

/* ── Types ─────────────────────────────────────── */

type ToastVariant = 'default' | 'success' | 'error';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

/* ── Context ───────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

/* ── Variant config (icon + colors) ────────────── */

const VARIANT_CONFIG = {
  default: {
    className: 'toast-variant-default',
    icon: <IconInfoCircle size={18} />,
  },
  success: {
    className: 'toast-variant-success',
    icon: <IconCheck size={18} />,
  },
  error: {
    className: 'toast-variant-error',
    icon: <IconClose size={18} />,
  },
} as const;

const TOAST_DURATION = 4000;

/* ── Progress bar (auto-dismiss indicator) ──── */

function ToastProgress({ duration }: { duration: number }) {
  const [progress, setProgress] = useState(100);
  const rafRef = useRef(0);

  useEffect(() => {
    // Respect reduced motion — show bar at 0 immediately
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(0);
      return;
    }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  return (
    <div className="toast-progress-track">
      <div className="toast-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}

/* ── App icon ──────────────────────────────── */

function AppIcon({ variant }: { variant: ToastVariant }) {
  const v = VARIANT_CONFIG[variant];
  // Variant class is on the <Toast> ancestor — keep this element clean for CSS descendant selectors
  return (
    <div className="toast-app-icon">
      {v.icon}
    </div>
  );
}

/* ── ToastManager ──────────────────────────── */

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
      {/* swipeDirection="left" for RTL layout — swipe towards inline-end to dismiss */}
      <RadixToastProvider duration={TOAST_DURATION} swipeDirection="left">
        {children}
        {toasts.map((toast) => {
          const variant = toast.variant ?? 'default';
          const cfg = VARIANT_CONFIG[variant];
          return (
            <Toast
              key={toast.id}
              onOpenChange={(open) => handleOpenChange(toast.id, open)}
              className={cfg.className}
            >
              {/* Variant icon */}
              <AppIcon variant={variant} />

              {/* Content */}
              <div className="flex flex-1 flex-col gap-0.5 pe-5">
                <ToastTitle>{toast.title}</ToastTitle>
                {toast.description && (
                  <ToastDescription>{toast.description}</ToastDescription>
                )}
              </div>

              {/* Close button — visible on hover */}
              <ToastClose />

              {/* Auto-dismiss progress bar */}
              <ToastProgress duration={TOAST_DURATION} />
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
