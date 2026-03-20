'use client';

import { useState, useRef, useEffect, useCallback, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';
import { IconCalendar, IconChevronRight, IconChevronLeft } from '../icons';

/* ---------- Self-contained Jalali math (no external deps) ---------- */

const PERSIAN_DIGITS: Record<string, string> = {
  '0': '\u06F0',
  '1': '\u06F1',
  '2': '\u06F2',
  '3': '\u06F3',
  '4': '\u06F4',
  '5': '\u06F5',
  '6': '\u06F6',
  '7': '\u06F7',
  '8': '\u06F8',
  '9': '\u06F9',
};
const LATIN_DIGITS: Record<string, string> = {
  '\u06F0': '0',
  '\u06F1': '1',
  '\u06F2': '2',
  '\u06F3': '3',
  '\u06F4': '4',
  '\u06F5': '5',
  '\u06F6': '6',
  '\u06F7': '7',
  '\u06F8': '8',
  '\u06F9': '9',
};

function toPersian(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[d] ?? d);
}
function toLatin(input: string): string {
  return input.replace(/[\u06F0-\u06F9]/g, (d) => LATIN_DIGITS[d] ?? d);
}

interface JDate {
  jy: number;
  jm: number;
  jd: number;
}

function toJalali(date: Date): JDate {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const gDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334] as const;
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    (gDays[gm - 1] ?? 0);
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number, jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

