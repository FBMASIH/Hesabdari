import { Button, EmptyState, IconDangerTriangle } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { ApiError } from '@hesabdari/api-client';

const msgs = t('messages');

export interface DataErrorStateProps {
  /** The error object from TanStack Query, an Error instance, or a string message. */
  error: unknown;
  /** Called when the user clicks the retry button. Typically `refetch` from useQuery. */
  onRetry?: () => void;
  className?: string;
}

export function DataErrorState({ error, onRetry, className }: DataErrorStateProps) {
  const rawMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : msgs.networkError;

  // Avoid leaking English error messages or backend error codes in the Persian UI
  const isLikelyEnglish =
    rawMessage.length > 0 && /^[A-Za-z0-9_\s.,!?:;'"()/\-]+$/.test(rawMessage);
  const message = !rawMessage || isLikelyEnglish ? msgs.networkError : rawMessage;

  return (
    <div className={className ?? 'glass-surface-static overflow-hidden rounded-2xl'}>
      <EmptyState
        icon={<IconDangerTriangle size={20} />}
        title={msgs.fetchError}
        description={message}
        action={
          onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              {msgs.retry}
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
