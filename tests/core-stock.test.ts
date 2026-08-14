import assert from "node:assert/strict";
import { applyBatchesToPool, availableStock, validateBatches } from "../src/core/stock";
import { Pool, SturgeonBreed } from "../src/types";

const pool: Pool = {
  id: "h1p1", name: "ونیرو ۱", hallId: 1, dimensionsDesc: "قطر ۲ متر", purpose: "نرسری",
  breed: SturgeonBreed.BELUGA, count: 0, avgWeightGrams: 0, totalBiomassKg: 0,
  temperature: 0, oxygenLevel: 0, phLevel: 0
};

const batches = [
  { id: "a", breed: SturgeonBreed.BELUGA, gender: "female", count: 10, avgWeightGrams: 1000, chipIds: ["chip-1"] },
  { id: "b", breed: SturgeonBreed.SIBERIAN, gender: "male", count: 20, avgWeightGrams: 500, chipIds: ["chip-2"] }
];

const updated = applyBatchesToPool(pool, batches);
assert.equal(updated.count, 30);
assert.equal(updated.totalBiomassKg, 20);
assert.equal(updated.avgWeightGrams, 667);
assert.equal(availableStock(updated, SturgeonBreed.BELUGA, "female"), 10);
assert.equal(validateBatches(batches, [pool], pool.id).length, 0);
assert.ok(validateBatches([{ ...batches[0], count: 0 }], [pool], pool.id).some(error => error.includes("چیپ")));

console.log("core-stock tests passed");
