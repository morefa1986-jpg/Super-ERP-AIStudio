import assert from "node:assert/strict";
import {
  calculateInvoiceTotals,
  formatIranPlate,
  numberToPersianWords,
  validateIranMobile,
  validateIranPlate,
} from "../src/core/officeAccounting";

const totals = calculateInvoiceTotals([
  { quantity: 2, unitPrice: 100_000, discount: 20_000 },
  { quantity: 1, unitPrice: 50_000, discount: 0 },
], 10);
assert.equal(totals.subtotal, 250_000);
assert.equal(totals.discount, 20_000);
assert.equal(totals.vat, 23_000);
assert.equal(totals.payable, 253_000);
assert.equal(validateIranMobile("09123456789"), true);
assert.equal(validateIranMobile("09123"), false);
const plate = { iran: "11", letter: "ب", three: "123", two: "45" };
assert.equal(validateIranPlate(plate), true);
assert.equal(formatIranPlate(plate), "ایران 11 ـ 45 ب 123");
assert.equal(numberToPersianWords(253_000), "دویست و پنجاه و سه هزار");
console.log("office accounting tests passed");
