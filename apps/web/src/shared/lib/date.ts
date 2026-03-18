/**
 * Jalali (Solar Hijri) date utilities.
 *
 * Pure arithmetic conversion — no external dependencies.
 * All output uses Persian numerals (۰-۹).
 */

const PERSIAN_DIGITS: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
};

const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

const JALALI_WEEKDAYS = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
] as const;

export interface JalaliDate {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

/** Convert a Latin digit string to Persian numerals. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[d] ?? d);
}

/**
 * Convert Gregorian date to Jalali date.
 * Algorithm: based on the widely-used Jalaali arithmetic conversion.
 */
export function toJalali(date: Date): JalaliDate {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

  const gDaysInMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334] as const;
  let gy2 = gm > 2 ? gy + 1 : gy;
  // gm is 1-12 from getMonth()+1, so gm-1 is always 0-11 (valid index)
  const dayOffset = gDaysInMonth[gm - 1] ?? 0;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    dayOffset;

  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;

  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm: number;
  let jd: number;

  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return { year: jy, month: jm, day: jd };
}

/** Get the Persian name of a Jalali month (1-indexed). */
export function jalaliMonthName(month: number): string {
  return JALALI_MONTHS[month - 1] ?? '';
}

/** Get the Jalali year as a Persian numeral string. */
export function jalaliYear(date: Date): string {
  return toPersianDigits(toJalali(date).year);
}

/** Get current Jalali month name + year, e.g. 'خرداد ۱۴۰۵'. */
export function jalaliMonthYear(date: Date = new Date()): string {
  const j = toJalali(date);
  return `${jalaliMonthName(j.month)} ${toPersianDigits(j.year)}`;
}

/**
 * Format a Jalali date as a Persian string.
 *
 * @param date - JavaScript Date object
 * @param format - 'short' → '۵ خرداد', 'medium' → '۵ خرداد ۱۴۰۵', 'long' → 'پنجشنبه ۵ خرداد ۱۴۰۵'
 */
export function formatJalaliDate(
  date: Date,
  format: 'short' | 'medium' | 'long' = 'medium',
): string {
  const j = toJalali(date);
  const day = toPersianDigits(j.day);
  const month = jalaliMonthName(j.month);
  const year = toPersianDigits(j.year);

  switch (format) {
    case 'short':
      return `${day} ${month}`;
    case 'medium':
      return `${day} ${month} ${year}`;
    case 'long': {
      const weekday = JALALI_WEEKDAYS[date.getDay()] ?? '';
      return `${weekday} ${day} ${month} ${year}`;
    }
  }
}

/**
 * Format an ISO date string (YYYY-MM-DD) as a Jalali date.
 */
export function formatISOToJalali(
  isoDate: string,
  format: 'short' | 'medium' | 'long' = 'medium',
): string {
  // Parse date-only strings (YYYY-MM-DD) as local date, not UTC.
  // new Date('2025-03-01') is parsed as UTC midnight, which shifts
  // to the previous day in timezones east of UTC (e.g. Iran +3:30).
  const parts = isoDate.split('-');
  const year = parseInt(parts[0] ?? '0', 10);
  const month = parseInt(parts[1] ?? '1', 10) - 1;
  const day = parseInt(parts[2] ?? '1', 10);
  return formatJalaliDate(new Date(year, month, day), format);
}

/** Get the current Jalali fiscal year label, e.g. 'سال مالی ۱۴۰۵'. */
export function jalaliCurrentFiscalYear(date: Date = new Date()): string {
  const j = toJalali(date);
  return `سال مالی ${toPersianDigits(j.year)}`;
}

/** Convert Jalali date to Gregorian Date. */
export function fromJalali(jy: number, jm: number, jd: number): Date {
  let gy: number;
  let adjJy = jy;
  if (adjJy > 979) {
    gy = 1600;
    adjJy -= 979;
  } else {
    gy = 621;
  }
  let days =
    365 * adjJy +
    Math.floor(adjJy / 33) * 8 +
    Math.floor((adjJy % 33 + 3) / 4) +
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
  const isLeap = gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0) ? 1 : 0;
  let gm =
    days < 31
      ? 1
      : days < 59 + isLeap
        ? 2
        : 0;
  if (gm === 0) {
    const gDaysInMonths = [0, 31, 29 + (1 - isLeap), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let remaining = days - 59 - isLeap;
    for (gm = 3; gm <= 12; gm++) {
      if (remaining < (gDaysInMonths[gm] ?? 0)) break;
      remaining -= gDaysInMonths[gm] ?? 0;
    }
    days = remaining;
  } else {
    days = gm === 2 ? days - 31 : days;
  }
  const gd = days + 1;
  return new Date(gy, gm - 1, gd);
}

/** Check if a Jalali year is a leap year. */
export function isJalaliLeapYear(jy: number): boolean {
  const breaks = [1, 5, 9, 13, 17, 22, 26, 30];
  const r = jy % 33;
  return breaks.includes(r);
}

/** Days in a Jalali month. */
export function jalaliDaysInMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeapYear(jy) ? 30 : 29;
}

/** Get day of week for a Jalali date (0=Saturday, 6=Friday). */
export function jalaliWeekDay(jy: number, jm: number, jd: number): number {
  const d = fromJalali(jy, jm, jd);
  return (d.getDay() + 1) % 7;
}

const LATIN_DIGITS: Record<string, string> = {
  '\u06F0': '0', '\u06F1': '1', '\u06F2': '2', '\u06F3': '3', '\u06F4': '4',
  '\u06F5': '5', '\u06F6': '6', '\u06F7': '7', '\u06F8': '8', '\u06F9': '9',
};

/** Convert a string with Persian digits to Latin digits. */
function toLatinDigits(input: string): string {
  return input.replace(/[\u06F0-\u06F9]/g, (d) => LATIN_DIGITS[d] ?? d);
}

/** Parse user input like "1405/01/15" or "۱۴۰۵/۰۱/۱۵" to JalaliDate, or null if invalid. */
export function parseJalaliInput(input: string): JalaliDate | null {
  const latin = toLatinDigits(input.trim());
  const match = latin.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  const jy = parseInt(match[1]!, 10);
  const jm = parseInt(match[2]!, 10);
  const jd = parseInt(match[3]!, 10);
  if (jm < 1 || jm > 12) return null;
  if (jd < 1 || jd > jalaliDaysInMonth(jy, jm)) return null;
  return { year: jy, month: jm, day: jd };
}

/** Format a Date to ISO YYYY-MM-DD string. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
