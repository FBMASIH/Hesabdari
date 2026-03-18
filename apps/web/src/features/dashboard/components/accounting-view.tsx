import { type ReactNode } from 'react';
import Link from 'next/link';
import {
  IconScale,
  IconBook,
  IconDocument,
  IconNotebook,
  IconClipboardList,
} from '@hesabdari/ui';
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
    <div className="flex flex-col gap-4">
      {/* Account type balance cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {balanceCards.map((card) => (
          <div key={card.label} className="glass-surface-static flex flex-col gap-3 rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${card.color}`} />
              <span className="text-xs font-medium text-fg-tertiary">{card.label}</span>
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

      {/* Lower row — journal status + report shortcuts */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Journal entries status */}
        <div className="glass-surface-static flex flex-1 flex-col rounded-2xl p-6">
          <div className="mb-4">
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
            <span>{toPersianDigits(0)} {journal.entryCount}</span>
            <span className="text-fg-quaternary">|</span>
            <span>{toPersianDigits(0)} {journal.rowCount}</span>
          </div>
        </div>

        {/* Report shortcuts */}
        <div className="glass-surface-static flex w-72 flex-col rounded-2xl p-5">
          <h2 className="text-base font-semibold text-fg-primary mb-3">{reports.title}</h2>
          <div className="flex flex-col gap-1">
            {reportLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href as '/reports' | '/journal-entries'}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-bg-primary/60"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-subtle text-brand-deep">
                  {link.icon}
                </div>
                <span className="text-sm font-medium text-fg-secondary">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
