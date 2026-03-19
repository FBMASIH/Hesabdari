'use client';

import { Badge } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const common = t('common');

export interface ActiveBadgeProps {
  isActive: boolean;
}

/** Status badge for the common active/inactive boolean pattern. */
export function ActiveBadge({ isActive }: ActiveBadgeProps) {
  return (
    <Badge variant={isActive ? 'success' : 'danger'}>
      {isActive ? common.active : common.inactive}
    </Badge>
  );
}
