import { ErrorBoundary } from '@hesabdari/ui';
import { JournalEntryListPage } from '@/features/journal';

export default function JournalEntriesPage() {
  return (
    <ErrorBoundary>
      <JournalEntryListPage />
    </ErrorBoundary>
  );
}
