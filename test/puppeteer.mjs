import process from "node:process";
import puppeteer from "puppeteer";

const passSelector = "#qunit-banner.qunit-pass";
const failSelector = "#qunit-banner.qunit-fail";

/* eslint-disable no-console */

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto("http://localhost:3000/");
await page.waitForSelector(`${passSelector}, ${failSelector}`);
if (await page.$(passSelector)) {
  console.log("PASS");
} else {
  console.log("FAIL");
  process.exitCode = 1;
}
await browser.close();