function fromJalali(jy: number, jm: number, jd: number): Date {
  let gy: number,
    adj = jy;
  if (adj > 979) {
    gy = 1600;
    adj -= 979;
  } else {
    gy = 621;
  }
  let days =
    365 * adj +
    Math.floor(adj / 33) * 8 +
    Math.floor(((adj % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const leap = gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0) ? 1 : 0;
  let gm = days < 31 ? 1 : days < 59 + leap ? 2 : 0;
  if (gm === 0) {
    const md = [0, 31, 29 + (1 - leap), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let rem = days - 59 - leap;
    for (gm = 3; gm <= 12; gm++) {
      if (rem < (md[gm] ?? 0)) break;
      rem -= md[gm] ?? 0;
    }
    days = rem;
  } else {
    days = gm === 2 ? days - 31 : days;
  }
  return new Date(gy, gm - 1, days + 1);
}

function isLeap(jy: number): boolean {
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(jy % 33);
}
function daysIn(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeap(jy) ? 30 : 29;
}
function weekDay(jy: number, jm: number, jd: number): number {
  return (fromJalali(jy, jm, jd).getDay() + 1) % 7; // 0=Sat
}
function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function parseISO(iso: string): Date | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(parseInt(m[1]!, 10), parseInt(m[2]!, 10) - 1, parseInt(m[3]!, 10));
}

/* ---------- Constants ---------- */

const MONTH_NAMES = [
  '\u0641\u0631\u0648\u0631\u062F\u06CC\u0646',
  '\u0627\u0631\u062F\u06CC\u0628\u0647\u0634\u062A',
  '\u062E\u0631\u062F\u0627\u062F',
  '\u062A\u06CC\u0631',
  '\u0645\u0631\u062F\u0627\u062F',
  '\u0634\u0647\u0631\u06CC\u0648\u0631',
  '\u0645\u0647\u0631',
  '\u0622\u0628\u0627\u0646',
  '\u0622\u0630\u0631',
  '\u062F\u06CC',
  '\u0628\u0647\u0645\u0646',
  '\u0627\u0633\u0641\u0646\u062F',
]; // فروردین...اسفند
const WEEKDAY_NAMES = ['\u0634', '\u06CC', '\u062F', '\u0633', '\u0686', '\u067E', '\u062C']; // ش ی د س چ پ ج

/* ---------- Component ---------- */

export interface DatePickerProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> {
  /** ISO date string (YYYY-MM-DD) or empty string. */
  value: string;
  /** Called with ISO date string on selection. */
  onChange: (isoDate: string) => void;
  /** Error state styling. */
  hasError?: boolean;
}

export function DatePicker({
  className,
  value,
  onChange,
  hasError,
  placeholder = '\u06F1\u06F4\u06F0\u06F5/\u06F0\u06F1/\u06F0\u06F1',
  disabled,
  ...props
}: DatePickerProps) {
  const today = toJalali(new Date());

  // Current viewed month/year in calendar
  const initial = value ? toJalali(parseISO(value) ?? new Date()) : today;
  const [viewYear, setViewYear] = useState(initial.jy);
  const [viewMonth, setViewMonth] = useState(initial.jm);
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync viewYear/viewMonth when value changes externally (only when calendar is closed)
  useEffect(() => {
    if (value && !open) {
      const d = toJalali(parseISO(value) ?? new Date());
      setViewYear(d.jy);
      setViewMonth(d.jm);
    }
  }, [value, open]);

  // Sync display text from value prop
  useEffect(() => {
    if (value) {
      const d = parseISO(value);
      if (d) {
        const j = toJalali(d);
        setInputText(
          `${toPersian(String(j.jy))}/${toPersian(String(j.jm).padStart(2, '0'))}/${toPersian(String(j.jd).padStart(2, '0'))}`,
        );
        return;
      }
    }
    setInputText('');
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selectDate = useCallback(
    (jy: number, jm: number, jd: number) => {
      const greg = fromJalali(jy, jm, jd);
      onChange(toISO(greg));
      setOpen(false);
    },
    [onChange],
  );

  const handleInputBlur = useCallback(() => {
    if (!inputText.trim()) {
      onChange('');
      return;
    }
    const latin = toLatin(inputText.trim());
    const match = latin.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (!match) return;
    const jy = parseInt(match[1]!, 10);
    const jm = parseInt(match[2]!, 10);
    const jd = parseInt(match[3]!, 10);
    if (jm < 1 || jm > 12 || jd < 1 || jd > daysIn(jy, jm)) return;
    selectDate(jy, jm, jd);
    setViewYear(jy);
    setViewMonth(jm);
  }, [inputText, selectDate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleInputBlur();
        setOpen(false);
      }
      if (e.key === 'Escape') setOpen(false);
    },
    [handleInputBlur],
  );

  const prevMonth = useCallback(() => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }, [viewMonth]);

  const goToday = useCallback(() => {
    setViewYear(today.jy);
    setViewMonth(today.jm);
    selectDate(today.jy, today.jm, today.jd);
  }, [today, selectDate]);

  // Build calendar grid
  const totalDays = daysIn(viewYear, viewMonth);
  const startDow = weekDay(viewYear, viewMonth, 1); // 0=Sat
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Selected Jalali date
  const sel = value ? toJalali(parseISO(value) ?? new Date()) : null;
  const isSelected = (d: number) =>
    sel && sel.jy === viewYear && sel.jm === viewMonth && sel.jd === d;
  const isToday = (d: number) => today.jy === viewYear && today.jm === viewMonth && today.jd === d;

  return (
    <div ref={containerRef} className="relative">
      {/* Text input */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        dir="ltr"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex h-[30px] w-full rounded-md border-[0.5px] bg-bg-secondary pe-3 ps-9 text-center text-[13px] tabular-nums text-fg-primary shadow-inner transition-all',
          'placeholder:text-fg-tertiary',
          'focus:border-brand-deep focus:outline-none focus:ring-[3px] focus:ring-brand-deep/20',
          'disabled:cursor-not-allowed disabled:bg-bg-tertiary disabled:opacity-60',
          hasError ? 'border-danger-default' : 'border-border-primary',
          className,
        )}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
          inputRef.current?.focus();
        }}
        className="absolute start-2 top-1/2 -translate-y-1/2 text-fg-tertiary hover:text-fg-secondary disabled:pointer-events-none"
      >
        <IconCalendar size={16} />
      </button>

      {/* Dropdown calendar */}
      {open && !disabled && (
        <div
          className="absolute top-[calc(100%+4px)] start-0 z-50 w-[260px] rounded-lg border border-border-primary bg-bg-primary p-3 shadow-lg"
          dir="rtl"
        >
          {/* Header: nav arrows + month/year */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={nextMonth}
              className="rounded p-1 text-fg-secondary hover:bg-bg-tertiary"
            >
              <IconChevronRight size={16} />
            </button>
            <span className="text-[13px] font-semibold text-fg-primary">
              {MONTH_NAMES[viewMonth - 1]} {toPersian(viewYear)}
            </span>
            <button
              type="button"
              onClick={prevMonth}
              className="rounded p-1 text-fg-secondary hover:bg-bg-tertiary"
            >
              <IconChevronLeft size={16} />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="mb-1 grid grid-cols-7 text-center text-2xs text-fg-tertiary">
            {WEEKDAY_NAMES.map((wd) => (
              <div key={wd} className="py-0.5">
                {wd}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 text-center text-[12px]">
            {cells.map((d, i) => (
              <div key={i} className="aspect-square">
                {d != null && (
                  <button
                    type="button"
                    onClick={() => selectDate(viewYear, viewMonth, d)}
                    className={cn(
                      'flex h-full w-full items-center justify-center rounded-md transition-colors',
                      isSelected(d)
                        ? 'bg-brand-deep text-primary-fg'
                        : isToday(d)
                          ? 'border border-brand-deep/40 text-brand-deep font-semibold'
                          : 'text-fg-primary hover:bg-bg-tertiary',
                    )}
                  >
                    {toPersian(d)}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Today button */}
          <button
            type="button"
            onClick={goToday}
            className="mt-2 w-full rounded-md bg-bg-secondary py-1 text-[12px] text-fg-secondary hover:bg-bg-tertiary transition-colors"
          >
            {'\u0627\u0645\u0631\u0648\u0632'}
          </button>
        </div>
      )}
    </div>
  );
}
