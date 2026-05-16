import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

test("loads the design preview", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Rate Your Music Modern/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Rate Your Music Modern",
  );
  await expect(page.locator("html")).toHaveClass(/rym-modern/);
  await expect(page.locator(".page_charts_section_charts_item")).toHaveCount(5);

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
  await expect(page.locator(".rym-modern-songs-tab")).toHaveCount(0);
  await expect(
    page.locator("#column_container_right .artist_page_header_section_songs"),
  ).toBeVisible();
  await expect(page.locator("#rym-modern-discography")).toBeVisible();
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
  await expect(page.locator(".artist_info a.genre").first()).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await expect(page.locator(".artist_info a.genre").first()).toHaveCSS(
    "border-radius",
    "0px",
  );
  expect(followerText).not.toContain(",");
  await expect(page.locator(".rym-modern-see-all-followers")).toHaveText(
    "See all 21",
  );
  await expect(page.locator(".rym-modern-contributions")).toBeVisible();
  await expect(
    page.locator(".rym-modern-contribution-actions"),
  ).not.toHaveAttribute("open", "");
  await expect(page.locator(".contribution_links")).toBeHidden();
  await page.getByText(/Options/).click();
  await expect(page.locator(".contribution_links")).toBeVisible();
  await expect(page.locator(".rym-modern-footer-toggle")).toHaveText(
    "Show footer",
  );
  await expect(page.locator("footer.rym-modern-site-footer")).toHaveCSS(
    "max-height",
    "0px",
  );
  await page.locator(".rym-modern-footer-toggle").click();
  await expect(page.locator("footer.rym-modern-site-footer")).toHaveClass(
    /rym-modern-footer-open/,
  );
});

