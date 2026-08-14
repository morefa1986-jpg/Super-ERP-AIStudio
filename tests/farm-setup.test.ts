import assert from "node:assert/strict";
import {
  createSetupHall,
  createSetupPool,
  linkPoolsToHalls,
  nextPoolId,
  validateFarmStructure
} from "../src/core/farmSetup";

const firstHall = createSetupHall([]);
assert.equal(firstHall.id, 1);
assert.equal(firstHall.name, "سالن 1");

const secondHall = createSetupHall([firstHall]);
assert.equal(secondHall.id, 2);

const firstPool = createSetupPool(firstHall.id, []);
const secondPool = createSetupPool(firstHall.id, [firstPool]);
assert.equal(firstPool.id, "h1p1");
assert.equal(secondPool.id, "h1p2");
assert.equal(nextPoolId(1, [firstPool, secondPool]), "h1p3");

const linked = linkPoolsToHalls([firstHall, secondHall], [firstPool, secondPool]);
assert.deepEqual(linked[0].poolIds, ["h1p1", "h1p2"]);
assert.deepEqual(linked[1].poolIds, []);
assert.deepEqual(validateFarmStructure(linked, [firstPool, secondPool]), []);

assert.ok(validateFarmStructure([], []).some(error => error.includes("حداقل یک سالن")));
assert.ok(validateFarmStructure([firstHall], [{ ...firstPool, dimensionsDesc: "" }]).some(error => error.includes("مشخصات ابعاد")));
assert.ok(validateFarmStructure([firstHall], [{ ...firstPool, phLevel: 20 }]).some(error => error.includes("pH")));

console.log("farm setup tests passed");
