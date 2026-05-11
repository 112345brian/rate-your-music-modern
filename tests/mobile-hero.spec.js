import { test, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("mobile layout", async ({ browser }) => {
  const context = await browser.newContext({ ...devices["Pixel 5"] });
  const page = await context.newPage();
  const filePath = path.resolve(
    __dirname,
    "../assets/release-page/preview.html",
  );
  await page.goto(`file://${filePath}`);
  await page.waitForTimeout(1500);

  await page.screenshot({ path: "/tmp/m1-hero.png", fullPage: false });

  // Scroll to see tab bar
  await page.evaluate(() =>
    document
      .querySelector(".rym-modern-release-tabs")
      ?.scrollIntoView({ block: "center" }),
  );
  await page.waitForTimeout(300);
  await page.screenshot({ path: "/tmp/m2-tabbar.png", fullPage: false });

  // Click Discussion
  await page.evaluate(() =>
    document.querySelector(".rym-modern-release-tab")?.click(),
  );
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/tmp/m3-overlay.png", fullPage: false });
});
