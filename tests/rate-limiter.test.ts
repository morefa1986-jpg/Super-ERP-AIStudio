import assert from "node:assert/strict";
import { RedisRateLimiter, type RedisCommands } from "../src/security/rateLimiter";

const values = new Map<string, number>();
const fake: RedisCommands = {
  async incr(key) { const next = (values.get(key) || 0) + 1; values.set(key, next); return next; },
  async expire() {},
  async get() { return null; },
  async set(key, value) { values.set(key, Number(value)); }
};
const limiter = new RedisRateLimiter(fake, 2, 60);
assert.equal(await limiter.allow("user"), true);
assert.equal(await limiter.allow("user"), true);
assert.equal(await limiter.allow("user"), false);
await limiter.reset("user");
assert.equal(await limiter.allow("user"), true);
console.log("rate limiter tests passed");
