import { ErrorBoundary } from '@hesabdari/ui';
import { BankAccountForm } from '@/features/treasury';

export default function NewBankAccountPage() {
  return (
    <ErrorBoundary>
      <BankAccountForm />
    </ErrorBoundary>
  );
}
