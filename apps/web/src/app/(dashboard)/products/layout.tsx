'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const nav = t('nav');
const warehouse = t('warehouse');

const sectionTabs = [
  { label: nav.products, href: '/products' },
  { label: warehouse.title, href: '/products/warehouses' },
] as const;

export default function ProductsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === '/products') {
      // Active for /products, /products/new, /products/[id]/edit — but NOT /products/warehouses/*
      return (
        pathname === '/products' ||
        (pathname.startsWith('/products') && !pathname.startsWith('/products/warehouses'))
      );
    }
    return pathname.startsWith(href);
  }

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label={nav.inventory} className="flex gap-1">
        {sectionTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors',
              isActive(tab.href)
                ? 'bg-fg-primary text-primary-fg'
                : 'text-fg-tertiary hover:text-fg-primary',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
