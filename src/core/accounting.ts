export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

export interface Account { id: string; code: string; name: string; type: AccountType; active: boolean; }
export interface JournalLine { accountId: string; debit: number; credit: number; description?: string; }
export interface JournalEntry { id: string; date: string; description: string; reference?: string; lines: JournalLine[]; createdBy: string; }
export interface SalesInvoice { id: string; customerId: string; date: string; lines: Array<{ description: string; quantity: number; unitPrice: number; taxRate: number }>; paid: number; }
export interface PayrollRecord { id: string; employeeId: string; period: string; gross: number; deductions: number; paid: number; }

const money = (value: number) => Number(value.toFixed(2));

export function validateJournalEntry(entry: JournalEntry, accounts: Account[]): string[] {
  const errors: string[] = [];
  const known = new Set(accounts.filter(account => account.active).map(account => account.id));
  if (!entry.description.trim()) errors.push("شرح سند حسابداری الزامی است.");
  if (!entry.lines.length) errors.push("سند باید حداقل دو ردیف داشته باشد.");
  let debit = 0; let credit = 0;
  for (const line of entry.lines) {
    if (!known.has(line.accountId)) errors.push(`حساب نامعتبر است: ${line.accountId}`);
    if (!Number.isFinite(line.debit) || !Number.isFinite(line.credit) || line.debit < 0 || line.credit < 0) errors.push("مبلغ بدهکار و بستانکار باید عدد غیرمنفی باشد.");
    if (line.debit > 0 && line.credit > 0) errors.push("هر ردیف نمی‌تواند هم‌زمان بدهکار و بستانکار باشد.");
    if (line.debit === 0 && line.credit === 0) errors.push("هر ردیف باید مبلغ داشته باشد.");
    debit += line.debit; credit += line.credit;
  }
  if (money(debit) !== money(credit)) errors.push("جمع بدهکار و بستانکار برابر نیست.");
  return errors;
}

export function invoiceTotals(invoice: SalesInvoice) {
  let subtotal = 0; let tax = 0;
  for (const line of invoice.lines) {
    if (!Number.isFinite(line.quantity) || line.quantity <= 0 || !Number.isFinite(line.unitPrice) || line.unitPrice < 0) throw new Error("مقدار یا قیمت فاکتور نامعتبر است.");
    const amount = line.quantity * line.unitPrice;
    subtotal += amount; tax += amount * (line.taxRate / 100);
  }
  return { subtotal: money(subtotal), tax: money(tax), total: money(subtotal + tax), balance: money(subtotal + tax - invoice.paid) };
}

export function payrollNet(record: PayrollRecord): number {
  if (![record.gross, record.deductions, record.paid].every(Number.isFinite) || record.gross < 0 || record.deductions < 0 || record.paid < 0) throw new Error("مقادیر حقوق نامعتبر است.");
  if (record.deductions > record.gross) throw new Error("کسورات نمی‌تواند از حقوق ناخالص بیشتر باشد.");
  return money(record.gross - record.deductions);
}
