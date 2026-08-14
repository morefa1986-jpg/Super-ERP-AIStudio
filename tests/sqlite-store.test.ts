import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ServerStore } from "../server/storage";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fathi-aqua-store-"));
const legacyPath = path.join(tempDir, "sturgeon_database.json");
fs.writeFileSync(legacyPath, JSON.stringify({ sturgeon_pools_v2: [{ id: "p1", count: 25 }] }), "utf8");

const store = new ServerStore({ dataDir: tempDir, legacyJsonPaths: [legacyPath] });
assert.deepEqual(store.read().sturgeon_pools_v2, [{ id: "p1", count: 25 }]);

store.write({
  sturgeon_pools_v2: [{ id: "p1", count: 30 }],
  sturgeon_halls_v2: [{ id: "h1", name: "سالن یک" }],
});
assert.deepEqual(store.read().sturgeon_pools_v2, [{ id: "p1", count: 30 }]);
assert.equal(fs.existsSync(store.databasePath), true);

const backupPath = store.createBackup("test");
assert.equal(fs.existsSync(backupPath), true);
assert.ok(fs.statSync(backupPath).size > 0);
store.close();

const reopened = new ServerStore({ dataDir: tempDir, legacyJsonPaths: [legacyPath] });
assert.deepEqual(reopened.read().sturgeon_halls_v2, [{ id: "h1", name: "سالن یک" }]);
reopened.close();
fs.rmSync(tempDir, { recursive: true, force: true });
console.log("sqlite store tests passed");
