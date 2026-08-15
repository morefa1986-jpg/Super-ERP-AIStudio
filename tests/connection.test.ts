import assert from "node:assert/strict";
import { validateConnection } from "../src/network/connection";

const base = { protocol: "http" as const, host: "127.0.0.1", port: 3000, useSameOrigin: false };
assert.equal(validateConnection(base), null);
assert.match(validateConnection({ ...base, protocol: "ftp" as never }) || "", /پروتکل/);
assert.match(validateConnection({ ...base, host: "bad host" }) || "", /Host/);
assert.match(validateConnection({ ...base, port: 70000 }) || "", /Port/);
console.log("connection tests passed");
