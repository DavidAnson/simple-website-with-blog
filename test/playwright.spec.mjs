// @ts-check

/* eslint-disable object-curly-newline, object-curly-spacing */

import { expect, test } from "@playwright/test";
import { photoUrl, testUrl, textUrl } from "./playwright.shared.mjs";

const bannerId = "qunit-banner";
const failClass = "qunit-fail";
const passClass = "qunit-pass";
const failSelector = `#${bannerId}.${failClass}`;
const passSelector = `#${bannerId}.${passClass}`;
const screenshotOptions = {
  "fullPage": true
};

test("Test site QUnit", async ({ page }) => {
  await page.goto(testUrl);
  const bannerLocator = page.locator(`${passSelector}, ${failSelector}`);
  await bannerLocator.waitFor();
  await expect(bannerLocator).toHaveClass(passClass, { "timeout": 1 });
});

test("Text site screenshot", async ({ page }) => {
  await page.goto(`${textUrl}blog`);
  await expect(page).toHaveScreenshot(screenshotOptions);
});

test("Photo site screenshot", async ({ page }) => {
  await page.goto(`${photoUrl}blog`);
  await expect(page).toHaveScreenshot(screenshotOptions);
});
