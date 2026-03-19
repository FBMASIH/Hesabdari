'use client';

import { useState, useEffect, useRef, useMemo, type ReactNode, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  cn,
  IconMagnifer,
  IconHome,
  IconCart,
  IconWallet,
  IconBox,
  IconChart,
  IconDocument,
  IconUser,
  IconDelivery,
  IconBook,
  IconScale,
  IconAddCircle,
  IconChevronLeft,
  IconSettings,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

// ── Types ───────────────────────────────────────

interface SpotlightItem {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  group: 'navigation' | 'action';
  keywords: string[];
  /** Navigate to path or execute a callback */
  action: string | (() => void);
}

interface SpotlightSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── i18n ────────────────────────────────────────

const common = t('common');
const nav = t('nav');
const spotlight = t('spotlight');
const dashboard = t('dashboard');
const customer = t('customer');
const vendor = t('vendor');
const journal = t('journal');
const treasury = t('treasury');
const product = t('product');
const warehouse = t('warehouse');
const reports = t('reports');
const accounting = t('accounting');

// ── Platform detection ──────────────────────────

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

// ── Spotlight items registry ────────────────────

const SPOTLIGHT_ITEMS: SpotlightItem[] = [
  // ── Navigation ──
  {
    id: 'nav-home',
    label: nav.home,
    hint: '/',
    icon: <IconHome size={18} />,
    group: 'navigation',
    keywords: ['خانه', 'داشبورد', 'home', 'dashboard'],
    action: '/',
  },
  {
    id: 'nav-invoices',
    label: nav.invoices,
    hint: '/invoices',
    icon: <IconCart size={18} />,
    group: 'navigation',
    keywords: ['فاکتور', 'فروش', 'invoices', 'sales'],
    action: '/invoices',
  },
  {
    id: 'nav-customers',
    label: nav.customers,
    hint: '/customers',
    icon: <IconUser size={18} />,
    group: 'navigation',
    keywords: ['مشتری', 'مشتریان', 'customers'],
    action: '/customers',
  },
  {
    id: 'nav-vendors',
    label: nav.vendors,
    hint: '/vendors',
    icon: <IconDelivery size={18} />,
    group: 'navigation',
    keywords: ['تأمین', 'تامین', 'vendors', 'suppliers'],
    action: '/vendors',
  },
  {
    id: 'nav-accounting',
    label: accounting.chartOfAccounts,
    hint: '/accounting',
    icon: <IconScale size={18} />,
    group: 'navigation',
    keywords: ['حساب', 'سرفصل', 'accounting', 'chart of accounts'],
    action: '/accounting',
  },
  {
    id: 'nav-journal',
    label: journal.title,
    hint: '/accounting/journal',
    icon: <IconBook size={18} />,
    group: 'navigation',
    keywords: ['سند', 'اسناد', 'journal', 'entries'],
    action: '/accounting/journal',
  },
  {
    id: 'nav-products',
    label: product.title,
    hint: '/products',
    icon: <IconBox size={18} />,
    group: 'navigation',
    keywords: ['کالا', 'محصول', 'products', 'inventory'],
    action: '/products',
  },
  {
    id: 'nav-warehouses',
    label: warehouse.title,
    hint: '/products/warehouses',
    icon: <IconBox size={18} />,
    group: 'navigation',
    keywords: ['انبار', 'warehouses'],
    action: '/products/warehouses',
  },
  {
    id: 'nav-bank-accounts',
    label: treasury.bankAccountTitle,
    hint: '/accounting/bank-accounts',
    icon: <IconWallet size={18} />,
    group: 'navigation',
    keywords: ['بانک', 'حساب بانکی', 'bank'],
    action: '/accounting/bank-accounts',
  },
  {
    id: 'nav-cashboxes',
    label: treasury.cashboxTitle,
    hint: '/accounting/cashboxes',
    icon: <IconWallet size={18} />,
    group: 'navigation',
    keywords: ['صندوق', 'نقد', 'cashbox', 'cash'],
    action: '/accounting/cashboxes',
  },
  {
    id: 'nav-received-cheques',
    label: treasury.receivedChequeTitle,
    hint: '/accounting/received-cheques',
    icon: <IconDocument size={18} />,
    group: 'navigation',
    keywords: ['چک دریافتی', 'cheque', 'received'],
    action: '/accounting/received-cheques',
  },
  {
    id: 'nav-paid-cheques',
    label: treasury.paidChequeTitle,
    hint: '/accounting/paid-cheques',
    icon: <IconDocument size={18} />,
    group: 'navigation',
    keywords: ['چک پرداختی', 'paid cheque'],
    action: '/accounting/paid-cheques',
  },
  {
    id: 'nav-reports',
    label: reports.title,
    hint: '/reports',
    icon: <IconChart size={18} />,
    group: 'navigation',
    keywords: ['گزارش', 'reports'],
    action: '/reports',
  },
  {
    id: 'nav-settings',
    label: nav.settings,
    hint: '/settings',
    icon: <IconSettings size={18} />,
    group: 'navigation',
    keywords: ['تنظیمات', 'پیکربندی', 'settings', 'preferences'],
    action: '/settings',
  },

  // ── Quick actions ──
  {
    id: 'action-new-invoice',
    label: dashboard.newSalesInvoice,
    icon: <IconAddCircle size={18} />,
    group: 'action',
    keywords: ['فاکتور جدید', 'فروش جدید', 'new invoice'],
    action: '/invoices/new',
  },
  {
    id: 'action-new-customer',
    label: customer.newCustomer,
    icon: <IconAddCircle size={18} />,
    group: 'action',
    keywords: ['مشتری جدید', 'new customer'],
    action: '/customers/new',
  },
  {
    id: 'action-new-vendor',
    label: vendor.newVendor,
    icon: <IconAddCircle size={18} />,
    group: 'action',
    keywords: ['تأمین‌کننده جدید', 'تامین کننده', 'new vendor'],
    action: '/vendors/new',
  },
  {
    id: 'action-new-journal',
    label: journal.newEntry,
    icon: <IconAddCircle size={18} />,
    group: 'action',
    keywords: ['سند جدید', 'سند حسابداری', 'new journal'],
    action: '/accounting/journal/new',
  },
  {
    id: 'action-new-product',
    label: product.newProduct,
    icon: <IconAddCircle size={18} />,
    group: 'action',
    keywords: ['کالای جدید', 'محصول جدید', 'new product'],
    action: '/products/new',
  },
  {
    id: 'action-new-warehouse',
    label: warehouse.newWarehouse,
    icon: <IconAddCircle size={18} />,
    group: 'action',
    keywords: ['انبار جدید', 'new warehouse'],
    action: '/products/warehouses/new',
  },
];

const GROUP_LABELS: Record<SpotlightItem['group'], string> = {
  navigation: spotlight.pages,
  action: spotlight.quickActions,
};

// ── Component ───────────────────────────────────

export function SpotlightSearch({ open, onOpenChange }: SpotlightSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter items by query
  const filtered = useMemo(() => {
    if (!query.trim()) return SPOTLIGHT_ITEMS;
    const q = query.trim().toLowerCase();
    return SPOTLIGHT_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q)) ||
        (item.hint && item.hint.toLowerCase().includes(q)),
    );
  }, [query]);

  // Group filtered items
  const grouped = useMemo(() => {
    const groups: { key: SpotlightItem['group']; label: string; items: SpotlightItem[] }[] = [];
    const order: SpotlightItem['group'][] = ['action', 'navigation'];
    for (const g of order) {
      const items = filtered.filter((i) => i.group === g);
      if (items.length > 0) {
        groups.push({ key: g, label: GROUP_LABELS[g], items });
      }
    }
    return groups;
  }, [filtered]);

  // Flat list for keyboard nav
  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  // Derived safe index — eliminates desync between activeIndex and flatItems
  const safeIndex = Math.min(activeIndex, Math.max(0, flatItems.length - 1));

  // Reset state + focus on open; lock body scroll
  useEffect(() => {
    if (!open) return;

    setQuery('');
    setActiveIndex(0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const rafId = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [safeIndex]);

  function close(): void {
    onOpenChange(false);
  }

  function execute(item: SpotlightItem): void {
    if (typeof item.action === 'string') {
      // Cast needed: Next.js App Router uses branded route types,
      // but spotlight routes are dynamic strings from data
      router.push(item.action as never);
    } else {
      item.action();
    }
    close();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(1, flatItems.length));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + flatItems.length) % Math.max(1, flatItems.length));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatItems[safeIndex]) {
          execute(flatItems[safeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        // Trap focus inside the dialog
        e.preventDefault();
        break;
    }
  }

  if (!open) return null;

  const activeItemId = flatItems[safeIndex]
    ? `spotlight-option-${flatItems[safeIndex].id}`
    : undefined;

  return (
    <div className="spotlight-overlay" onClick={close} role="presentation">
      <div
        className="spotlight-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={common.search}
      >
        {/* Search input */}
        <div className="spotlight-input-row">
          <IconMagnifer size={20} className="text-fg-tertiary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={common.searchPlaceholder}
            aria-label={common.search}
            aria-controls="spotlight-listbox"
            aria-expanded={flatItems.length > 0}
            aria-activedescendant={activeItemId}
            className="spotlight-input"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="spotlight-kbd" aria-hidden="true">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} id="spotlight-listbox" className="spotlight-results" role="listbox">
          {flatItems.length === 0 ? (
            <div className="spotlight-empty">
              <span className="text-fg-tertiary text-sm">{common.noResults}</span>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.key} role="group" aria-label={group.label}>
                <div className="spotlight-group-label">{group.label}</div>
                {group.items.map((item) => {
                  const idx = flatItems.indexOf(item);
                  const isActive = idx === safeIndex;
                  return (
                    <button
                      key={item.id}
                      id={`spotlight-option-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      data-active={isActive}
                      className={cn('spotlight-item', isActive && 'spotlight-item-active')}
                      onClick={() => execute(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <span
                        className={cn(
                          'spotlight-item-icon',
                          isActive
                            ? 'text-primary-fg bg-brand-deep'
                            : 'text-fg-secondary bg-bg-tertiary',
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 text-start">
                        <span
                          className={cn(
                            'text-sm',
                            isActive ? 'text-fg-primary font-medium' : 'text-fg-primary',
                          )}
                        >
                          {item.label}
                        </span>
                        {item.hint && (
                          <span className="ltr-text mr-2 text-xs text-fg-tertiary">
                            {item.hint}
                          </span>
                        )}
                      </span>
                      {isActive && (
                        <IconChevronLeft size={14} className="text-fg-tertiary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="spotlight-footer">
          <span className="flex items-center gap-1.5 text-[11px] text-fg-tertiary">
            <kbd className="spotlight-hint-key" aria-hidden="true">
              ↑↓
            </kbd>
            {spotlight.navigate}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-fg-tertiary">
            <kbd className="spotlight-hint-key" aria-hidden="true">
              ↵
            </kbd>
            {spotlight.select}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-fg-tertiary">
            <kbd className="spotlight-hint-key" aria-hidden="true">
              ESC
            </kbd>
            {common.close}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Shortcut label for the search trigger button */
export const SHORTCUT_LABEL = IS_MAC ? '⌘K' : 'Ctrl+K';
