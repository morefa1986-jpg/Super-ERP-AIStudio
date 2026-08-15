import assert from "node:assert/strict";
import { invoiceTotals, payrollNet, validateJournalEntry, type Account, type JournalEntry } from "../src/core/accounting";
const accounts: Account[] = [
  { id: "cash", code: "101", name: "صندوق", type: "asset", active: true },
  { id: "sales", code: "401", name: "فروش", type: "income", active: true }
];
const entry: JournalEntry = { id: "j1", date: "2026-01-01", description: "فروش", createdBy: "admin", lines: [{ accountId: "cash", debit: 110, credit: 0 }, { accountId: "sales", debit: 0, credit: 110 }] };
assert.deepEqual(validateJournalEntry(entry, accounts), []);
assert.ok(validateJournalEntry({ ...entry, lines: [{ accountId: "cash", debit: 100, credit: 0 }] }, accounts).length > 0);
assert.deepEqual(invoiceTotals({ id: "i1", customerId: "c1", date: "2026-01-01", paid: 20, lines: [{ description: "خوراک", quantity: 2, unitPrice: 50, taxRate: 10 }] }), { subtotal: 100, tax: 10, total: 110, balance: 90 });
assert.equal(payrollNet({ id: "p1", employeeId: "e1", period: "2026-01", gross: 1000, deductions: 100, paid: 0 }), 900);
console.log("accounting tests passed");
