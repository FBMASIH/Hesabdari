import type { ReactNode } from 'react';
import { UtilityBar } from './utility-bar';
import { PrimaryNav } from './primary-nav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="ambient-bg flex min-h-screen flex-col">
      <UtilityBar />
      <PrimaryNav />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 pt-2 pb-10">{children}</main>
    </div>
  );
}
