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
