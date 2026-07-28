import { defineConfig } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  reporter: "list",
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3500",
    trace: "on-first-retry",
  },
  webServer: {
    command: "node ../../packages/cms/bin/cms.js dev",
    cwd: "apps/playground",
    port: 3500,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
