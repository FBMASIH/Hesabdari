'use client';

import { Button, Spinner } from '@hesabdari/ui';
import type { ReactNode } from 'react';
import { t } from '@/shared/lib/i18n';

const common = t('common');

export interface FormActionsProps {
  /** Primary submit label. */
  submitLabel: string;
  /** Secondary action (e.g. "Save as Draft"). */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  /** Cancel handler — typically router.back(). */
  onCancel: () => void;
  /** Is the form currently submitting? */
  isSubmitting?: boolean;
  /** Disable submit (e.g. unbalanced journal). */
  submitDisabled?: boolean;
  /** Extra content between secondary and primary buttons. */
  trailing?: ReactNode;
}

export function FormActions({
  submitLabel,
  secondaryAction,
  onCancel,
  isSubmitting = false,
  submitDisabled = false,
  trailing,
}: FormActionsProps) {
  return (
    <div className="flex items-center gap-3 pt-5">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {common.cancel}
      </Button>

      {secondaryAction && (
        <Button
          type="button"
          variant="secondary"
          onClick={secondaryAction.onClick}
          disabled={isSubmitting || secondaryAction.disabled}
        >
          {secondaryAction.label}
        </Button>
      )}

      {trailing}

      <div className="flex-1" />

      <Button
        type="submit"
        disabled={isSubmitting || submitDisabled}
        className="gap-2"
      >
        {isSubmitting && <Spinner size="sm" />}
        {submitLabel}
      </Button>
    </div>
  );
}
