'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './button';
import { IconDangerTriangle } from '../icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI. If omitted, uses default Persian error message. */
  fallback?: ReactNode;
  /** Called when an error is caught. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Title shown in default fallback. Default: 'خطای غیرمنتظره' */
  errorTitle?: string;
  /** Message shown in default fallback. Default: 'مشکلی در نمایش این بخش پیش آمده است.' */
  errorMessage?: string;
  /** Retry button label. Default: 'تلاش مجدد' */
  retryLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center" role="alert">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle">
            <IconDangerTriangle size={24} className="text-danger-default" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-fg-primary">{this.props.errorTitle ?? 'خطای غیرمنتظره'}</h3>
            <p className="mt-1 text-sm text-fg-secondary">
              {this.props.errorMessage ?? 'مشکلی در نمایش این بخش پیش آمده است.'}
            </p>
          </div>
          <Button variant="default" size="md" onClick={this.handleRetry}>
            {this.props.retryLabel ?? 'تلاش مجدد'}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
