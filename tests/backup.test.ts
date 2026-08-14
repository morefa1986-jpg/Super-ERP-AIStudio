import assert from "node:assert/strict";
import { createBackup, restoreBackup } from "../src/storage/backup";

class MemoryStorage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, String(value)); }
  removeItem(key: string) { this.data.delete(key); }
  clear() { this.data.clear(); }
  [Symbol.iterator]() { return this.data[Symbol.iterator](); }
}

Object.defineProperty(globalThis, "localStorage", { value: new MemoryStorage(), configurable: true });
localStorage.setItem("sturgeon_pools_v2", JSON.stringify([{ id: "h1p1", count: 12 }]));
localStorage.setItem("caviar_inventory", JSON.stringify({ feed: 20 }));
const backup = createBackup("test-admin");
localStorage.clear();
const result = restoreBackup(backup);
assert.equal(result.sourceVersion, 6);
assert.deepEqual(JSON.parse(localStorage.getItem("sturgeon_pools_v2") || "[]"), [{ id: "h1p1", count: 12 }]);
assert.deepEqual(JSON.parse(localStorage.getItem("caviar_inventory") || "{}"), { feed: 20 });
console.log("backup tests passed");
