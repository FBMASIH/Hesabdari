import { AuthDecoration } from '@/features/auth/components/auth-decoration';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="auth-card grid w-full max-w-[940px] overflow-hidden rounded-3xl lg:grid-cols-[1.1fr_1fr] lg:min-h-[620px]">
        <div className="flex flex-col overflow-hidden">{children}</div>
        <AuthDecoration />
      </div>
    </div>
  );
}
