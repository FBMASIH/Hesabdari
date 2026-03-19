'use client';

import { Button, IconPen, IconTrash } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const common = t('common');

export interface TableRowActionsProps {
  /** Navigate to the edit page for this row. */
  onEdit?: () => void;
  /** Open the delete confirmation dialog for this row. */
  onDelete?: () => void;
  /** Disable the delete button (e.g. while mutation is in-flight). */
  deleteDisabled?: boolean;
}

export function TableRowActions({ onEdit, onDelete, deleteDisabled }: TableRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          aria-label={common.edit}
          title={common.edit}
        >
          <IconPen size={14} />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="hover:bg-danger-subtle hover:text-danger-default"
          disabled={deleteDisabled}
          onClick={onDelete}
          aria-label={common.delete}
          title={common.delete}
        >
          <IconTrash size={14} />
        </Button>
      )}
    </div>
  );
}
