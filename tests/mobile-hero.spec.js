import { test, expect, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadReleasePage(browser) {
  const context = await browser.newContext({ ...devices["Pixel 5"] });
  const page = await context.newPage();
  const filePath = path.resolve(
    __dirname,
    "../assets/release-page/preview.html",
  );
  await page.goto(`file://${filePath}`);
  await page.waitForTimeout(1500);
  return { page, context };
}

test.describe("mobile release page", () => {
  test("site header is hidden", async ({ browser }) => {
    const { page } = await loadReleasePage(browser);
    const header = page.locator("body > header");
    await expect(header).toBeHidden();
  });

  test("bottom nav is visible with all four items", async ({ browser }) => {
    const { page } = await loadReleasePage(browser);
    const nav = page.locator(".rym-modern-bottom-nav");
    await expect(nav).toBeVisible();
    await expect(nav.locator(".rym-modern-bottom-nav-item")).toHaveCount(4);
  });

  test("hero shows album cover, title, and meta subtitle", async ({
    browser,
  }) => {
    const { page } = await loadReleasePage(browser);
    // Cover image
    await expect(
      page.locator(".show-for-small [class^='coverart_'] img"),
    ).toBeVisible();
    // Album title
    await expect(page.locator(".album_title")).toBeVisible();
    // Hero meta (Album by Artist line injected by JS)
    await expect(page.locator(".rym-modern-mobile-hero-meta")).toBeVisible();
    await expect(
      page.locator(".rym-modern-mobile-hero-type-artist"),
    ).toBeVisible();
  });

  test("Info tab is active by default", async ({ browser }) => {
    const { page } = await loadReleasePage(browser);
    const infoTab = page.locator(
      '.rym-modern-release-tab[data-target="rym-modern-release-info"]',
    );
    await expect(infoTab).toBeVisible();
    await expect(infoTab).toHaveAttribute("aria-current", "true");
    await expect(page.locator("#rym-modern-release-info")).toBeVisible();
  });

  test("Info tab contains genres and tracklist", async ({ browser }) => {
    const { page } = await loadReleasePage(browser);
    const infoPanel = page.locator("#rym-modern-release-info");
    await expect(infoPanel).toBeVisible();
    // Genres section
    await expect(
      infoPanel.locator(".rym-modern-info-label", { hasText: "Genres" }),
    ).toBeVisible();
    await expect(infoPanel.locator(".release_pri_genres")).toBeVisible();
    // Tracklist
    await expect(infoPanel.locator(".section_tracklisting")).toBeVisible();
  });

  test("tracklist appears exactly once on page", async ({ browser }) => {
    const { page } = await loadReleasePage(browser);
    // Only one visible tracklist — the one in the Info panel
    const visibleTracklists = page.locator(".section_tracklisting:visible");
    await expect(visibleTracklists).toHaveCount(1);
  });

  test("genre row is hidden from album_info table", async ({ browser }) => {
    const { page } = await loadReleasePage(browser);
    const genreRow = page.locator(".album_info tr.release_genres");
    if ((await genreRow.count()) > 0) {
      await expect(genreRow).toBeHidden();
    }
  });

  test("non-Info tabs are hidden by default", async ({ browser }) => {
    const { page } = await loadReleasePage(browser);
    const reviewsPanel = page.locator("#rym-modern-release-reviews");
    if ((await reviewsPanel.count()) > 0) {
      await expect(reviewsPanel).toBeHidden();
    }
  });

  test("switching tabs hides Info and shows the selected panel", async ({
    browser,
  }) => {
    const { page } = await loadReleasePage(browser);
    const tabs = page.locator(".rym-modern-release-tab");
    const tabCount = await tabs.count();

    // Find a non-Info, non-Discussion tab to click
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const target = await tab.getAttribute("data-target");
      if (
        target &&
        target !== "rym-modern-release-info" &&
        target !== "rym-modern-release-reviews"
      ) {
        await tab.click();
        await page.waitForTimeout(200);
        await expect(page.locator("#rym-modern-release-info")).toBeHidden();
        await expect(tab).toHaveAttribute("aria-current", "true");
        break;
      }
    }
  });

  test("clicking Info tab again restores Info panel", async ({ browser }) => {
    const { page } = await loadReleasePage(browser);
    const tabs = page.locator(".rym-modern-release-tab");
    const tabCount = await tabs.count();

    // Click a non-Info tab first
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const target = await tab.getAttribute("data-target");
      if (
        target &&
        target !== "rym-modern-release-info" &&
        target !== "rym-modern-release-reviews"
      ) {
        await tab.click();
        await page.waitForTimeout(200);
        break;
      }
    }

    // Now click Info tab
    const infoTab = page.locator(
      '.rym-modern-release-tab[data-target="rym-modern-release-info"]',
    );
    await infoTab.click();
    await page.waitForTimeout(200);
    await expect(page.locator("#rym-modern-release-info")).toBeVisible();
    await expect(infoTab).toHaveAttribute("aria-current", "true");
  });

  test("rating widget: rate row is visible with bump button", async ({
    browser,
  }) => {
    const { page } = await loadReleasePage(browser);
    const rateRow = page.locator(".rym-modern-release-user-rating-rate");
    await expect(rateRow).toBeVisible();
    // Bump button is moved into the rate row by JS
    await expect(rateRow.locator(".bump_btn")).toBeVisible();
  });

  test("rating widget: mobile shell is flush and contained", async ({
    browser,
  }) => {
    const { page } = await loadReleasePage(browser);
    const shell = page.locator(".rym-modern-mobile-unified-card");

    await expect(shell).toBeVisible();
    await expect(shell).toHaveCSS("border-radius", "0px");

    expect(
      await shell.evaluate((element) => {
        const box = element.getBoundingClientRect();

        return box.left >= 0 && box.right <= window.innerWidth;
      }),
    ).toBe(true);
  });

  test("rating widget: action row has play, review, and more buttons", async ({
    browser,
  }) => {
    const { page } = await loadReleasePage(browser);
    const actionRow = page.locator(".rym-modern-rating-action-row");
    await expect(actionRow).toBeVisible();
    await expect(
      actionRow.locator(".rym-modern-rating-play-btn"),
    ).toBeVisible();
    await expect(actionRow.locator(".review_btn")).toBeVisible();
    await expect(
      actionRow.locator(".rym-modern-rating-more-btn"),
    ).toBeVisible();
  });

  test("rating widget: catalog is not in the action row", async ({
    browser,
  }) => {
    const { page } = await loadReleasePage(browser);
    const actionRow = page.locator(".rym-modern-rating-action-row");
    await expect(actionRow.locator(".catalog_btn")).toHaveCount(0);
  });

  test("rating widget: ··· expands to show catalog and other options", async ({
    browser,
  }) => {
    const { page } = await loadReleasePage(browser);
    const expandedSection = page.locator(".rym-modern-rating-expanded-section");
    await expect(expandedSection).toBeHidden();

    await page.locator(".rym-modern-rating-more-btn").click();
    await page.waitForTimeout(100);

    await expect(expandedSection).toBeVisible();
    await expect(expandedSection.locator(".catalog_btn")).toBeVisible();
  });

  test("Discussion overlay opens with close button and sub-tabs", async ({
    browser,
  }) => {
    const { page } = await loadReleasePage(browser);
    const discussionTab = page.locator(
      '.rym-modern-release-tab[data-target="rym-modern-release-reviews"]',
    );
    if ((await discussionTab.count()) === 0) {
      test.skip();
      return;
    }

    await discussionTab.click();
    await page.waitForTimeout(400);

    const overlay = page.locator("#rym-modern-release-reviews");
    await expect(overlay).toBeVisible();

    // Close button visible at top
    const closeBtn = overlay.locator(".rym-mobile-overlay-close");
    await expect(closeBtn).toBeVisible();

    // Sub-tabs present (Reviews, Comments, and optionally Forum)
    const subTabs = overlay.locator(".rym-mobile-discussion-tab");
    await expect(subTabs.first()).toHaveAttribute("aria-current", "true");
    const count = await subTabs.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("Discussion overlay uses compact dark mobile layout", async ({
    browser,
  }) => {
    const { page } = await loadReleasePage(browser);
    const discussionTab = page.locator(
      '.rym-modern-release-tab[data-target="rym-modern-release-reviews"]',
    );
    if ((await discussionTab.count()) === 0) {
      test.skip();
      return;
    }

    await discussionTab.click();
    await page.waitForTimeout(400);

    const overlay = page.locator("#rym-modern-release-reviews");
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveCSS("background-color", "rgb(15, 17, 23)");
    await expect(overlay.locator(".rym-mobile-overlay-header")).toHaveCSS(
      "background-color",
      "rgb(15, 17, 23)",
    );

    const reviewBody = overlay.locator(".review_body").first();
    if ((await reviewBody.count()) > 0) {
      await expect(reviewBody).toHaveCSS("font-size", "15px");
    }
  });

  test("secondary release navigation is compact on mobile", async ({
    browser,
  }) => {
    const { page } = await loadReleasePage(browser);
    const navLinks = page.locator(
      ".section_release_navigation .release_navigation_links:visible",
    );
    await expect(navLinks).toBeVisible();

    const height = await navLinks.evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    expect(height).toBeLessThanOrEqual(56);
  });

  test("Discussion overlay close button dismisses it", async ({ browser }) => {
    const { page } = await loadReleasePage(browser);
    const discussionTab = page.locator(
      '.rym-modern-release-tab[data-target="rym-modern-release-reviews"]',
    );
    if ((await discussionTab.count()) === 0) {
      test.skip();
      return;
    }

    await discussionTab.click();
    await page.waitForTimeout(400);

    const overlay = page.locator("#rym-modern-release-reviews");
    await expect(overlay).toBeVisible();

    await overlay.locator(".rym-mobile-overlay-close").click();
    await page.waitForTimeout(300);
    await expect(overlay).toBeHidden();
  });
});