test("modernizes the release preview layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const injectReviewPagination = () => {
      const reviewSort = document.querySelector(".review_sort");

      if (!reviewSort || reviewSort.querySelector(".navspan")) {
        return;
      }

      const nav = document.createElement("span");

      nav.className = "navspan";
      nav.innerHTML =
        '<span class="navpage">Page </span><span class="navlinkcurrent">1</span> <a class="navlinknum" href="#">2</a> <span class="navdot">..</span> <a class="navlinknext" href="#">&gt;&gt;</a>';
      reviewSort.append(nav);
    };
    const injectOverallRank = () => {
      const rankedCell = [...document.querySelectorAll(".album_info tr")].find(
        (row) =>
          row.querySelector(".info_hdr")?.textContent.trim().toLowerCase() ===
          "ranked",
      )?.lastElementChild;

      if (!rankedCell || rankedCell.dataset.testOverallRank === "true") {
        return;
      }

      rankedCell.dataset.testOverallRank = "true";
      rankedCell.append(document.createElement("br"));
      rankedCell.append(document.createTextNode("#"));

      const rank = document.createElement("b");
      const link = document.createElement("a");

      rank.textContent = "8,921";
      link.href = "https://rateyourmusic.com/charts/top/album/all-time/";
      link.textContent = "all-time";
      rankedCell.append(rank, document.createTextNode(" overall "), link);
    };
    const injectVideoSection = () => {
      if (document.querySelector(".section_videos")) {
        return;
      }

      const tracklisting = document.querySelector(
        "#column_container_left .section_tracklisting",
      );

      if (!tracklisting) {
        return;
      }

      const section = document.createElement("div");

      section.className = "section_videos";
      section.innerHTML = `
        <div class="release_page_header"><h2>Video</h2></div>
        <div class="video" style="width: 900px;">
          <a class="video_title" href="#">Weezer - The World Has Turned And Left Me Here (2024 Remaster Official Video)</a>
          <iframe title="video preview" src="about:blank" style="width: 900px; height: 360px;"></iframe>
        </div>
      `;
      tracklisting.before(section);
    };

    new MutationObserver(injectReviewPagination).observe(document, {
      childList: true,
      subtree: true,
    });
    new MutationObserver(injectOverallRank).observe(document, {
      childList: true,
      subtree: true,
    });
    new MutationObserver(injectVideoSection).observe(document, {
      childList: true,
      subtree: true,
    });
    document.addEventListener("readystatechange", injectReviewPagination, true);
    document.addEventListener("readystatechange", injectOverallRank, true);
    document.addEventListener("readystatechange", injectVideoSection, true);
  });
  await page.goto(
    pathToFileURL(`${process.cwd()}/assets/release-page/preview.html`).href,
  );
  await page.evaluate(() => {
    const suggestions = document.querySelector("ul.suggestions");

    if (!suggestions) {
      return;
    }

    suggestions.innerHTML = `
      <li>
        <div class="page_discography_line">
          <div class="page_discography_img"></div>
          <div class="page_discography_average">3.46</div>
          <div class="page_discography_ratings">2,636</div>
          <div class="page_discography_line_1 recommended">
            <a class="release" href="#">Speed Run</a>
            <span class="page_discography_artist_names">
              <a class="artist" href="#">Frost Children</a>
            </span>
          </div>
          <div class="page_discography_line_2">
            <span class="page_discography_date">2023</span>
            <span class="page_discography_attribute">Album</span>
            <span>Electropop, Electro House</span>
          </div>
        </div>
      </li>
      <li>
        <div class="page_discography_line">
          <div class="page_discography_img"></div>
          <div class="page_discography_average">3.19</div>
          <div class="page_discography_ratings">918</div>
          <div class="page_discography_line_1">
            <a class="release" href="#">Clearing</a>
            <span class="page_discography_artist_names">
              <a class="artist" href="#">Hyd</a>
            </span>
          </div>
          <div class="page_discography_line_2">
            <span class="page_discography_date">2022</span>
            <span class="page_discography_attribute">Album</span>
            <span>Alt-Pop, Electropop</span>
          </div>
        </div>
      </li>
    `;
  });

  await expect(page).toHaveTitle(/Song for Alpha/);
  await expect(page.locator(".album_title")).toContainText("Song for Alpha");
  await expect(page.locator(".rym-modern-release-tabs")).toBeVisible();
  await expect(
    page.locator(".rym-modern-release-tab[aria-current='true']"),
  ).toHaveText("Discussion");
  await expect(page.locator(".rym-modern-release-personal-card")).toBeVisible();
  await expect(
    page.locator(".rym-modern-release-personal-card .my_catalog_rating"),
  ).toBeVisible();
  await expect(page.locator(".rym-modern-release-streaming")).toBeVisible();
  await expect(
    page.locator(".rym-modern-release-streaming .media_link_container"),
  ).toBeHidden();
  await page.locator(".rym-modern-release-streaming-summary").click();
  await expect(
    page.locator(".rym-modern-release-streaming .media_link_container"),
  ).toBeVisible();
  await expect(
    page.locator(".rym-modern-release-streaming .ui_media_link_btn").first(),
  ).toBeVisible();
  const personalStars = page.locator(
    ".rym-modern-release-personal-card .rating_stars",
  );
  const personalRatingNumber = page.locator(
    ".rym-modern-release-personal-card .rating_num",
  );
  const personalStarsBox = await personalStars.boundingBox();

  expect(personalStarsBox).not.toBeNull();
  await page.mouse.move(
    personalStarsBox.x + personalStarsBox.width * 0.7,
    personalStarsBox.y + personalStarsBox.height / 2,
  );
  await expect(personalRatingNumber).toHaveText("3.5");
  await expect(personalStars).toHaveClass(/star-7m/);
  await expect(page.locator(".rym-modern-release-rank")).toHaveText([
    "ranked #1,244 that year",
    "ranked #8,921 overall",
  ]);
  await expect(page.locator(".rym-modern-release-summary-row")).toContainText(
    "Daniel Avery",
  );
  await expect(page.locator(".rym-modern-release-summary-row")).toContainText(
    "Album",
  );
  await expect(page.locator(".rym-modern-release-summary-row")).toContainText(
    "6 April 2018",
  );
  await expect(
    page.locator(".rym-modern-release-summary-field").first(),
  ).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(
    page.locator(".rym-modern-release-summary-field").first(),
  ).toHaveCSS("border-top-style", "none");
  await expect(
    page.locator(".rym-modern-release-summary-field").first(),
  ).toHaveCSS("border-radius", "0px");
  await expect(page.locator(".rym-modern-release-summary-grid")).toHaveCSS(
    "border-top-style",
    "none",
  );
  await expect(page.locator(".rym-modern-release-summary-grid")).toHaveCSS(
    "border-bottom-style",
    "none",
  );
  await expect(
    page.getByRole("rowheader", { name: "Ranked", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("rowheader", { name: "Artist", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("rowheader", { name: "Type", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("rowheader", { name: "Released", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".section_my_catalog")).toBeHidden();
  await expect(page.locator("#reviews_shell")).toBeVisible();
  await expect(page.locator("#rym-modern-release-comments")).toBeVisible();
  await expect(page.locator("#rym-modern-release-issues")).toBeHidden();
  await expect(page.locator("#rym-modern-release-credits")).toBeHidden();
  await expect(page.locator("#rym-modern-release-lists")).toBeHidden();
  await expect(page.locator("#rym-modern-release-discussion")).toBeHidden();
  await expect(page.locator(".rym-modern-release-rating-row")).toContainText(
    "3.21",
  );
  await expect(
    page.locator(".rym-modern-release-rating-summary"),
  ).toBeVisible();
  await expect(
    page.locator(".rym-modern-release-distribution-card #chart_div"),
  ).toBeVisible();
  await expect(
    page.locator(".rym-modern-release-distribution-card #chart_div2"),
  ).toBeHidden();
  await expect(
    page
      .locator(".rym-modern-release-distribution-card")
      .getByRole("tab", { name: "Distribution" }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .locator(".rym-modern-release-distribution-card")
    .getByRole("tab", { name: "Trend" })
    .click();
  await expect(
    page.locator(".rym-modern-release-distribution-card #chart_div"),
  ).toBeHidden();
  await expect(
    page.locator(".rym-modern-release-distribution-card #chart_div2"),
  ).toBeVisible();
  expect(
    await page
      .locator(".rym-modern-release-distribution-card #chart_div2 svg")
      .evaluate((svg) => {
        const svgBox = svg.getBoundingClientRect();
        const bodyBox = document
          .querySelector(".rym-modern-release-chart-body")
          .getBoundingClientRect();

        return (
          svgBox.left >= bodyBox.left - 1 &&
          svgBox.right <= bodyBox.right + 1 &&
          svgBox.top >= bodyBox.top - 1 &&
          svgBox.bottom <= bodyBox.bottom + 1
        );
      }),
  ).toBe(true);
  await page
    .locator(".rym-modern-release-distribution-card")
    .getByRole("tab", { name: "Distribution" })
    .click();
  await expect(
    page.locator(".rym-modern-release-distribution-card #chart_div"),
  ).toBeVisible();
  expect(
    await page.locator("#chart_div").evaluate((chart) => {
      const box = chart.getBoundingClientRect();

      return box.width >= 225 && box.height >= 90;
    }),
  ).toBe(true);
  await expect(page.locator(".rym-modern-release-friends-card")).toHaveCount(0);
  await expect(page.locator(".rym-modern-release-rating-card")).toContainText(
    "3.00",
  );
  await expect(page.locator(".rym-modern-release-friends-more")).toHaveCount(0);
  await expect(page.locator(".rym-modern-release-distribution-card")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await expect(page.locator(".rym-modern-release-distribution-card")).toHaveCSS(
    "border-top-style",
    "none",
  );
  await expect(page.locator("#rym-modern-release-ratings")).toBeHidden();
  await page.locator(".rym-modern-release-friends-value .num_ratings").click();
  await expect(page.locator("#rym-modern-release-ratings")).toBeVisible();
  await expect(page.locator(".rating_info_table .rating_info_tab")).toHaveCount(
    3,
  );
  expect(
    await page
      .locator(".section_catalog .catalog_header")
      .first()
      .evaluate((header) => {
        const headerBox = header.getBoundingClientRect();
        const ratingBox = header
          .querySelector(".catalog_rating")
          ?.getBoundingClientRect();
        const commentBox = header
          .querySelector(".catalog_rating_system_comment")
          ?.getBoundingClientRect();

        return (
          ratingBox &&
          commentBox &&
          ratingBox.bottom <= commentBox.top &&
          commentBox.bottom <= headerBox.bottom + 1
        );
      }),
  ).toBe(true);
  await expect(
    page.locator(".review_rating.rym-modern-inline-stars"),
  ).not.toHaveCount(0);
  await expect(
    page.locator(".catalog_rating.rym-modern-inline-stars"),
  ).not.toHaveCount(0);
  await page.evaluate(() => {
    const catalogList = document.querySelector(
      ".section_catalog .catalog_list",
    );
    const line = document.createElement("div");

    line.className = "catalog_line";
    line.id = "rym-modern-dynamic-catalog-test";
    line.innerHTML = `
      <div class="catalog_date"><div class="catalog_date_inner">10 May 2026</div></div>
      <div class="catalog_header">
        <span class="catalog_user"><a class="user" href="#">dynamicuser</a></span>
        <span class="catalog_rating"><img src="Song%20for%20Alpha%20by%20Daniel%20Avery%20(Album,%20Ambient%20Techno)_%20Reviews,%20Ratings,%20Credits,%20Song%20list%20-%20Rate%20Your%20Music_files/8m.png" width="90" height="16" alt="4.00 stars" title="4.00 stars"></span>
        <span class="catalog_rating_system_comment hide-for-small">dynamic row</span>
      </div>
    `;
    catalogList?.append(line);
  });
  await expect(
    page.locator(
      "#rym-modern-dynamic-catalog-test .catalog_rating.rym-modern-inline-stars",
    ),
  ).toBeVisible();
  await expect(
    page.locator("#rym-modern-dynamic-catalog-test .rym-modern-star-row"),
  ).toBeVisible();
  await expect(
    page.locator(".section_tracklisting .rym-modern-track-total").first(),
  ).toHaveText("Total length: 63:05");
  await expect(page.locator("ul.tracks li.track").first()).toHaveCSS(
    "border-radius",
    "0px",
  );
  await expect(page.locator("ul.tracks li.track").first()).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await expect(page.locator(".section_videos")).toHaveCSS(
    "border-top-style",
    "solid",
  );
  await expect(page.locator(".section_videos iframe")).toBeVisible();
  await expect(page.locator(".section_videos iframe")).toHaveCSS(
    "border-top-style",
    "solid",
  );
  const videoSectionLayout = await page.evaluate(() => {
    const section = document.querySelector(".section_videos");
    const frame = section?.querySelector("iframe");
    const title = section?.querySelector(".video_title");

    if (!section || !frame || !title) {
      return null;
    }

    const sectionBox = section.getBoundingClientRect();
    const frameBox = frame.getBoundingClientRect();
    const titleBox = title.getBoundingClientRect();

    return {
      frameFits: frameBox.right <= sectionBox.right + 1,
      sectionFits: section.scrollWidth <= section.clientWidth + 1,
      titleFits: titleBox.right <= sectionBox.right + 1,
    };
  });

  expect(videoSectionLayout).toEqual({
    frameFits: true,
    sectionFits: true,
    titleFits: true,
  });
  await expect(
    page.locator(".rym-modern-track-total-source").first(),
  ).toBeHidden();
  await expect(
    page.locator(".rym-modern-release-rating-row #chart_div"),
  ).toBeVisible();
  await expect(page.locator(".section_catalog #chart_div")).toHaveCount(0);
  await expect(page.locator(".release_genres")).not.toContainText(",");
  await expect(page.locator(".release_pri_genres a.genre").first()).toHaveCSS(
    "color",
    "rgb(164, 205, 253)",
  );
  await expect(page.locator(".release_sec_genres a.genre").first()).toHaveCSS(
    "color",
    "rgb(197, 206, 218)",
  );
  await expect(page.locator(".release_pri_genres a.genre").first()).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await expect(page.locator(".release_pri_genres a.genre").first()).toHaveCSS(
    "border-radius",
    "0px",
  );
  await expect(page.locator(".release_pri_genres").first()).toHaveCSS(
    "display",
    "contents",
  );
  await expect(page.locator(".release_sec_genres").first()).toHaveCSS(
    "display",
    "contents",
  );
  await expect(
    page.locator(".rym-modern-release-lists-disclosure"),
  ).toHaveCount(0);
  await expect(
    page.locator(".page_release .rym-modern-contributions"),
  ).toBeVisible();
  await expect(
    page.locator(".page_release .rym-modern-contributions"),
  ).toHaveCSS("border-top-width", "0px");
  await expect(
    page.locator(".page_release .rym-modern-contributions .contributors a"),
  ).toHaveCount(5);
  await expect(
    page.locator(".page_release .rym-modern-contribution-actions"),
  ).not.toHaveAttribute("open", "");
  await expect(
    page.locator(".page_release .rym-modern-contributions .contribution_links"),
  ).toBeHidden();
  await page
    .locator(".page_release .rym-modern-contributions")
    .getByText(/Options/)
    .click();
  await expect(
    page.locator(".page_release .rym-modern-contributions .contribution_links"),
  ).toBeVisible();
  await expect(page.locator(".rym-modern-footer-toggle")).toHaveText(
    "Show footer",
  );
  await expect(page.locator("footer.rym-modern-site-footer")).toHaveCSS(
    "max-height",
    "0px",
  );

  const releaseOrder = await page.evaluate(() => {
    const reviews = document.querySelector("#reviews_shell");
    const comments = document.querySelector("#rym-modern-release-comments");
    const personalCard = document.querySelector(
      ".rym-modern-release-personal-card",
    );
    const artFrame = document.querySelector(".page_release_art_frame");
    const stickyStack = document.querySelector(
      ".rym-modern-release-sticky-stack",
    );
    const tracklisting = document.querySelector(".section_tracklisting");
    const releaseNavigation = document.querySelector(
      "#column_container_left .section_release_navigation",
    );
    const leftColumn = document.querySelector("#column_container_left");
    const rightColumn = document.querySelector("#column_container_right");
    const suggestions = document.querySelector(
      ".rym-modern-release-bottom-section",
    );

    return {
      personalCardAfterArt:
        artFrame.compareDocumentPosition(personalCard) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      personalCardInLeftColumn:
        personalCard.closest("#column_container_left") !== null,
      personalControlsNotInAlbumInfo:
        document.querySelector(
          ".album_info .rym-modern-release-user-rating",
        ) === null,
      stickyStackPosition: getComputedStyle(stickyStack).position,
      stickyStackZIndex: Number(getComputedStyle(stickyStack).zIndex),
      tracklistingZIndex: Number(getComputedStyle(tracklisting).zIndex),
      releaseNavigationZIndex: Number(
        getComputedStyle(releaseNavigation).zIndex,
      ),
      releaseNavigationBackground:
        getComputedStyle(releaseNavigation).backgroundColor,
      releaseNavigationLeadInBackground: getComputedStyle(
        releaseNavigation,
        "::before",
      ).backgroundColor,
      releaseNavigationTailBackground: getComputedStyle(
        releaseNavigation,
        "::after",
      ).backgroundColor,
      releaseNavigationTailHeight: getComputedStyle(
        releaseNavigation,
        "::after",
      ).height,
      leftColumnHeight: leftColumn.getBoundingClientRect().height,
      rightColumnHeight: rightColumn.getBoundingClientRect().height,
      commentsBeforeReviews:
        comments.compareDocumentPosition(reviews) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      commentsShareColumn: comments.closest("#column_container_right") !== null,
      suggestionsInMainColumn:
        suggestions.closest("#column_container_right") !== null,
      suggestionsAfterTabs:
        document
          .querySelector(".rym-modern-release-tabs")
          .compareDocumentPosition(suggestions) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      suggestionItemBackground: getComputedStyle(
        suggestions.querySelector("li"),
      ).backgroundColor,
      suggestionItemBorderRadius: getComputedStyle(
        suggestions.querySelector("li"),
      ).borderRadius,
      suggestionItemBorderBottomStyle: getComputedStyle(
        suggestions.querySelector("li"),
      ).borderBottomStyle,
      suggestionLineDisplay: getComputedStyle(
        suggestions.querySelector(".page_discography_line"),
      ).display,
      commentsFillPanel:
        Math.abs(
          comments.querySelector(".comments").getBoundingClientRect().width -
            comments.getBoundingClientRect().width,
        ) < 2,
      commentsListMaxHeight: getComputedStyle(
        comments.querySelector(".comments_list"),
      ).maxHeight,
      commentsListOverflowY: getComputedStyle(
        comments.querySelector(".comments_list"),
      ).overflowY,
      commentsScrollIntent:
        comments.querySelector(".comments_list").dataset.rymModernScrollIntent,
      commentsComposerBackground: getComputedStyle(
        comments.querySelector(".comments_post"),
      ).backgroundColor,
      commentsLoadBackground: getComputedStyle(
        comments.querySelector(".comments_load"),
      ).backgroundColor,
      commentsLoadBorderRadius: getComputedStyle(
        comments.querySelector(".comments_load"),
      ).borderRadius,
      commentsLoadDisplay: getComputedStyle(
        comments.querySelector(".comments_load"),
      ).display,
      addCommentBackground: getComputedStyle(
        comments.querySelector(".comment_post_add_btn"),
      ).backgroundColor,
      addCommentBorderRadius: getComputedStyle(
        comments.querySelector(".comment_post_add_btn"),
      ).borderRadius,
      addCommentDisplay: getComputedStyle(
        comments.querySelector(".comment_post_add_btn"),
      ).display,
      addCommentWidth: getComputedStyle(
        comments.querySelector(".comment_post_add_btn"),
      ).width,
      reviewPaginationOnOwnLine: (() => {
        const sort = document.querySelector(".review_sort");
        const pagination = document.querySelector(
          ".rym-modern-review-pagination",
        );

        if (!sort || !pagination) {
          return false;
        }

        return (
          !pagination.closest(".review_sort") &&
          pagination.getBoundingClientRect().top >=
            sort.getBoundingClientRect().bottom
        );
      })(),
      reviewColumnsAligned: [
        ".review_date",
        '[itemprop="reviewRating"]',
        'div[id^="review_voting"]',
      ].every((selector) => {
        const positions = [...reviews.querySelectorAll(".review_header")]
          .map(
            (header) =>
              header.querySelector(selector)?.getBoundingClientRect().x,
          )
          .filter((position) => Number.isFinite(position));

        return (
          positions.length > 1 &&
          Math.max(...positions) - Math.min(...positions) < 2
        );
      }),
      friendStarsFit: [
        ...document.querySelectorAll(
          ".rym-modern-release-friends-preview .catalog_header.friend",
        ),
      ].every((header) => {
        const stars = header.querySelector(".rym-modern-inline-stars");
        const headerBox = header.getBoundingClientRect();
        const starsBox = stars?.getBoundingClientRect();

        return (
          starsBox &&
          starsBox.width >= 94 &&
          starsBox.right <= headerBox.right - 4
        );
      }),
      genreRowColumnGap: getComputedStyle(
        document.querySelector(".release_genres"),
      ).columnGap,
      genreWrapperFloat: getComputedStyle(
        document.querySelector(".release_genres td:first-of-type > div"),
      ).float,
    };
  });

  expect(Boolean(releaseOrder.personalCardAfterArt)).toBe(true);
  expect(releaseOrder.personalCardInLeftColumn).toBe(true);
  expect(releaseOrder.personalControlsNotInAlbumInfo).toBe(true);
  expect(releaseOrder.stickyStackPosition).toBe("sticky");
  expect(releaseOrder.tracklistingZIndex).toBeGreaterThan(
    releaseOrder.stickyStackZIndex,
  );
  expect(releaseOrder.releaseNavigationZIndex).toBeGreaterThan(
    releaseOrder.stickyStackZIndex,
  );
  expect(releaseOrder.releaseNavigationBackground).toBe("rgb(15, 17, 23)");
  expect(releaseOrder.releaseNavigationLeadInBackground).toBe(
    "rgb(15, 17, 23)",
  );
  expect(releaseOrder.releaseNavigationTailBackground).toBe("rgb(15, 17, 23)");
  expect(Number.parseFloat(releaseOrder.releaseNavigationTailHeight)).toBe(28);
  expect(releaseOrder.leftColumnHeight).toBeGreaterThanOrEqual(
    releaseOrder.rightColumnHeight - 2,
  );
  expect(Boolean(releaseOrder.commentsBeforeReviews)).toBe(true);
  expect(releaseOrder.commentsShareColumn).toBe(true);
  expect(releaseOrder.suggestionsInMainColumn).toBe(true);
  expect(Boolean(releaseOrder.suggestionsAfterTabs)).toBe(true);
  expect(releaseOrder.suggestionItemBackground).toBe("rgba(0, 0, 0, 0)");
  expect(releaseOrder.suggestionItemBorderRadius).toBe("0px");
  expect(releaseOrder.suggestionItemBorderBottomStyle).toBe("solid");
  expect(releaseOrder.suggestionLineDisplay).toBe("grid");
  expect(releaseOrder.commentsFillPanel).toBe(true);
  expect(releaseOrder.commentsListMaxHeight).not.toBe("none");
  expect(releaseOrder.commentsListOverflowY).toBe("auto");
  expect(releaseOrder.commentsScrollIntent).toBe("true");
  expect(releaseOrder.commentsComposerBackground).toBe("rgba(0, 0, 0, 0)");
  expect(releaseOrder.commentsLoadBackground).toBe("rgba(0, 0, 0, 0)");
  expect(releaseOrder.commentsLoadBorderRadius).toBe("0px");
  expect(releaseOrder.commentsLoadDisplay).toBe("inline-flex");
  expect(releaseOrder.addCommentBackground).toBe("rgba(0, 0, 0, 0)");
  expect(releaseOrder.addCommentBorderRadius).toBe("0px");
  expect(releaseOrder.addCommentDisplay).toBe("flex");
  expect(releaseOrder.addCommentWidth).not.toBe("240px");
  expect(releaseOrder.reviewPaginationOnOwnLine).toBe(true);
  expect(releaseOrder.reviewColumnsAligned).toBe(true);
  expect(releaseOrder.friendStarsFit).toBe(true);
  expect(releaseOrder.genreRowColumnGap).toBe("14px");
  expect(releaseOrder.genreWrapperFloat).toBe("none");

  const releaseTabs = page.locator(".rym-modern-release-tabs");

  await releaseTabs.getByRole("link", { name: /^Issues/ }).click();
  await expect(page.locator("#rym-modern-release-reviews")).toBeHidden();
  await expect(page.locator("#rym-modern-release-issues")).toBeVisible();
  await expect(
    page.locator("#rym-modern-release-issues li.issue_info").first(),
  ).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(
    page.locator("#rym-modern-release-issues li.issue_info").first(),
  ).toHaveCSS("border-radius", "0px");
  await expect(
    page.locator("#rym-modern-release-issues li.issue_info").first(),
  ).toHaveCSS("border-bottom-style", "solid");
  await expect(
    page
      .locator("#rym-modern-release-issues li.issue_info:not(.release_view)")
      .first(),
  ).toHaveCSS("display", "grid");

  await releaseTabs.getByRole("link", { name: /^Credits/ }).click();
  await expect(page.locator("#rym-modern-release-credits")).toBeVisible();
  await expect(page.locator("#rym-modern-release-issues")).toBeHidden();
  await expect(
    page.locator("#rym-modern-release-credits > .release_page_header"),
  ).toBeHidden();
  await expect(
    page.locator("#rym-modern-release-credits ul.credits").first(),
  ).toHaveCSS("display", "grid");
  await expect(
    page.locator("#rym-modern-release-credits ul.credits li").first(),
  ).toHaveCSS("border-radius", "0px");
  await expect(
    page.locator("#rym-modern-release-credits ul.credits li").first(),
  ).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

  await releaseTabs.getByRole("link", { name: /^Lists/ }).click();
  await expect(page.locator("#rym-modern-release-lists")).toBeVisible();
  await expect(page.locator("#rym-modern-release-credits")).toBeHidden();
  expect(
    await page
      .locator("#rym-modern-release-lists ul.lists li")
      .first()
      .evaluate((item) => {
        const image = item
          .querySelector(".list_image")
          ?.getBoundingClientRect();
        const info = item.querySelector(".list_info")?.getBoundingClientRect();
        const itemBox = item.getBoundingClientRect();
        const infoStyle = getComputedStyle(item.querySelector(".list_info"));

        return (
          image &&
          info &&
          infoStyle.marginLeft === "0px" &&
          info.left - image.right <= 14 &&
          info.right <= itemBox.right - 8
        );
      }),
  ).toBe(true);

  await releaseTabs.getByRole("link", { name: /^Forum/ }).click();
  await expect(page.locator("#rym-modern-release-discussion")).toBeVisible();
  await expect(page.locator("#rym-modern-release-lists")).toBeHidden();
  await expect(
    page.locator(
      "#rym-modern-release-discussion .page_object_section_discussion_header",
    ),
  ).toBeHidden();
  await expect(
    page
      .locator("#rym-modern-release-discussion .page_object_discussion_thread")
      .first(),
  ).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(
    page
      .locator("#rym-modern-release-discussion .page_object_discussion_thread")
      .first(),
  ).toHaveCSS("border-radius", "0px");
  await expect(
    page
      .locator("#rym-modern-release-discussion .page_object_discussion_thread")
      .first(),
  ).toHaveCSS("border-bottom-style", "solid");
  await expect(
    page
      .locator("#rym-modern-release-discussion .page_object_discussion_thread")
      .first(),
  ).toHaveCSS("max-width", "none");
  await expect(
    page
      .locator("#rym-modern-release-discussion .page_object_discussion_thread")
      .first()
      .locator("a"),
  ).toHaveCSS("display", "block");
  await expect(
    page
      .locator(
        "#rym-modern-release-discussion .page_object_discussion_group_name",
      )
      .first(),
  ).toHaveCSS("display", "block");
});

test("modernizes the charts preview rows", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    pathToFileURL(`${process.cwd()}/assets/charts-page/preview.html`).href,
  );

  const firstChartItem = page
    .locator(".page_charts_section_charts_item.object_release")
    .first();

  await expect(firstChartItem).toBeVisible();
  await expect(
    firstChartItem.locator(".page_charts_section_charts_item_title"),
  ).toContainText("Caminhos de água");
  await expect(
    firstChartItem.locator(".page_charts_section_charts_item_credited_text"),
  ).toContainText("Kaátaìra");

  const chartRowLayout = await firstChartItem.evaluate((item) => {
    const cover = item
      .querySelector(".page_charts_section_charts_item_image_link")
      .getBoundingClientRect();
    const title = item
      .querySelector(".page_charts_section_charts_item_title")
      .getBoundingClientRect();
    const titleStyle = getComputedStyle(
      item.querySelector(".page_charts_section_charts_item_title"),
    );
    const artistStyle = getComputedStyle(
      item.querySelector(".page_charts_section_charts_item_credited_text a"),
    );

    return {
      artistFontSize: Number.parseFloat(artistStyle.fontSize),
      titleFontSize: Number.parseFloat(titleStyle.fontSize),
      titleStartsAfterCover: title.left >= cover.right + 16,
    };
  });

  expect(chartRowLayout.titleStartsAfterCover).toBe(true);
  expect(chartRowLayout.titleFontSize).toBeGreaterThan(
    chartRowLayout.artistFontSize,
  );
});

test("formats chart rows compactly on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto(
    pathToFileURL(`${process.cwd()}/assets/charts-page/preview.html`).href,
  );

  const firstChartItem = page
    .locator(".page_charts_section_charts_item.object_release")
    .first();

  await expect(firstChartItem).toBeVisible();

  const chartRowLayout = await firstChartItem.evaluate((item) => {
    const cover = item
      .querySelector(".page_charts_section_charts_item_image_link")
      .getBoundingClientRect();
    const title = item
      .querySelector(".page_charts_section_charts_item_title")
      .getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const stats = [
      ...item.querySelectorAll(".page_charts_section_charts_item_stats"),
    ].filter((el) => getComputedStyle(el).display !== "none");
    const secondaryGenres = item.querySelector(
      ".page_charts_section_charts_item_genres_secondary",
    );
    const statsMedia = item.querySelector(
      ".page_charts_section_charts_item_stats_media",
    );
    const rank = item.querySelector(
      ".page_charts_section_charts_item_number.number_main",
    );

    return {
      height: itemRect.height,
      overflowsViewport: itemRect.right > document.documentElement.clientWidth,
      rankContent: getComputedStyle(rank, "::before").content,
      secondaryGenresHeight: secondaryGenres.getBoundingClientRect().height,
      secondaryGenresText: secondaryGenres.textContent.trim(),
      statsMediaDisplay: getComputedStyle(statsMedia).display,
      titleRightOfCover: title.left > cover.right - 5,
      visibleStatsCount: stats.length,
    };
  });

  expect(chartRowLayout.height).toBeLessThan(230);
  expect(chartRowLayout.overflowsViewport).toBe(false);
  expect(chartRowLayout.rankContent).not.toBe('""');
  expect(chartRowLayout.secondaryGenresHeight).toBeGreaterThan(0);
  expect(chartRowLayout.secondaryGenresText).toContain("Post-Minimalism");
  expect(chartRowLayout.statsMediaDisplay).toBe("none");
  expect(chartRowLayout.titleRightOfCover).toBe(true);
  expect(chartRowLayout.visibleStatsCount).toBe(1);
});

test("uses the release distribution as the second column without friend ratings", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const removeFriendRatings = () => {
      for (const node of document.querySelectorAll(".catalog_header.friend")) {
        node.classList.remove("friend");
      }
    };

    new MutationObserver(removeFriendRatings).observe(document, {
      childList: true,
      subtree: true,
    });
    document.addEventListener("readystatechange", removeFriendRatings, true);
  });
  await page.goto(
    pathToFileURL(`${process.cwd()}/assets/release-page/preview.html`).href,
  );

  await expect(
    page.locator(".section_catalog .catalog_header.friend"),
  ).toHaveCount(0);
  await expect(page.locator(".rym-modern-release-friends-card")).toHaveCount(0);
  await expect(
    page.locator(".rym-modern-release-distribution-card #chart_div"),
  ).toBeVisible();
  await expect(
    page.locator(".rym-modern-release-distribution-card"),
  ).toContainText("See Catalog");
  await expect(page.locator(".rym-modern-release-distribution-card")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await expect(page.locator(".rym-modern-release-rating-summary")).toHaveClass(
    /rym-modern-release-rating-summary--distribution-only/,
  );
  const compactRatingMetrics = await page.evaluate(() => {
    const albumInfo = document.querySelector(".album_info");
    const summary = document.querySelector(
      ".rym-modern-release-rating-summary",
    );
    const distribution = document.querySelector(
      ".rym-modern-release-distribution-card",
    );

    return {
      albumInfoHeight: albumInfo.getBoundingClientRect().height,
      summaryHeight: summary.getBoundingClientRect().height,
      distributionHeight: distribution.getBoundingClientRect().height,
    };
  });

  expect(compactRatingMetrics.albumInfoHeight).toBeLessThanOrEqual(500);
  expect(compactRatingMetrics.summaryHeight).toBeLessThanOrEqual(150);
  expect(compactRatingMetrics.distributionHeight).toBeLessThanOrEqual(145);
  await expect(page.locator("#rym-modern-release-ratings")).toBeHidden();
  await page.locator(".rym-modern-release-catalog-link").click();
  await expect(page.locator("#rym-modern-release-ratings")).toBeVisible();
  await expect(
    page.locator(".rym-modern-release-rating-card #chart_div"),
  ).toHaveCount(0);
});

test("starts release pages at the top when stale modern hashes are present", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    `${pathToFileURL(`${process.cwd()}/assets/release-page/preview.html`).href}#rym-modern-release-ratings`,
  );
  await page.waitForTimeout(100);

  await expect(page.locator("#rym-modern-release-ratings")).toBeHidden();
  await expect(page).toHaveURL(/preview\.html$/);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("shortens current-year dates in the release friends preview", async ({
  page,
}) => {
  const currentYear = new Date().getFullYear();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript((year) => {
    let updated = false;
    const rewriteFirstFriendDate = () => {
      if (updated) {
        return;
      }

      const date = document
        .querySelector(".catalog_header.friend")
        ?.previousElementSibling?.querySelector(".catalog_date_inner");

      if (date) {
        date.textContent = `5 Apr ${year}`;
        updated = true;
      }
    };

    new MutationObserver(rewriteFirstFriendDate).observe(document, {
      childList: true,
      subtree: true,
    });
    document.addEventListener("readystatechange", rewriteFirstFriendDate, true);
  }, currentYear);
  await page.goto(
    pathToFileURL(`${process.cwd()}/assets/release-page/preview.html`).href,
  );

  await page.locator(".rym-modern-release-friends-value .num_ratings").click();
  await expect(page.locator("#rym-modern-release-ratings")).toBeVisible();
  await expect(
    page.locator("#rym-modern-release-ratings .catalog_header.friend").first(),
  ).toBeVisible();
  await expect(
    page
      .locator("#rym-modern-release-ratings .catalog_header.friend")
      .first()
      .locator(
        "xpath=preceding-sibling::*[1]//div[contains(@class, 'catalog_date_inner')]",
      ),
  ).toHaveText("5 Apr");
});

test("pairs recorded and language release metadata", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    let inserted = false;
    const insertRecordedRow = () => {
      if (
        inserted ||
        document.querySelector(".album_info .rym-test-recorded")
      ) {
        return;
      }

      const ratingRow = [...document.querySelectorAll(".album_info tr")].find(
        (row) =>
          row.querySelector(".info_hdr")?.textContent.trim().toLowerCase() ===
          "rym rating",
      );

      if (!ratingRow) {
        return;
      }

      const recordedRow = document.createElement("tr");
      const header = document.createElement("th");
      const value = document.createElement("td");

      recordedRow.className = "rym-test-recorded";
      header.className = "info_hdr";
      header.textContent = "Recorded";
      value.colSpan = 2;
      value.textContent = "2023 - 2026";
      recordedRow.append(header, value);
      ratingRow.before(recordedRow);
      inserted = true;
    };

    new MutationObserver(insertRecordedRow).observe(document, {
      childList: true,
      subtree: true,
    });
    document.addEventListener("readystatechange", insertRecordedRow, true);
  });
  await page.goto(
    pathToFileURL(`${process.cwd()}/assets/release-page/preview.html`).href,
  );

  await expect(
    page.locator(".rym-modern-release-language-recorded-row"),
  ).toContainText("Language");
  await expect(
    page.locator(".rym-modern-release-language-recorded-row"),
  ).toContainText("English");
  await expect(
    page.locator(".rym-modern-release-language-recorded-row"),
  ).toContainText("Recorded");
  await expect(
    page.locator(".rym-modern-release-language-recorded-row"),
  ).toContainText("2023 - 2026");
  await expect(
    page.getByRole("rowheader", { name: "Recorded", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("rowheader", { name: "Language", exact: true }),
  ).toHaveCount(0);
});

test("pairs recorded and language if recorded is added after enhancement", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    pathToFileURL(`${process.cwd()}/assets/release-page/preview.html`).href,
  );

  await expect(
    page.locator(".rym-modern-release-language-recorded-row"),
  ).toHaveCount(0);

  await page.evaluate(() => {
    const ratingRow = [...document.querySelectorAll(".album_info tr")].find(
      (row) =>
        row.querySelector(".info_hdr")?.textContent.trim().toLowerCase() ===
        "rym rating",
    );
    const recordedRow = document.createElement("tr");
    const header = document.createElement("th");
    const value = document.createElement("td");

    header.className = "info_hdr";
    header.textContent = "Recorded";
    value.colSpan = 2;
    value.textContent = "2023 - 2026";
    recordedRow.append(header, value);
    ratingRow.before(recordedRow);
  });

  await expect(
    page.locator(".rym-modern-release-language-recorded-row"),
  ).toContainText("Language");
  await expect(
    page.locator(".rym-modern-release-language-recorded-row"),
  ).toContainText("English");
  await expect(
    page.locator(".rym-modern-release-language-recorded-row"),
  ).toContainText("Recorded");
  await expect(
    page.locator(".rym-modern-release-language-recorded-row"),
  ).toContainText("2023 - 2026");
  await expect(
    page.getByRole("rowheader", { name: "Recorded", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("rowheader", { name: "Language", exact: true }),
  ).toHaveCount(0);
});
