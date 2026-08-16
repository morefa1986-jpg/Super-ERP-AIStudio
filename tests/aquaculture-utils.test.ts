import assert from "node:assert/strict";
import {
  calculateSturgeonFeed,
  evaluateFeedingWaterSafety,
  formatRequiredSensorParamWithUnit
} from "../src/utils/aquacultureUtils";
import { Pool, SturgeonBreed } from "../src/types";

const basePool: Pool = {
  id: "h1p1",
  name: "ونیرو ۱",
  hallId: 1,
  dimensionsDesc: "قطر ۲ متر",
  purpose: "نرسری",
  breed: SturgeonBreed.SIBERIAN,
  count: 200,
  avgWeightGrams: 450,
  totalBiomassKg: 90,
  temperature: 18,
  oxygenLevel: 7.2,
  phLevel: 7.5
};

const invalidWater = evaluateFeedingWaterSafety({
  ...basePool,
  temperature: 0,
  oxygenLevel: 0,
  phLevel: 0
});
assert.equal(invalidWater.isDataValid, false);
assert.equal(invalidWater.canFeed, false);
assert.ok(invalidWater.reasons.some(reason => reason.includes("دمای آب")));
assert.ok(invalidWater.reasons.some(reason => reason.includes("اکسیژن")));
assert.ok(invalidWater.reasons.some(reason => reason.includes("pH")));

const coldCrisis = evaluateFeedingWaterSafety({ ...basePool, temperature: 5.8 });
assert.equal(coldCrisis.isDataValid, true);
assert.equal(coldCrisis.canFeed, false);
assert.ok(coldCrisis.reasons.some(reason => reason.includes("قطع کامل تغذیه")));

const oxygenCrisis = evaluateFeedingWaterSafety({ ...basePool, oxygenLevel: 3.9 });
assert.equal(oxygenCrisis.isDataValid, true);
assert.equal(oxygenCrisis.canFeed, false);
assert.ok(oxygenCrisis.reasons.some(reason => reason.includes("اکسیژن")));

const validWater = evaluateFeedingWaterSafety(basePool);
assert.equal(validWater.isDataValid, true);
assert.equal(validWater.canFeed, true);
assert.deepEqual(validWater.reasons, []);

const stoppedFeed = calculateSturgeonFeed(450, 0, 90, SturgeonBreed.SIBERIAN);
assert.equal(stoppedFeed.dailyFeedKg, 0);
assert.equal(stoppedFeed.numberOfMeals, 0);

assert.equal(formatRequiredSensorParamWithUnit(0, "°C"), "ثبت‌نشده");
assert.equal(formatRequiredSensorParamWithUnit(18.2, "°C"), "18.2°C");

console.log("aquaculture-utils tests passed");
