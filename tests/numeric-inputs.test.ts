import assert from "node:assert/strict";
import { normalizeLeadingZeroNumberValue } from "../src/utils/numericInputs";

assert.equal(normalizeLeadingZeroNumberValue("0"), "0");
assert.equal(normalizeLeadingZeroNumberValue("-0"), "-0");
assert.equal(normalizeLeadingZeroNumberValue("05"), "5");
assert.equal(normalizeLeadingZeroNumberValue("00012"), "12");
assert.equal(normalizeLeadingZeroNumberValue("-05"), "-5");
assert.equal(normalizeLeadingZeroNumberValue("0.5"), "0.5");
assert.equal(normalizeLeadingZeroNumberValue("00.5"), "0.5");
assert.equal(normalizeLeadingZeroNumberValue("-00.5"), "-0.5");
assert.equal(normalizeLeadingZeroNumberValue("10"), "10");
assert.equal(normalizeLeadingZeroNumberValue(""), "");

console.log("numeric-inputs tests passed");
