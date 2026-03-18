import { AppShell } from '@/widgets/app-shell';
import { AuthGuard } from '@/shared/components/auth-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
