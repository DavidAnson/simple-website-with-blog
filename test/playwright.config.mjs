// @ts-check

/* eslint-disable object-curly-newline, object-curly-spacing */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  "testDir": ".",
  "use": {
    "baseURL": "http://localhost:3000/"
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
    "url": "http://localhost:3000/"
  }
});
