import { type ReactNode } from 'react';
import Link from 'next/link';
import { IconScale, IconBook, IconDocument, IconNotebook, IconClipboardList } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { toPersianDigits } from '@/shared/lib/date';

const acct = t('accounting');
const journal = t('journal');
const reports = t('reports');

/* ── Balance summary cards ───────────────────── */

interface BalanceCard {
  label: string;
  debit: string;
  credit: string;
  color: string;
}

const balanceCards: BalanceCard[] = [
  { label: acct.types.asset, debit: '0', credit: '0', color: 'bg-primary-default' },
  { label: acct.types.liability, debit: '0', credit: '0', color: 'bg-danger-default' },
  { label: acct.types.revenue, debit: '0', credit: '0', color: 'bg-success-default' },
  { label: acct.types.expense, debit: '0', credit: '0', color: 'bg-warning-default' },
];

/* ── Report shortcuts ────────────────────────── */

interface ReportLink {
  label: string;
  icon: ReactNode;
  href: string;
}

const reportLinks: ReportLink[] = [
  { label: reports.trialBalance, icon: <IconScale size={16} />, href: '/reports' },
  { label: reports.balanceSheet, icon: <IconClipboardList size={16} />, href: '/reports' },
  { label: reports.incomeStatement, icon: <IconNotebook size={16} />, href: '/reports' },
  { label: reports.ledger, icon: <IconBook size={16} />, href: '/reports' },
  { label: reports.journal, icon: <IconDocument size={16} />, href: '/journal-entries' },
];

export function AccountingView() {
  return (
    <div className="flex flex-col gap-3">
      {/* Account type balance cards — 4 columns */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {balanceCards.map((card) => (
          <div
            key={card.label}
            className="glass-interactive flex flex-col gap-2 rounded-2xl p-4 cursor-default"
          >
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${card.color}`} />
              <span className="text-[11px] font-medium text-fg-tertiary">{card.label}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] text-fg-tertiary">{acct.debit}</span>
                <span className="text-sm font-semibold tabular-nums text-fg-primary">
                  {formatMoney(card.debit, { showUnit: false })}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[11px] text-fg-tertiary">{acct.credit}</span>
                <span className="text-sm font-semibold tabular-nums text-fg-primary">
                  {formatMoney(card.credit, { showUnit: false })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lower row — 5-col grid (3:2 ratio) */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        {/* Journal entries status */}
        <div className="lg:col-span-3">
          <div className="glass-surface-static flex h-full flex-col rounded-2xl p-5">
            <div className="mb-3">
              <h2 className="text-base font-semibold text-fg-primary">{journal.title}</h2>
              <p className="mt-0.5 text-xs text-fg-tertiary">{journal.subtitle}</p>
            </div>

            <div className="mb-4 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[11px] text-fg-tertiary">{journal.totalDebit}</span>
                <span className="text-lg font-bold tabular-nums text-fg-primary">
                  {formatMoney('0', { showUnit: false })}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-fg-tertiary">{journal.totalCredit}</span>
                <span className="text-lg font-bold tabular-nums text-fg-primary">
                  {formatMoney('0', { showUnit: false })}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-fg-tertiary">{journal.balanceColumn}</span>
                <span className="text-lg font-bold tabular-nums text-success-default">
                  {journal.balanced}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-fg-tertiary">
              <span>
                {toPersianDigits(0)} {journal.entryCount}
              </span>
              <span className="text-fg-disabled">|</span>
              <span>
                {toPersianDigits(0)} {journal.rowCount}
              </span>
            </div>
          </div>
        </div>

        {/* Report shortcuts */}
        <div className="lg:col-span-2">
          <div className="glass-surface-static flex h-full flex-col rounded-2xl p-5">
            <h2 className="mb-2 text-base font-semibold text-fg-primary">{reports.title}</h2>
            <div className="flex flex-col gap-1">
              {reportLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href as never}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-150 hover:bg-bg-tertiary/50 hover:shadow-xs active:scale-[0.98]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-subtle text-brand-deep shadow-xs">
                    {link.icon}
                  </div>
                  <span className="text-sm font-medium text-fg-secondary">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
