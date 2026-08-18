const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Converts Latin/Arabic-Indic digits to Persian digits. */
export const toPersianDigits = (value: string | number): string =>
  String(value)
    .replace(/[0-9]/g, digit => FA_DIGITS[Number(digit)])
    .replace(/[٠-٩]/g, digit => FA_DIGITS[AR_DIGITS.indexOf(digit)]);

/** Persian-localized number for every user-facing numeric value. */
export const formatPersianNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => new Intl.NumberFormat("fa-IR-u-nu-arabext", options).format(value);

/** Jalali date with Persian month/day/year and Persian digits. */
export const formatJalaliDate = (
  value: Date | string | number = new Date(),
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric", weekday: "long" }
): string => {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-arabext", options).format(date);
};

/** Persian clock with Persian digits. */
export const formatPersianTime = (value: Date | string | number = new Date()): string => {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-arabext", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
};

/** Complete Jalali date/time for logs, reports and headers. */
export const formatJalaliDateTime = (value: Date | string | number = new Date()): string =>
  `${formatJalaliDate(value)}، ${formatPersianTime(value)}`;
