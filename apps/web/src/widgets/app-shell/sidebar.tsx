'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@hesabdari/ui';

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'grid' },
  { name: 'Chart of Accounts', href: '/accounting', icon: 'book' },
  { name: 'Journal Entries', href: '/journal-entries', icon: 'file-text' },
  { name: 'Invoices', href: '/invoices', icon: 'receipt' },
  { name: 'Customers', href: '/customers', icon: 'users' },
  { name: 'Vendors', href: '/vendors', icon: 'truck' },
  { name: 'Reports', href: '/reports', icon: 'bar-chart' },
  { name: 'Settings', href: '/settings', icon: 'settings' },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-border-primary bg-bg-secondary">
      <div className="flex h-14 items-center border-b border-border-primary px-6">
        <span className="text-lg font-bold text-fg-primary">Hesabdari</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-subtle text-primary'
                  : 'text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary',
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
