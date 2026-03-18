import { ErrorBoundary } from '@hesabdari/ui';
import { SettingsPage } from '@/features/settings';

export default function SettingsRoute() {
  return (
    <ErrorBoundary>
      <SettingsPage />
    </ErrorBoundary>
  );
}
