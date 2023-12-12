// @ts-check

/* eslint-disable object-curly-newline, object-curly-spacing */

import { defineConfig, devices } from "@playwright/test";
import { photoPort, photoUrl, testPort, testUrl, textPort, textUrl } from "./playwright.shared.mjs";

export default defineConfig({
  "testDir": ".",
  "projects": [
    {
      "name": "Pixel 7 (chromium)",
      "use": { ...devices["Pixel 7"] }
    },
    {
      "name": "Desktop Firefox (firefox)",
      "use": { ...devices["Desktop Firefox"] }
    },
    {
      "name": "iPhone 13 (webkit)",
      "use": { ...devices["iPhone 13"] }
    }
  ],
  "webServer": [
    {
      "command": "npm run test",
      "env": {
        "PORT": `${testPort}`
      },
      "url": testUrl
    },
    {
      "command": "npm run text",
      "env": {
        "PORT": `${textPort}`
      },
      "url": textUrl,
    },
    {
      "command": "npm run photo",
      "env": {
        "PORT": `${photoPort}`
      },
      "url": photoUrl
    }
  ]
});
