// @ts-check

/* eslint-disable object-curly-newline, object-curly-spacing */

import { defineConfig, devices } from "@playwright/test";

const testUrl = "http://localhost:3000/";

export default defineConfig({
  "testDir": ".",
  "use": {
    "baseURL": testUrl
  },
  "projects": [
    {
      "name": "chromium",
      "use": { ...devices["Desktop Chrome"] }
    },
    {
      "name": "firefox",
      "use": { ...devices["Desktop Firefox"] }
    },
    {
      "name": "webkit",
      "use": { ...devices["Desktop Safari"] }
    }
  ],
  "webServer": {
    "command": "npm run test",
    "url": testUrl
  }
});
