// @ts-check

/* eslint-disable object-curly-newline, object-curly-spacing */

import { expect, test } from "@playwright/test";

const bannerId = "qunit-banner";
const failClass = "qunit-fail";
const passClass = "qunit-pass";
const failSelector = `#${bannerId}.${failClass}`;
const passSelector = `#${bannerId}.${passClass}`;

test("QUnit browser tests", async ({ page }) => {
  await page.goto("/");
  const bannerLocator = page.locator(`${passSelector}, ${failSelector}`);
  await bannerLocator.waitFor();
  await expect(bannerLocator).toHaveClass(passClass, { "timeout": 1 });
});
