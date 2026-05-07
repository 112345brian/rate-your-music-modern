import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

test("loads the design preview", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Rate Your Music Modern/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Rate Your Music Modern",
  );
  await expect(page.locator("html")).toHaveClass(/rym-modern/);
  await expect(page.locator(".page_charts_section_charts_item")).toHaveCount(4);

  const firstLetterStyle = await page
    .getByRole("heading", { level: 1 })
    .evaluate((element) => {
      const style = window.getComputedStyle(element, "::first-letter");

      return {
        borderTopWidth: style.borderTopWidth,
        borderRadius: style.borderRadius,
        fontFamily: style.fontFamily,
      };
    });

  expect(firstLetterStyle.borderTopWidth).toBe("0px");
  expect(firstLetterStyle.borderRadius).toBe("0px");
  expect(firstLetterStyle.fontFamily.toLowerCase()).not.toContain("fantasy");
});

test("loads generated previews for saved RYM assets", async ({ page }) => {
  await page.goto(
    pathToFileURL(`${process.cwd()}/assets/artist-page/preview.html`).href,
  );

  await expect(page).toHaveTitle(/Songs: Ohia/);
  await expect(page.locator("link[data-rym-modern-preview-css]")).toHaveCount(
    1,
  );
  await expect(page.locator("script[data-rym-modern-preview-js]")).toHaveCount(
    1,
  );
  await expect(page.locator(".artist_name_hdr")).toContainText("Songs: Ohia");
  await expect(page.locator(".rym-modern-info-row")).not.toHaveCount(0);
  await expect(page.locator(".rym-modern-section-tab")).toHaveText([
    "Songs",
    "Lists",
    "Discussion",
  ]);
  await expect(page.locator("#rym-modern-lists")).toHaveCount(1);
  await expect(page.locator(".rym-modern-disco-filter")).toContainText([
    "All",
    "Albums",
    "EPs",
  ]);

  await page.getByRole("button", { name: /EPs/ }).click();
  await expect(
    page.locator(".disco_header_label").filter({ hasText: "EP" }),
  ).toBeVisible();
  await expect(
    page.locator(".disco_header_label").filter({ hasText: /^Album$/ }),
  ).toBeHidden();

  const genreText = await page
    .locator(".rym-modern-info-row--genres .info_content")
    .innerText();
  const followerText = await page
    .locator(".label_num_followers > div")
    .innerText();

  expect(genreText).not.toContain(",");
  expect(followerText).not.toContain(",");
});
