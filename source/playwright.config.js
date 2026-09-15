import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4178", viewport: { width: 1440, height: 1000 }, locale: "en-US", serviceWorkers: "block", screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: { command: "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4178 --strictPort", url: "http://127.0.0.1:4178", reuseExistingServer: !process.env.CI },
});
