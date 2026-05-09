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
  await page.setViewportSize({ width: 1440, height: 820 });
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
  await expect(page.locator(".rym-modern-section-tab")).toContainText([
    "Lists 185",
    "Discussion",
  ]);
  await expect(page.locator("#rym-modern-discography")).toBeVisible();
  await expect(page.locator("#rym-modern-credits")).toHaveCount(0);
  await expect(
    page.locator("#column_container_right .artist_page_header_section_songs"),
  ).toBeVisible();
  await expect(page.locator(".rym-modern-songs-tab")).toBeHidden();
  await expect(page.locator("#rym-modern-lists")).toBeHidden();
  await expect(page.locator("#rym-modern-discussion")).toBeHidden();
  await expect(
    page.locator('[data-target="rym-modern-discography"]'),
  ).toHaveCSS("border-bottom-color", "rgb(125, 211, 252)");
  await expect(page.getByRole("link", { name: /Credits 5/ })).toHaveCSS(
    "color",
    "rgb(197, 206, 218)",
  );
  await expect(
    page.getByRole("link", { name: /Credits 5/ }),
  ).not.toHaveAttribute("data-target", /./);
  await page.locator('[data-target="rym-modern-lists"]').hover();
  const listHoverColor = await page
    .locator('[data-target="rym-modern-lists"]')
    .evaluate((node) => window.getComputedStyle(node).color);
  const listHoverBackground = await page
    .locator('[data-target="rym-modern-lists"]')
    .evaluate((node) => window.getComputedStyle(node).backgroundColor);

  await page.getByRole("link", { name: /Credits 5/ }).hover();
  const creditsHoverColor = await page
    .getByRole("link", { name: /Credits 5/ })
    .evaluate((node) => window.getComputedStyle(node).color);
  const creditsHoverBackground = await page
    .getByRole("link", { name: /Credits 5/ })
    .evaluate((node) => window.getComputedStyle(node).backgroundColor);

  expect(listHoverColor).toBe(creditsHoverColor);
  expect(listHoverBackground).toBe(creditsHoverBackground);
  expect(listHoverBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(listHoverColor).not.toBe("rgb(197, 206, 218)");

  await page.goto(
    `${pathToFileURL(`${process.cwd()}/assets/artist-page/preview.html`).href}#rym-modern-lists`,
  );
  await expect(page.locator("#rym-modern-lists")).toBeHidden();
  await expect(page.locator("#rym-modern-discussion")).toBeHidden();

  await page.getByRole("link", { name: /Lists 185/ }).click();
  await expect(page.locator("#rym-modern-discography")).toBeHidden();
  await expect(page.locator("#rym-modern-lists")).toBeVisible();
  await expect(page.locator("#rym-modern-discussion")).toBeHidden();
  await expect(
    page.locator('[data-target="rym-modern-discography"]'),
  ).toHaveCSS("border-bottom-color", "rgba(0, 0, 0, 0)");
  await expect(page.locator('[data-target="rym-modern-lists"]')).toHaveCSS(
    "border-bottom-color",
    "rgb(125, 211, 252)",
  );
  await page
    .locator(".rym-modern-section-tab", { hasText: "Discussion" })
    .click();
  await expect(page.locator("#rym-modern-discography")).toBeHidden();
  await expect(page.locator("#rym-modern-lists")).toBeHidden();
  await expect(page.locator("#rym-modern-discussion")).toBeVisible();
  await page.getByRole("button", { name: /Discography 106/ }).click();
  await expect(page.locator("#rym-modern-discography")).toBeVisible();
  await expect(page.locator("#rym-modern-lists")).toBeHidden();
  await expect(page.locator("#rym-modern-discussion")).toBeHidden();
  await page.setViewportSize({ width: 1080, height: 720 });
  await expect(page.locator(".rym-modern-songs-tab")).toBeVisible();
  await expect(
    page.locator("#column_container_right .artist_page_header_section_songs"),
  ).toHaveCount(0);
  await page.locator(".rym-modern-songs-tab").click();
  await expect(page.locator("#rym-modern-songs")).toBeVisible();
  await expect(page.locator("#rym-modern-discography")).toBeHidden();
  await page.getByRole("button", { name: /Discography 106/ }).click();
  await expect(
    page.locator(".page_artist_songs_song_has_lyrics").first(),
  ).toHaveCSS("color", "rgb(82, 210, 115)");
  await expect(
    page.locator(".page_artist_tracks_track_stats_scores").first(),
  ).toContainText("4.7");
  await expect(page.locator(".rym-modern-disco-filter")).toContainText([
    "All",
    "Albums",
    "EPs",
  ]);
  await page.setViewportSize({ width: 1220, height: 720 });

  const tabFit = await page.locator(".artist_page_section").evaluate((node) => {
    const style = window.getComputedStyle(node);
    const row = node.getBoundingClientRect();
    const lastChild = node.lastElementChild.getBoundingClientRect();
    const visibleChildren = [...node.children].filter(
      (child) => window.getComputedStyle(child).display !== "none",
    );
    const gaps = visibleChildren.slice(1).map((child, index) => {
      const previous = visibleChildren[index].getBoundingClientRect();
      const current = child.getBoundingClientRect();

      return current.left - previous.right;
    });
    const labelSize = Number.parseFloat(
      window.getComputedStyle(visibleChildren[0]).fontSize,
    );
    const countSize = Number.parseFloat(
      window.getComputedStyle(visibleChildren[0].querySelector(".subtext"))
        .fontSize,
    );

    return {
      countIsDeemphasized: countSize < labelSize,
      minGap: Math.min(...gaps),
      scale: Number(style.getPropertyValue("--rym-tab-scale") || "1"),
      isOneLine: node.scrollHeight <= node.clientHeight + 2,
      hasFitBuffer: lastChild.right <= row.right - 8,
    };
  });
  const filterFit = await page
    .locator(".rym-modern-disco-filters")
    .evaluate((node) => {
      const style = window.getComputedStyle(node);
      const row = node.getBoundingClientRect();
      const lastChild = node.lastElementChild.getBoundingClientRect();

      return {
        scale: Number(style.getPropertyValue("--rym-filter-scale") || "1"),
        isOneLine: node.scrollHeight <= node.clientHeight + 2,
        hasFitBuffer: lastChild.right <= row.right - 8,
      };
    });

  expect(tabFit.countIsDeemphasized).toBe(true);
  expect(tabFit.minGap).toBeGreaterThanOrEqual(16);
  expect(tabFit.scale).toBeGreaterThan(0);
  expect(tabFit.isOneLine).toBe(true);
  expect(tabFit.hasFitBuffer).toBe(true);
  expect(filterFit.scale).toBeGreaterThan(0);
  expect(filterFit.isOneLine).toBe(true);
  expect(filterFit.hasFitBuffer).toBe(true);

  await page.getByRole("button", { name: /EPs/ }).click();
  await expect(
    page.locator(".disco_header_label").filter({ hasText: "EP" }),
  ).toBeVisible();
  await expect(
    page.locator(".disco_header_label").filter({ hasText: /^Album$/ }),
  ).toBeHidden();
  await page.getByRole("button", { name: /Appears On/ }).click();
  await expect(page.locator("#disco_header_show_link_a")).toBeHidden();
  await expect(
    page.locator("#disco_type_a .disco_expand_section_btn"),
  ).toBeHidden();

  const genreText = await page
    .locator(".rym-modern-info-row--genres .info_content")
    .innerText();
  const followerText = await page
    .locator(".label_num_followers > div")
    .innerText();

  expect(genreText).not.toContain(",");
  expect(followerText).not.toContain(",");
  await expect(page.locator(".rym-modern-see-all-followers")).toHaveText(
    "See all 21",
  );
  await expect(page.locator(".rym-modern-contributions")).toBeVisible();
  await expect(
    page.locator(".rym-modern-contribution-actions"),
  ).not.toHaveAttribute("open", "");
  await expect(page.locator(".contribution_links")).toBeHidden();
  await page.getByText(/Contribution options/).click();
  await expect(page.locator(".contribution_links")).toBeVisible();
});
