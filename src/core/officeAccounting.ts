export interface InvoiceLineInput {
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface InvoiceLineTotal extends InvoiceLineInput {
  gross: number;
  final: number;
}

export function calculateInvoiceLine(line: InvoiceLineInput): InvoiceLineTotal {
  const quantity = Math.max(0, Number(line.quantity) || 0);
  const unitPrice = Math.max(0, Number(line.unitPrice) || 0);
  const discount = Math.min(Math.max(0, Number(line.discount) || 0), quantity * unitPrice);
  const gross = quantity * unitPrice;
  return { quantity, unitPrice, discount, gross, final: gross - discount };
}

export function calculateInvoiceTotals(lines: InvoiceLineInput[], vatRate: number) {
  const normalized = lines.map(calculateInvoiceLine);
  const subtotal = normalized.reduce((sum, line) => sum + line.gross, 0);
  const discount = normalized.reduce((sum, line) => sum + line.discount, 0);
  const taxable = Math.max(0, subtotal - discount);
  const vat = taxable * Math.max(0, Number(vatRate) || 0) / 100;
  return { lines: normalized, subtotal, discount, taxable, vat, payable: taxable + vat };
}

export function validateIranMobile(value: string): boolean {
  return /^09\d{9}$/.test(value.replace(/[\s-]/g, ""));
}

export function validateIranPlate(parts: { iran: string; letter: string; three: string; two: string }): boolean {
  return /^\d{2}$/.test(parts.iran) && parts.letter.trim().length > 0 && /^\d{3}$/.test(parts.three) && /^\d{2}$/.test(parts.two);
}

export function formatIranPlate(parts: { iran: string; letter: string; three: string; two: string }): string {
  return `ایران ${parts.iran} ـ ${parts.two} ${parts.letter.trim()} ${parts.three}`;
}

const ONES = ["صفر", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const TEENS = ["ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
const TENS = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const HUNDREDS = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
const SCALES = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

function underThousand(value: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  if (hundreds) parts.push(HUNDREDS[hundreds]);
  if (remainder >= 10 && remainder < 20) parts.push(TEENS[remainder - 10]);
  else {
    const tens = Math.floor(remainder / 10);
    const ones = remainder % 10;
    if (tens) parts.push(TENS[tens]);
    if (ones) parts.push(ONES[ones]);
  }
  return parts.join(" و ");
}

export function numberToPersianWords(input: number): string {
  const value = Math.round(Number(input) || 0);
  if (value === 0) return ONES[0];
  if (value < 0) return `منفی ${numberToPersianWords(Math.abs(value))}`;
  const parts: string[] = [];
  let remaining = value;
  let scale = 0;
  while (remaining > 0 && scale < SCALES.length) {
    const chunk = remaining % 1000;
    if (chunk) parts.unshift(`${underThousand(chunk)}${SCALES[scale] ? ` ${SCALES[scale]}` : ""}`);
    remaining = Math.floor(remaining / 1000);
    scale += 1;
  }
  return parts.join(" و ");
}

export function jalaliFromIso(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
