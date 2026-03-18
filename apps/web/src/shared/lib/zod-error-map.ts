import { z, type ZodErrorMap, ZodIssueCode, ZodParsedType } from 'zod';

/**
 * Persian (fa) Zod error map — professional validation messages.
 *
 * Set globally once at app init via `z.setErrorMap(persianErrorMap)`.
 * All Zod schemas across the app will use these messages automatically.
 */

export const persianErrorMap: ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        return { message: 'این فیلد الزامی است' };
      }
      return { message: 'نوع داده وارد شده نامعتبر است' };

    case ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        return { message: 'آدرس ایمیل معتبر نیست' };
      }
      if (issue.validation === 'url') {
        return { message: 'آدرس وب‌سایت معتبر نیست' };
      }
      return { message: 'فرمت وارد شده صحیح نیست' };

    case ZodIssueCode.too_small:
      if (issue.type === 'string') {
        if (issue.minimum === 1) {
          return { message: 'این فیلد نمی‌تواند خالی باشد' };
        }
        return { message: `حداقل ${issue.minimum} کاراکتر وارد کنید` };
      }
      if (issue.type === 'number') {
        return { message: `مقدار باید حداقل ${issue.minimum} باشد` };
      }
      if (issue.type === 'array') {
        return { message: `حداقل ${issue.minimum} مورد انتخاب کنید` };
      }
      return { message: 'مقدار وارد شده کافی نیست' };

    case ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `حداکثر ${issue.maximum} کاراکتر مجاز است` };
      }
      if (issue.type === 'number') {
        return { message: `مقدار نباید بیشتر از ${issue.maximum} باشد` };
      }
      return { message: 'مقدار وارد شده بیش از حد مجاز است' };

    case ZodIssueCode.invalid_enum_value:
      return { message: 'مقدار انتخابی معتبر نیست' };

    case ZodIssueCode.invalid_date:
      return { message: 'تاریخ وارد شده معتبر نیست' };

    case ZodIssueCode.custom:
      return { message: issue.message ?? 'خطای اعتبارسنجی' };

    default:
      return { message: ctx.defaultError };
  }
};

/** Call once at app startup to enable Persian validation messages globally */
export function initPersianValidation(): void {
  z.setErrorMap(persianErrorMap);
}
