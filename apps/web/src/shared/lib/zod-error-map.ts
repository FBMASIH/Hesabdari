import { z, type ZodErrorMap, ZodIssueCode, ZodParsedType } from 'zod';

/**
 * Persian (fa) Zod error map — friendly, calm, cool validation messages.
 *
 * Set globally once at app init via `z.setErrorMap(persianErrorMap)`.
 * All Zod schemas across the app will use these messages automatically.
 */

export const persianErrorMap: ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        return { message: 'اوه! این قسمت رو جا انداختی 😊' };
      }
      return { message: 'یه چیز دیگه‌ای انتظار داشتیم اینجا 🤔' };

    case ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        return { message: 'این ایمیل درست به نظر نمیاد، یه بار دیگه چک کن ✉️' };
      }
      if (issue.validation === 'url') {
        return { message: 'آدرس وب‌سایت معتبر نیست 🌐' };
      }
      return { message: 'فرمت وارد شده درست نیست 🙃' };

    case ZodIssueCode.too_small:
      if (issue.type === 'string') {
        if (issue.minimum === 1) {
          return { message: 'نمی‌شه خالی بذاری، پرش کن 📝' };
        }
        return { message: `حداقل ${issue.minimum} تا کاراکتر لازمه ✍️` };
      }
      if (issue.type === 'number') {
        return { message: `عددش باید حداقل ${issue.minimum} باشه 📊` };
      }
      if (issue.type === 'array') {
        return { message: `حداقل ${issue.minimum} تا انتخاب کن ☑️` };
      }
      return { message: 'یکم بیشتر لازمه 📏' };

    case ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `خیلی طولانی شد! حداکثر ${issue.maximum} کاراکتر ✂️` };
      }
      if (issue.type === 'number') {
        return { message: `عددش زیاده، حداکثر ${issue.maximum} 📉` };
      }
      return { message: 'یکم کمترش کن 📏' };

    case ZodIssueCode.invalid_enum_value:
      return { message: 'این گزینه توی لیست نیست 📋' };

    case ZodIssueCode.invalid_date:
      return { message: 'تاریخ وارد شده معتبر نیست 📅' };

    case ZodIssueCode.custom:
      return { message: issue.message ?? 'یه مشکلی هست 🤷' };

    default:
      return { message: ctx.defaultError };
  }
};

/** Call once at app startup to enable Persian validation messages globally */
export function initPersianValidation(): void {
  z.setErrorMap(persianErrorMap);
}
