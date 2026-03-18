import { ErrorBoundary } from '@hesabdari/ui';
import { JournalEntryForm } from '@/features/journal';

export default function NewJournalEntryPage() {
  return (
    <ErrorBoundary>
      <JournalEntryForm />
    </ErrorBoundary>
  );
}
