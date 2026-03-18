'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Badge,
  DatePicker,
  MoneyInput,
  FormField,
  FormLabel,
  FormErrorBanner,
  Textarea,
  ConfirmDialog,
  IconClose,
  IconPlus,
} from '@hesabdari/ui';
import { ApiError } from '@hesabdari/api-client';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { toPersianDigits } from '@/shared/lib/date';
import {
  FormSection,
  FormActions,
  SearchableSelect,
  type SearchableSelectOption,
} from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useCreateJournalEntry, usePostJournalEntry } from '../hooks/use-journal-entries';
import { useAccounts } from '@/features/shared/hooks/use-accounts';
import { useActivePeriodId } from '@/features/shared/hooks/use-periods';

// ── Types ───────────────────────────────────────────

interface JournalLine {
  id: string;
  accountId: string;
  description: string;
  debitAmount: bigint; // Rial
  creditAmount: bigint; // Rial
}

// ── i18n ────────────────────────────────────────────

const j = t('journal');
const acct = t('accounting');
const common = t('common');
const msgs = t('messages');
const val = t('validation');

function createJournalLineId(counter: { current: number }): string {
  return `jl-${++counter.current}`;
}

// ── Component ───────────────────────────────────────

export function JournalEntryForm() {
  const router = useRouter();
  const { showToast } = useAppToast();
  const createMutation = useCreateJournalEntry();
  const postMutation = usePostJournalEntry();
  const activePeriodId = useActivePeriodId();
  const lineIdCounter = useRef(0);
  const newLine = useCallback(
    (): JournalLine => ({
      id: createJournalLineId(lineIdCounter),
      accountId: '',
      description: '',
      debitAmount: 0n,
      creditAmount: 0n,
    }),
    [],
  );

  // Account list from API
  const accountsQuery = useAccounts();
  const accountOptions: SearchableSelectOption[] = (accountsQuery.data ?? []).map((a) => ({
    id: a.id,
    label: a.name,
    sublabel: a.code,
  }));

  const [entryNumber, setEntryNumber] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<JournalLine[]>(() => [newLine(), newLine()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [postConfirmOpen, setPostConfirmOpen] = useState(false);

  // Balance calculation
  const balance = useMemo(() => {
    let totalDebit = 0n;
    let totalCredit = 0n;
    for (const line of lines) {
      totalDebit += line.debitAmount;
      totalCredit += line.creditAmount;
    }
    return {
      totalDebit,
      totalCredit,
      diff: totalDebit - totalCredit,
      isBalanced: totalDebit === totalCredit && totalDebit > 0n,
    };
  }, [lines]);

  // Line handlers
  const addLine = useCallback(() => {
    setLines((prev) => [...prev, newLine()]);
  }, [newLine]);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => (prev.length > 2 ? prev.filter((l) => l.id !== id) : prev));
  }, []);

  const updateLine = useCallback((id: string, field: keyof JournalLine, value: string | bigint) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, [field]: value };
        // Enforce: a line can only have debit OR credit, not both
        if (field === 'debitAmount' && (value as bigint) > 0n) {
          updated.creditAmount = 0n;
        } else if (field === 'creditAmount' && (value as bigint) > 0n) {
          updated.debitAmount = 0n;
        }
        return updated;
      }),
    );
  }, []);

  // Validation
  function validate(): string[] {
    const errors: string[] = [];
    if (!activePeriodId) errors.push(`${common.currentPeriod}: ${val.required}`);
    if (!entryNumber.trim()) errors.push(`${j.entryNumber}: ${val.required}`);
    if (!entryDate.trim()) errors.push(`${j.entryDate}: ${val.required}`);
    if (!description.trim()) errors.push(`${common.description}: ${val.required}`);
    const filledLines = lines.filter((l) => l.accountId);
    if (filledLines.length < 2) errors.push(j.minTwoLines);
    if (!balance.isBalanced) errors.push(val.unbalancedEntry);
    return errors;
  }

  async function handleSubmit(asDraft: boolean) {
    setFormError(null);

    // Period is required for both draft and post
    if (!activePeriodId) {
      setFormError(`${common.currentPeriod}: ${val.required}`);
      return;
    }

    if (!asDraft) {
      const errors = validate();
      if (errors.length > 0) {
        setFormError(errors.join(' | '));
        return;
      }
      setPostConfirmOpen(true);
      return;
    }

    // Draft: minimal validation
    if (!entryNumber.trim()) {
      setFormError(`${j.entryNumber}: ${val.required}`);
      return;
    }
    await doSubmit('DRAFT');
  }

  /** Build the contract-shaped payload from form state. */
  function buildPayload() {
    const filledLines = lines.filter((l) => l.accountId);
    return {
      entryNumber,
      date: entryDate || undefined,
      description,
      periodId: activePeriodId ?? '',
      lines: filledLines.map((l) => ({
        accountId: l.accountId,
        description: l.description || undefined,
        debitAmount: l.debitAmount.toString(),
        creditAmount: l.creditAmount.toString(),
      })),
    };
  }

  async function doSubmit(status: 'DRAFT' | 'POSTED') {
    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      const created = await createMutation.mutateAsync(payload);

      if (status === 'POSTED' && created.id) {
        await postMutation.mutateAsync(created.id);
      }

      showToast({
        title: status === 'DRAFT' ? j.draftSaved : j.entryPosted,
        variant: 'success',
      });
      router.push('/journal-entries');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : msgs.unexpectedError;
      setFormError(msg);
      showToast({ title: msg, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      method="post"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(false);
      }}
      className="flex flex-col gap-5"
    >
      {formError && <FormErrorBanner message={formError} />}

      {/* ── Header fields ── */}
      <FormSection title={j.entryInfo}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField>
            <FormLabel>{j.entryNumber}</FormLabel>
            <Input
              value={entryNumber}
              onChange={(e) => setEntryNumber(e.target.value)}
              placeholder="۱۰۰۹"
              className="rounded-xl"
            />
          </FormField>

          <FormField>
            <FormLabel>{j.entryDate}</FormLabel>
            <DatePicker value={entryDate} onChange={setEntryDate} />
          </FormField>

          <div className="sm:col-span-1" />
        </div>

        <div className="mt-4">
          <FormField>
            <FormLabel>{common.description}</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={j.descriptionPlaceholder}
              className="rounded-xl resize-none"
              rows={2}
            />
          </FormField>
        </div>
      </FormSection>

      {/* ── Journal lines ── */}
      <FormSection title={j.lines} description={j.linesDescription}>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-secondary">
                <th className="py-2 pe-3 text-start text-xs font-medium text-fg-tertiary w-8">#</th>
                <th className="py-2 pe-3 text-start text-xs font-medium text-fg-tertiary min-w-[180px]">
                  {acct.account}
                </th>
                <th className="py-2 pe-3 text-start text-xs font-medium text-fg-tertiary min-w-[140px]">
                  {common.description}
                </th>
                <th className="py-2 pe-3 text-start text-xs font-medium text-fg-tertiary w-36">
                  {acct.debit} ({common.rial})
                </th>
                <th className="py-2 pe-3 text-start text-xs font-medium text-fg-tertiary w-36">
                  {acct.credit} ({common.rial})
                </th>
                <th className="py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={line.id} className="border-b border-border-secondary/30">
                  <td className="py-2 pe-3 text-xs text-fg-tertiary">{toPersianDigits(idx + 1)}</td>
                  <td className="py-2 pe-3">
                    <SearchableSelect
                      value={line.accountId}
                      onChange={(v) => updateLine(line.id, 'accountId', v)}
                      options={accountOptions}
                      isLoading={accountsQuery.isLoading}
                      placeholder={j.searchAccount}
                    />
                  </td>
                  <td className="py-2 pe-3">
                    <Input
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                      className="h-8 rounded-lg text-xs"
                      placeholder={j.lineDescPlaceholder}
                    />
                  </td>
                  <td className="py-2 pe-3">
                    <MoneyInput
                      value={line.debitAmount > 0n ? line.debitAmount.toString() : ''}
                      onChange={(v) => updateLine(line.id, 'debitAmount', v ? BigInt(v) : 0n)}
                      suffix={common.rial}
                      className="h-8 rounded-lg text-xs"
                      placeholder="0"
                      disabled={line.creditAmount > 0n}
                    />
                  </td>
                  <td className="py-2 pe-3">
                    <MoneyInput
                      value={line.creditAmount > 0n ? line.creditAmount.toString() : ''}
                      onChange={(v) => updateLine(line.id, 'creditAmount', v ? BigInt(v) : 0n)}
                      suffix={common.rial}
                      className="h-8 rounded-lg text-xs"
                      placeholder="0"
                      disabled={line.debitAmount > 0n}
                    />
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length <= 2}
                      className="rounded-lg p-1 text-fg-tertiary hover:bg-danger-subtle hover:text-danger-default transition-colors disabled:opacity-30"
                      aria-label={common.deleteRow}
                    >
                      <IconClose size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* ── Totals footer ── */}
            <tfoot>
              <tr className="border-t-2 border-border-secondary">
                <td colSpan={3} className="py-3 pe-3 text-sm font-semibold text-fg-primary">
                  {common.total}
                </td>
                <td className="py-3 pe-3 tabular-nums text-sm font-bold text-fg-primary">
                  {balance.totalDebit > 0n
                    ? formatMoney(balance.totalDebit, { showUnit: false })
                    : '—'}
                </td>
                <td className="py-3 pe-3 tabular-nums text-sm font-bold text-fg-primary">
                  {balance.totalCredit > 0n
                    ? formatMoney(balance.totalCredit, { showUnit: false })
                    : '—'}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={addLine} className="gap-1.5">
            <IconPlus size={16} />
            {j.addLine}
          </Button>

          {/* Balance indicator */}
          <div className="flex items-center gap-3">
            {balance.diff !== 0n && balance.totalDebit > 0n && (
              <span className="text-xs text-fg-tertiary">
                {j.balanceDiff}:{' '}
                {formatMoney(balance.diff < 0n ? -balance.diff : balance.diff, { showUnit: false })}
              </span>
            )}
            <Badge
              variant={
                balance.isBalanced ? 'success' : balance.totalDebit > 0n ? 'danger' : 'warning'
              }
              className="px-3 py-1 text-sm font-semibold"
            >
              {balance.isBalanced ? j.balanced : j.unbalanced}
            </Badge>
          </div>
        </div>
      </FormSection>

      {/* ── Actions ── */}
      <FormActions
        submitLabel={j.postEntry}
        secondaryAction={{
          label: j.draftEntry,
          onClick: () => handleSubmit(true),
        }}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
        submitDisabled={!balance.isBalanced}
      />

      {/* Post confirmation */}
      <ConfirmDialog
        open={postConfirmOpen}
        onOpenChange={setPostConfirmOpen}
        title={j.postConfirmTitle}
        description={j.postConfirmDescription(entryNumber || '—', formatMoney(balance.totalDebit))}
        confirmLabel={j.postEntry}
        onConfirm={() => doSubmit('POSTED')}
      />
    </form>
  );
}
