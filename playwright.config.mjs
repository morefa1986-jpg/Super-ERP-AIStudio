import { defineConfig, devices } from "@playwright/test";
const channel = process.env.PLAYWRIGHT_CHANNEL;
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:4321", ...(channel ? { channel } : {}), ...devices["Desktop Chrome"] },
  webServer: { command: "node dist/server.cjs", url: "http://127.0.0.1:4321/api/health", reuseExistingServer: false, timeout: 30_000, env: { NODE_ENV: "production", PORT: "4321", HOST: "127.0.0.1" } }
});
