'use client';

import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { IconInfoCircle, IconClose } from '../icons';

export interface FormErrorBannerProps {
  /** Error message(s) to display. */
  message: string | string[];
  className?: string;
  /** Allow user to dismiss the banner. Default: true */
  dismissable?: boolean;
  /** Aria-label for the dismiss button. Default: 'بستن' */
  dismissLabel?: string;
}

export function FormErrorBanner({ message, className, dismissable = true, dismissLabel = 'بستن' }: FormErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const messageKey = Array.isArray(message) ? message.join('\0') : message;
  useEffect(() => {
    setDismissed(false);
  }, [messageKey]);

  if (dismissed) return null;

  const messages = Array.isArray(message) ? message : [message];
  if (messages.length === 0) return null;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-danger-default/20 bg-danger-subtle p-3',
        className,
      )}
    >
      <IconInfoCircle size={16} className="mt-0.5 flex-shrink-0 text-danger-default" />
      <div className="flex-1">
        {messages.length === 1 ? (
          <p className="text-sm text-danger-default">{messages[0]}</p>
        ) : (
          <ul className="list-inside list-disc space-y-1">
            {messages.map((msg, i) => (
              <li key={i} className="text-sm text-danger-default">{msg}</li>
            ))}
          </ul>
        )}
      </div>
      {dismissable && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-danger-default/60 transition-colors hover:text-danger-default"
          aria-label={dismissLabel}
        >
          <IconClose size={16} />
        </button>
      )}
    </div>
  );
}
