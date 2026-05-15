// ==UserScript==
// @name         Rate Your Music Modern
// @namespace    github.com/112345brian/rate-your-music-modern
// @version      1.4.1
// @description  Behavior enhancements for the Rate Your Music Modern userstyle.
// @author       bri
// @homepageURL  https://github.com/112345brian/rate-your-music-modern
// @supportURL   https://github.com/112345brian/rate-your-music-modern/issues
// @updateURL    https://raw.githubusercontent.com/112345brian/rate-your-music-modern/main/rate-your-music-modern.js
// @downloadURL  https://raw.githubusercontent.com/112345brian/rate-your-music-modern/main/rate-your-music-modern.js
// @match        https://rateyourmusic.com/*
// @match        http://127.0.0.1:5173/*
// @match        http://localhost:5173/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

const ENHANCED_ROOT_CLASS = "rym-modern";

function enhancePage(root = document.documentElement) {
  root.classList.add(ENHANCED_ROOT_CLASS);
}

function slugifyLabel(label) {
  return label.trim().toLowerCase().replaceAll(/\s+/g, "-");
}

function removeCommaTextNodes(root) {
  for (const node of [...root.childNodes]) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === ",") {
      node.remove();
    }
  }
}

function normalizeContributionHeader(header) {
  if (!header) {
    return;
  }

  header.textContent = "Contributors";
}

function wrapFollowerCount(root) {
  for (const node of [...root.childNodes]) {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) {
      continue;
    }

    const count = document.createElement("span");

    count.className = "rym-modern-follower-count";
    count.textContent = node.textContent.trim();
    node.replaceWith(count);
    return;
  }
}

function enhanceFollowerLinks(root) {
  for (const link of root.querySelectorAll(".artist_follower")) {
    if (!/\bsee all\b/i.test(link.textContent)) {
      continue;
    }

    link.classList.add("rym-modern-see-all-followers");
    link.textContent = link.textContent.replaceAll(/[[\]]/g, "").trim();
  }
}

function enhanceArtistInfo() {
  for (const info of document.querySelectorAll(".artist_info_main")) {
    if (info.dataset.rymModernEnhanced === "true") {
      continue;
    }

    const fragment = document.createDocumentFragment();
    const children = [...info.childNodes];

    for (let index = 0; index < children.length; index += 1) {
      const node = children[index];

      if (
        !(node instanceof HTMLElement) ||
        !node.classList.contains("info_hdr")
      ) {
        fragment.append(node);
        continue;
      }

      const content = children[index + 1];

      if (
        !(content instanceof HTMLElement) ||
        !content.classList.contains("info_content")
      ) {
        fragment.append(node);
        continue;
      }

      const row = document.createElement("div");
      const label = slugifyLabel(node.textContent);

      row.className = `rym-modern-info-row rym-modern-info-row--${label}`;
      row.append(node, content);

      if (content.querySelector("a.genre")) {
        row.classList.add("rym-modern-info-row--tag-list");
        removeCommaTextNodes(content);
      }

      fragment.append(row);
      index += 1;
    }

    info.replaceChildren(fragment);

    for (const followerList of info.querySelectorAll(
      ".label_num_followers div",
    )) {
      removeCommaTextNodes(followerList);
      enhanceFollowerLinks(followerList);
    }

    for (const followerLabel of info.querySelectorAll(".label_num_followers")) {
      wrapFollowerCount(followerLabel);
    }

    for (const followContent of info.querySelectorAll(
      '.info_content[id^="follow_artist_"]',
    )) {
      followContent.classList.add("rym-modern-follow-row");
    }

    info.dataset.rymModernEnhanced = "true";
  }
}

function getHeaderText(root) {
  return root
    .querySelector(".artist_page_header h2, .page_object_section_header")
    ?.textContent.trim();
}

function headerMatches(root, label) {
  return getHeaderText(root)?.toLowerCase().includes(label.toLowerCase());
}

function getLeadingCount(root) {
  const match = getHeaderText(root)?.match(/^([\d,]+)/);

  return match?.[1];
}

function enhanceArtistTabs() {
  const tabList = document.querySelector(".artist_page_section");
  const discography = document.querySelector(".section_artist_discography");
  const discographyTab = tabList?.querySelector(
    ".artist_page_section_active_music",
  );

  if (
    !tabList ||
    !discography ||
    tabList.dataset.rymModernEnhanced === "true"
  ) {
    return;
  }

  discography.id = "rym-modern-discography";
  discography.classList.add("rym-modern-tab-panel");
  discographyTab?.setAttribute("aria-current", "true");
  discographyTab?.setAttribute("role", "button");
  discographyTab?.setAttribute("tabindex", "0");
  discographyTab?.setAttribute("data-target", "rym-modern-discography");

  const sectionTargets = [
    {
      id: "rym-modern-lists",
      label: "Lists",
      selector: ".section_lists",
    },
    {
      id: "rym-modern-discussion",
      label: "Discussion",
      selector: ".page_object_section_discussion",
    },
  ];
  const panels = [discography];
  const persistentPanels = [...panels];
  let insertionPoint = discography;

  function createTab(target, section) {
    const tab = document.createElement("a");
    const count = getLeadingCount(section);

    tab.className = "rym-modern-section-tab";
    tab.href = `#${target.id}`;
    tab.dataset.target = target.id;
    tab.append(target.label);

    if (count) {
      const countElement = document.createElement("span");

      countElement.className = "subtext";
      countElement.textContent = count;
      tab.append(" ", countElement);
    }

    tab.addEventListener("click", (event) => {
      event.preventDefault();
      showPanel(target.id);
    });

    return tab;
  }

  function showPanel(panelId) {
    for (const panel of panels) {
      panel.hidden = panel.id !== panelId;
    }

    for (const sectionTab of tabList.querySelectorAll(
      "[data-target], .rym-modern-section-tab",
    )) {
      sectionTab.setAttribute(
        "aria-current",
        String(sectionTab.dataset.target === panelId),
      );
    }
  }

  discographyTab?.addEventListener("click", () => {
    showPanel("rym-modern-discography");
  });
  discographyTab?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showPanel("rym-modern-discography");
    }
  });

  for (const target of sectionTargets) {
    const section = [...document.querySelectorAll(target.selector)].find(
      (candidate) => headerMatches(candidate, target.label),
    );

    if (!section) {
      continue;
    }

    section.id = target.id;
    section.hidden = true;
    section.classList.add("rym-modern-tab-panel");
    insertionPoint.after(section);
    insertionPoint = section;
    panels.push(section);
    persistentPanels.push(section);

    tabList.append(createTab(target, section));
  }

  showPanel("rym-modern-discography");
  tabList.dataset.rymModernEnhanced = "true";
}

function enhanceArtistSongStats() {
  for (const song of document.querySelectorAll(".page_artist_songs_song")) {
    if (song.dataset.rymModernStatsEnhanced === "true") {
      continue;
    }

    const lyrics = song.querySelector(".page_artist_songs_song_has_lyrics");
    const stats = song.querySelector(".page_artist_tracks_track_stats_scores");

    if (lyrics && stats) {
      lyrics.setAttribute("aria-label", "Lyrics available");
      stats.prepend(lyrics);
    }

    song.dataset.rymModernStatsEnhanced = "true";
  }
}

function collectDiscographySections(discography) {
  const sections = [];
  const children = [...discography.children];

  for (let index = 0; index < children.length; index += 1) {
    const header = children[index];

    if (!header.classList.contains("disco_header_top")) {
      continue;
    }

    const label = header
      .querySelector(".disco_header_label")
      ?.textContent.trim();
    const nodes = [header];

    for (
      let nextIndex = index + 1;
      nextIndex < children.length;
      nextIndex += 1
    ) {
      const node = children[nextIndex];

      if (node.classList.contains("disco_header_top")) {
        break;
      }

      nodes.push(node);
      index = nextIndex;
    }

    if (label) {
      sections.push({ label, nodes });
    }
  }

  return sections;
}

function createDiscographyFilterButton(filter, count) {
  const button = document.createElement("button");

  button.className = "rym-modern-disco-filter";
  button.dataset.filter = filter.id;
  button.type = "button";
  button.innerHTML = `${filter.label} <span>${count}</span>`;

  return button;
}

function expandDiscographySections(sections, labels) {
  for (const section of sections) {
    if (!labels.includes(section.label)) {
      continue;
    }

    const expanders = section.nodes.flatMap((node) => [
      ...node.querySelectorAll(
        ".disco_expand_section_link, .disco_expand_section_btn",
      ),
    ]);

    for (const expander of expanders) {
      if (expander.dataset.rymModernExpanded === "true") {
        continue;
      }

      expander.dataset.rymModernExpanded = "true";
      expander.click();
      expander.hidden = true;
    }
  }
}

function enhanceDiscographyFilters() {
  const discography = document.querySelector("#discography");
  const toolbar = document.querySelector(".disco_toolbar");

  if (
    !discography ||
    !toolbar ||
    discography.dataset.rymModernFilters === "true"
  ) {
    return;
  }

  const sections = collectDiscographySections(discography);

  if (sections.length === 0) {
    return;
  }

  const filters = [
    {
      id: "all",
      label: "All",
      labels: sections.map((section) => section.label),
    },
    { id: "albums", label: "Albums", labels: ["Album", "Live Album"] },
    { id: "eps", label: "EPs", labels: ["EP"] },
    { id: "singles", label: "Singles", labels: ["Single"] },
    { id: "videos", label: "Videos", labels: ["Music video", "Video"] },
    { id: "appearances", label: "Appears On", labels: ["Appears On"] },
  ].filter((filter) =>
    filter.labels.some((label) =>
      sections.some((section) => section.label === label),
    ),
  );

  const filterBar = document.createElement("div");

  filterBar.className = "rym-modern-disco-filters";

  function countReleases(labels) {
    return sections
      .filter((section) => labels.includes(section.label))
      .reduce(
        (total, section) =>
          total +
          section.nodes.reduce(
            (sectionTotal, node) =>
              sectionTotal + node.querySelectorAll(".disco_release").length,
            0,
          ),
        0,
      );
  }

  function applyFilter(filterId, shouldExpand = false) {
    const activeFilter = filters.find((filter) => filter.id === filterId);

    if (!activeFilter) {
      return;
    }

    if (shouldExpand) {
      expandDiscographySections(sections, activeFilter.labels);
    }

    for (const section of sections) {
      const isVisible = activeFilter.labels.includes(section.label);

      for (const node of section.nodes) {
        node.hidden = !isVisible;
      }
    }

    for (const button of filterBar.querySelectorAll("button")) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.filter === activeFilter.id),
      );
    }
  }

  for (const filter of filters) {
    const button = createDiscographyFilterButton(
      filter,
      countReleases(filter.labels),
    );

    button.addEventListener("click", () => applyFilter(filter.id, true));
    filterBar.append(button);
  }

  toolbar.after(filterBar);
  applyFilter("all");
  discography.dataset.rymModernFilters = "true";
}

function enhanceContributions() {
  const contributions = document.querySelector(".page_object_contributions");

  if (!contributions || contributions.dataset.rymModernEnhanced === "true") {
    return;
  }

  const row = contributions.closest(".row");
  const column = contributions.closest(".columns");
  const section = contributions.parentElement;
  const links = contributions.querySelector(".contribution_links");
  const contributors = contributions.querySelector(".contributors");

  row?.classList.add("rym-modern-contributions-row");
  column?.classList.add("rym-modern-contributions-column");
  section?.classList.add("rym-modern-contributions");

  if (contributors) {
    removeCommaTextNodes(contributors);
  }

  normalizeContributionHeader(
    contributions.querySelector(".contributor_header"),
  );

  if (links) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const actionCount = links.querySelectorAll("a").length;

    details.className = "rym-modern-contribution-actions";
    summary.textContent = `Options ${actionCount}`;
    details.append(summary, links);
    contributions.append(details);
  }

  contributions.dataset.rymModernEnhanced = "true";
}

function enhanceReleaseRatingDistribution() {
  const ratingLabel = [
    ...document.querySelectorAll(".album_info .info_hdr"),
  ].find((header) => header.textContent.trim().toLowerCase() === "rym rating");
  const friendsLabel = [
    ...document.querySelectorAll(".album_info .info_hdr"),
  ].find((header) => header.textContent.trim().toLowerCase() === "friends");
  const ratingRow = ratingLabel?.closest("tr");
  const friendsRow = friendsLabel?.closest("tr");
  const ratingContent = ratingRow?.querySelector("td");
  const friendsContent = friendsRow?.querySelector("td");
  const chart = document.querySelector("#chart_div");
  const trendChart = document.querySelector("#chart_div2");
  const catalogSection = prepareReleaseCatalogSection();

  truncateReleaseCatalogCurrentYearDates(catalogSection);

  if (
    !ratingRow ||
    !ratingContent ||
    !chart ||
    document.querySelector(".rym-modern-release-rating-summary")
  ) {
    return;
  }

  if (
    chart.previousElementSibling?.textContent.trim().toLowerCase() ===
    "rating distribution"
  ) {
    chart.previousElementSibling.remove();
  }

  if (
    trendChart?.previousElementSibling?.textContent.trim().toLowerCase() ===
    "rating trend"
  ) {
    trendChart.previousElementSibling.remove();
  }

  const distribution = document.createElement("div");
  const summaryRow = document.createElement("tr");
  const summaryCell = document.createElement("td");
  const summary = document.createElement("div");
  const ratingCard = document.createElement("div");
  const friendsPreview = createReleaseFriendsPreview();
  const hasFriendRatings = Boolean(friendsContent && friendsPreview);

  distribution.className = "rym-modern-rating-distribution";
  distribution.append(chart);

  summaryRow.className = "rym-modern-release-rating-row";
  summaryCell.colSpan = 3;
  summary.className = "rym-modern-release-rating-summary";
  summary.classList.add(
    hasFriendRatings
      ? "rym-modern-release-rating-summary--with-friends"
      : "rym-modern-release-rating-summary--distribution-only",
  );
  ratingCard.className = "rym-modern-release-rating-card";
  ratingCard.append(
    createReleaseInfoLabel(ratingLabel.textContent),
    ratingContent,
  );

  // Make "from N ratings" a link to the catalog/ratings section
  const numRatingsEl = ratingContent.querySelector(".num_ratings");
  if (numRatingsEl && catalogSection) {
    numRatingsEl.style.cursor = "pointer";
    numRatingsEl.classList.add("rym-modern-ratings-count-link");
    numRatingsEl.addEventListener("click", () => {
      revealReleaseCatalogSection(catalogSection);
    });
  }
  if (hasFriendRatings) {
    friendsContent.classList.add("rym-modern-release-friends-value");
    ratingCard.append(createReleaseInfoLabel(friendsLabel.textContent));
    ratingCard.append(friendsContent);

    const friendsRatingsEl = friendsContent.querySelector(".num_ratings");
    if (friendsRatingsEl && catalogSection) {
      friendsRatingsEl.style.cursor = "pointer";
      friendsRatingsEl.classList.add("rym-modern-ratings-count-link");
      friendsRatingsEl.addEventListener("click", () => {
        revealReleaseCatalogSection(catalogSection);
      });
    }
  }

  const distributionCard = document.createElement("div");
  const catalogLink = createReleaseCatalogLink("See Catalog");
  const chartTabs = createReleaseChartTabs([
    { label: "Distribution", panel: distribution },
    trendChart
      ? {
          label: "Trend",
          panel: createReleaseTrendPanel(trendChart),
        }
      : null,
  ]);

  distributionCard.className = "rym-modern-release-distribution-card";
  distributionCard.append(chartTabs);
  if (!hasFriendRatings && catalogSection) {
    distributionCard.append(catalogLink);
  }
  summary.append(ratingCard, distributionCard);

  friendsRow?.remove();
  summaryCell.append(summary);
  summaryRow.append(summaryCell);
  ratingRow.before(summaryRow);
  ratingRow.remove();
}

function createReleaseTrendPanel(chart) {
  const panel = document.createElement("div");

  panel.className = "rym-modern-rating-trend";
  panel.append(chart);

  return panel;
}

function createReleaseChartTabs(items) {
  const validItems = items.filter(Boolean);
  const shell = document.createElement("div");
  const controls = document.createElement("div");
  const body = document.createElement("div");

  shell.className = "rym-modern-release-chart-tabs";
  controls.className = "rym-modern-release-chart-tablist";
  controls.setAttribute("role", "tablist");
  body.className = "rym-modern-release-chart-body";

  validItems.forEach((item, index) => {
    const id = `rym-modern-release-chart-${slugifyLabel(item.label)}`;
    const button = document.createElement("button");

    item.panel.classList.add("rym-modern-release-chart-pane");
    item.panel.id = id;
    item.panel.hidden = index !== 0;

    button.type = "button";
    button.className = "rym-modern-release-chart-tab";
    button.textContent = item.label;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", id);
    button.setAttribute("aria-selected", index === 0 ? "true" : "false");

    button.addEventListener("click", () => {
      for (const sibling of controls.querySelectorAll(
        ".rym-modern-release-chart-tab",
      )) {
        sibling.setAttribute("aria-selected", "false");
      }

      for (const pane of body.querySelectorAll(
        ".rym-modern-release-chart-pane",
      )) {
        pane.hidden = true;
      }

      button.setAttribute("aria-selected", "true");
      item.panel.hidden = false;
    });

    controls.append(button);
    body.append(item.panel);
  });

  if (validItems.length > 1) {
    shell.append(controls);
  }

  shell.append(body);

  return shell;
}

function prepareReleaseCatalogSection() {
  const catalogSection = getReleaseSection(".section_catalog");

  if (!catalogSection) {
    return null;
  }

  catalogSection.id = catalogSection.id || "rym-modern-release-ratings";
  catalogSection.classList.add("rym-modern-release-catalog-hidden");

  return catalogSection;
}

function createReleaseCatalogLink(text) {
  const link = document.createElement("a");

  link.className = "rym-modern-release-catalog-link";
  link.href = "#rym-modern-release-ratings";
  link.textContent = text;
  link.addEventListener("click", (event) => {
    const catalogSection = document.querySelector(
      "#rym-modern-release-ratings",
    );

    if (!catalogSection) {
      return;
    }

    event.preventDefault();
    revealReleaseCatalogSection(catalogSection);
  });

  return link;
}

function revealReleaseCatalogSection(catalogSection) {
  catalogSection.classList.remove("rym-modern-release-catalog-hidden");
  catalogSection.scrollIntoView({ block: "start", behavior: "smooth" });
}

function createReleaseInfoLabel(text) {
  const label = document.createElement("div");

  label.className = "info_hdr";
  label.textContent = text.trim();

  return label;
}

function createReleaseFriendsPreview() {
  const catalogSection = prepareReleaseCatalogSection();
  const friendLines = [
    ...document.querySelectorAll(".section_catalog .catalog_line"),
  ].filter((line) => line.querySelector(".catalog_header.friend"));

  if (!catalogSection || friendLines.length === 0) {
    return null;
  }

  const preview = document.createElement("div");
  const moreLink = document.createElement("a");

  preview.className = "rym-modern-release-friends-preview";

  for (const line of friendLines.slice(0, 3)) {
    const clone = line.cloneNode(true);
    const date = clone.querySelector(".catalog_date_inner");

    clone.classList.add("rym-modern-release-friend-preview-line");

    for (const node of clone.querySelectorAll("[id]")) {
      node.removeAttribute("id");
    }

    for (const node of clone.querySelectorAll("[onclick]")) {
      node.removeAttribute("onclick");
    }

    for (const avatar of clone.querySelectorAll("[data-bkg]")) {
      const imageUrl = avatar.getAttribute("data-bkg");

      if (imageUrl) {
        avatar.style.backgroundImage = `url(${imageUrl.replace(/^\/\//, "https://")})`;
      }
    }

    if (date) {
      date.textContent = truncateCurrentYearDate(date.textContent);
    }

    preview.append(clone);
  }

  moreLink.className =
    "rym-modern-release-friends-more rym-modern-release-catalog-link";
  moreLink.href = `#${catalogSection.id}`;
  moreLink.addEventListener("click", (event) => {
    event.preventDefault();
    revealReleaseCatalogSection(catalogSection);
  });
  moreLink.textContent =
    friendLines.length > 3
      ? `Show ${friendLines.length - 3} more ratings`
      : "Show ratings";
  preview.append(moreLink);

  return preview;
}

function truncateCurrentYearDate(dateText) {
  const currentYear = String(new Date().getFullYear());
  const trimmed = dateText.trim();

  return trimmed.endsWith(` ${currentYear}`)
    ? trimmed.slice(0, -currentYear.length).trim()
    : trimmed;
}

function truncateReleaseCatalogCurrentYearDates(catalogSection) {
  if (!catalogSection) {
    return;
  }

  for (const date of catalogSection.querySelectorAll(".catalog_date_inner")) {
    date.textContent = truncateCurrentYearDate(date.textContent);
  }
}

function transformReleaseInlineStars() {
  for (const image of document.querySelectorAll(
    ".page_release .review_rating img, .page_release .catalog_rating img, .page_release .track_rating_disp img",
  )) {
    const ratingText = image.getAttribute("alt") || image.getAttribute("title");
    const ratingValue = Number.parseFloat(ratingText);
    const starStep = Number.isFinite(ratingValue)
      ? Math.max(0, Math.min(10, Math.round(ratingValue * 2)))
      : null;
    const wrapper = image.parentElement;

    if (!wrapper || starStep === null) {
      continue;
    }

    wrapper.classList.add("rym-modern-inline-stars", `star-${starStep}m`);
    wrapper.setAttribute("aria-label", ratingText);

    if (!wrapper.querySelector(".rym-modern-star-row")) {
      const row = document.createElement("span");

      row.className = "rym-modern-star-row";
      row.setAttribute("aria-hidden", "true");

      for (let starIndex = 1; starIndex <= 5; starIndex += 1) {
        const star = document.createElement("span");
        const fullStep = starIndex * 2;

        star.className = "rym-modern-star";

        if (starStep >= fullStep) {
          star.classList.add("is-full");
        } else if (starStep === fullStep - 1) {
          star.classList.add("is-half");
        } else {
          star.classList.add("is-empty");
        }

        row.append(star);
      }

      wrapper.append(row);
    }
  }
}

function enhanceReleaseInlineStars() {
  transformReleaseInlineStars();

  if (
    document.documentElement.dataset.rymModernInlineStarsObserver === "true"
  ) {
    return;
  }

  const observer = new MutationObserver(() => transformReleaseInlineStars());

  observer.observe(document.body, { childList: true, subtree: true });
  document.documentElement.dataset.rymModernInlineStarsObserver = "true";
}

function enhanceReleaseTrackListingHeader() {
  for (const section of document.querySelectorAll(
    ".page_release .section_tracklisting",
  )) {
    if (section.dataset.rymModernTrackHeader === "true") {
      continue;
    }

    const header = section.querySelector(".release_page_header");
    const total = section.querySelector(".tracklist_total");
    const credits = section.querySelector(".track_credit_show_link");

    if (!header || !total || !credits) {
      continue;
    }

    const totalColumn = document.createElement("div");

    totalColumn.className = "rym-modern-track-total";
    totalColumn.textContent = total.textContent.trim();
    header.append(totalColumn, credits);
    total.closest("li.track")?.classList.add("rym-modern-track-total-source");
    section.dataset.rymModernTrackHeader = "true";
  }
}

function enhanceReleaseReviewPagination() {
  const reviewList = document.querySelector("#reviews_shell .review_list");

  if (!reviewList) {
    return;
  }

  for (const nav of [
    ...reviewList.querySelectorAll(".navspan, .ui_pagination"),
  ]) {
    if (nav.closest(".rym-modern-review-pagination")) {
      continue;
    }

    const row = document.createElement("div");
    const sort = nav.closest(".review_sort");

    row.className = "rym-modern-review-pagination";

    if (sort) {
      sort.after(row);
    } else {
      nav.before(row);
    }

    row.append(nav);
  }
}

function enhanceReleaseUserRating() {
  const catalogControls = document.querySelector(
    ".section_my_catalog .release_my_catalog",
  );
  const reviewEditor = document.querySelector(".section_my_catalog #my_review");
  const releaseArtFrame = document.querySelector(
    ".page_release .page_release_art_frame",
  );
  const albumInfoOuter = document.querySelector(".album_info_outer");
  const mediaLinks =
    [...document.querySelectorAll(".page_release .media_link_container")].find(
      (container) => container.querySelector(".ui_media_link_btn"),
    ) ?? document.querySelector(".page_release .media_link_container");
  const existingPersonalCard = document.querySelector(
    ".rym-modern-release-personal-card",
  );

  if (!catalogControls || !releaseArtFrame || existingPersonalCard) {
    return;
  }

  const personalCard = document.createElement("section");
  const stickyStack = document.createElement("div");
  const heading = document.createElement("h2");
  const frame = document.createElement("div");
  const primaryActions = document.createElement("div");
  const rateBlock = document.createElement("div");
  const rateLabel = document.createElement("div");
  const secondaryActions = document.createElement("div");
  const streamingDisclosure = document.createElement("details");
  const streamingSummary = document.createElement("summary");
  const streamingPanel = document.createElement("div");
  const ratingControl = catalogControls.querySelector(".my_catalog_rating");
  const catalogAction = catalogControls.querySelector(".my_catalog_catalog");
  const listeningAction = catalogControls.querySelector(
    ".my_catalog_listening",
  );
  const tagAction = catalogControls.querySelector(".my_catalog_tags");
  const reviewAction = catalogControls.querySelector(".my_catalog_review");
  const trackRatingAction = catalogControls.querySelector(
    ".my_catalog_rate_tracks",
  );
  const bumpAction = catalogControls.querySelector(".my_catalog_bump");
  const touchGuidance = catalogControls.querySelector(
    ".release_touch_guidance",
  );

  stickyStack.className = "rym-modern-release-sticky-stack";
  personalCard.className = "rym-modern-release-personal-card";
  heading.className = "rym-modern-release-personal-title";
  heading.textContent = "Your rating";
  frame.className = "rym-modern-release-user-rating";
  primaryActions.className = "rym-modern-release-user-rating-primary";
  rateBlock.className = "rym-modern-release-user-rating-rate";
  rateLabel.className = "rym-modern-release-user-rating-rate-label";
  rateLabel.textContent = "Rate";
  secondaryActions.className = "rym-modern-release-user-rating-secondary";
  streamingDisclosure.className = "rym-modern-release-streaming";
  streamingSummary.className = "rym-modern-release-streaming-summary";
  streamingPanel.className = "rym-modern-release-streaming-panel";
  streamingSummary.textContent = "Listen";

  for (const action of [catalogAction, listeningAction, tagAction]) {
    if (action) {
      primaryActions.append(action);
    }
  }

  if (ratingControl) {
    rateBlock.append(rateLabel, ratingControl);
  }

  if (touchGuidance) {
    rateBlock.append(touchGuidance);
  }

  for (const action of [reviewAction, trackRatingAction, bumpAction]) {
    if (action) {
      secondaryActions.append(action);
    }
  }

  catalogControls.replaceChildren(primaryActions, rateBlock, secondaryActions);
  frame.append(catalogControls);
  personalCard.append(heading, frame);

  if (mediaLinks) {
    mediaLinks.classList.add("rym-modern-release-streaming-links");
    streamingPanel.append(mediaLinks);
    streamingDisclosure.append(streamingSummary, streamingPanel);
    personalCard.append(streamingDisclosure);
  }

  releaseArtFrame.before(stickyStack);
  stickyStack.append(releaseArtFrame, personalCard);

  if (reviewEditor && albumInfoOuter) {
    reviewEditor.classList.add("rym-modern-release-review-editor");
    albumInfoOuter.after(reviewEditor);
  }

  document
    .querySelector(".section_my_catalog")
    ?.classList.add("rym-modern-release-catalog-source");
}

function enhanceReleaseRatingHitArea() {
  const ratingConstructor = globalThis.RYMrating;

  if (
    typeof ratingConstructor !== "function" ||
    ratingConstructor.prototype.rymModernHitArea === true
  ) {
    return;
  }

  const ratingFromPointer = (event, element) => {
    const stars = element.querySelector(".rating_stars");
    const rect = stars?.getBoundingClientRect();
    const pointer = event.touches?.item(0) ?? event.changedTouches?.item(0);
    const clientX = pointer?.clientX ?? event.clientX;

    if (!rect || !Number.isFinite(clientX)) {
      return 0;
    }

    const zeroZone = Math.max(6, rect.width * 0.06);
    const x = clientX - rect.left;

    if (x <= zeroZone) {
      return 0;
    }

    if (x >= rect.width) {
      return 10;
    }

    return Math.max(
      1,
      Math.min(10, Math.ceil(((x - zeroZone) / (rect.width - zeroZone)) * 10)),
    );
  };

  ratingConstructor.prototype.rymModernHitArea = true;
  ratingConstructor.prototype.onMouseMove = function onMouseMove(
    event,
    element,
  ) {
    if (!this.loading && !this.isTouch) {
      this.setStars(ratingFromPointer(event, element));
    }
  };
  ratingConstructor.prototype.onClick = function onClick(event, element) {
    if (!this.isTouch && !this.loading) {
      const rating = ratingFromPointer(event, element);

      this.setRating(rating);
      this.rating = rating;
    }
  };
  ratingConstructor.prototype.onTouchStart = function onTouchStart(
    event,
    element,
  ) {
    if (!this.loading) {
      this.isTouch = true;
      this.setStars(ratingFromPointer(event, element));
      event.preventDefault();
    }
  };
  ratingConstructor.prototype.onTouchMove = function onTouchMove(
    event,
    element,
  ) {
    if (!this.loading) {
      this.setStars(ratingFromPointer(event, element));
      event.preventDefault();
    }
  };
}

function collectReleaseRankEntries(rankedContent) {
  const entries = [];

  for (const rankNode of rankedContent.querySelectorAll("b")) {
    const rank = rankNode.textContent.trim();

    if (!rank) {
      continue;
    }

    const parts = [];
    let cursor = rankNode.nextSibling;
    let link = null;

    while (cursor && cursor.nodeName !== "BR") {
      if (cursor instanceof HTMLAnchorElement) {
        link = cursor;
        parts.push(cursor.textContent.trim());
      } else {
        parts.push(cursor.textContent ?? "");
      }

      cursor = cursor.nextSibling;
    }

    const context = parts.join(" ").replace(/\s+/g, " ").trim();
    const contextLower = context.toLowerCase();
    const label =
      contextLower.includes("overall") || contextLower.includes("all-time")
        ? "overall"
        : /\b\d{4}\b/.test(context)
          ? "that year"
          : context.replace(/^for\s+/i, "") || "overall";

    entries.push({
      href: link?.href,
      label,
      rank,
    });
  }

  return entries;
}

function enhanceReleaseDateRank() {
  const rows = [...document.querySelectorAll(".album_info tr")];
  const artistRow = rows.find(
    (row) =>
      row.querySelector(".info_hdr")?.textContent.trim().toLowerCase() ===
      "artist",
  );
  const typeRow = rows.find(
    (row) =>
      row.querySelector(".info_hdr")?.textContent.trim().toLowerCase() ===
      "type",
  );
  const releasedRow = rows.find(
    (row) =>
      row.querySelector(".info_hdr")?.textContent.trim().toLowerCase() ===
      "released",
  );
  const rankedRow = rows.find(
    (row) =>
      row.querySelector(".info_hdr")?.textContent.trim().toLowerCase() ===
      "ranked",
  );
  const releasedContent = releasedRow?.querySelector("td");
  const rankedContent = rankedRow?.querySelector("td");
  const rankEntries = rankedContent
    ? collectReleaseRankEntries(rankedContent)
    : [];

  if (!releasedContent) {
    return;
  }

  if (
    rankedRow &&
    rankEntries.length > 0 &&
    !releasedContent.querySelector(".rym-modern-release-rank-list")
  ) {
    const rankList = document.createElement("span");
    const separator = document.createElement("span");

    separator.className = "rym-modern-release-meta-separator";
    separator.textContent = " ";
    rankList.className = "rym-modern-release-rank-list";

    for (const entry of rankEntries) {
      const rankElement = document.createElement(entry.href ? "a" : "span");

      rankElement.className = "rym-modern-release-rank";
      rankElement.textContent = `ranked #${entry.rank} ${entry.label}`;

      if (entry.href) {
        rankElement.href = entry.href;
      }

      rankList.append(rankElement);
    }

    releasedContent.append(separator, rankList);
    rankedRow.remove();
  }

  if (
    document.querySelector(".rym-modern-release-summary-row") ||
    !artistRow ||
    !typeRow
  ) {
    return;
  }

  const summaryRow = document.createElement("tr");
  const summaryCell = document.createElement("td");
  const summaryGrid = document.createElement("div");

  summaryRow.className = "rym-modern-release-summary-row";
  summaryCell.colSpan = 3;
  summaryGrid.className = "rym-modern-release-summary-grid";

  for (const [label, row] of [
    ["Artist", artistRow],
    ["Type", typeRow],
    ["Release", releasedRow],
  ]) {
    const value = row?.querySelector("td");

    if (!value) {
      continue;
    }

    const field = document.createElement("div");
    const fieldLabel = document.createElement("span");
    const fieldValue = document.createElement("span");

    field.className = "rym-modern-release-summary-field";
    fieldLabel.className = "rym-modern-release-summary-label";
    fieldLabel.textContent = label;
    fieldValue.className = "rym-modern-release-summary-value";
    fieldValue.append(...value.childNodes);
    field.append(fieldLabel, fieldValue);
    summaryGrid.append(field);
  }

  summaryCell.append(summaryGrid);
  summaryRow.append(summaryCell);
  artistRow.before(summaryRow);
  artistRow.remove();
  typeRow.remove();
  releasedRow.remove();
}

function enhanceReleaseRecordedLanguage() {
  const rows = [...document.querySelectorAll(".album_info tr")];
  const recordedRow = rows.find(
    (row) =>
      row.querySelector(".info_hdr")?.textContent.trim().toLowerCase() ===
      "recorded",
  );
  const languageRow = rows.find(
    (row) =>
      row.querySelector(".info_hdr")?.textContent.trim().toLowerCase() ===
      "language",
  );
  const recordedContent = recordedRow?.querySelector("td");
  const languageContent = languageRow?.querySelector("td");

  if (
    !recordedRow ||
    !languageRow ||
    !recordedContent ||
    !languageContent ||
    document.querySelector(".rym-modern-release-language-recorded-row")
  ) {
    return;
  }

  const pairedRow = document.createElement("tr");
  const pairedCell = document.createElement("td");
  const grid = document.createElement("div");

  pairedRow.className = "rym-modern-release-language-recorded-row";
  pairedCell.colSpan = 3;
  grid.className = "rym-modern-release-language-recorded-grid";

  for (const [label, content] of [
    ["Language", languageContent],
    ["Recorded", recordedContent],
  ]) {
    const field = document.createElement("div");
    const fieldLabel = document.createElement("span");
    const fieldValue = document.createElement("span");

    field.className = "rym-modern-release-language-recorded-field";
    fieldLabel.className = "rym-modern-release-summary-label";
    fieldLabel.textContent = label;
    fieldValue.className = "rym-modern-release-summary-value";
    fieldValue.append(...content.childNodes);
    field.append(fieldLabel, fieldValue);
    grid.append(field);
  }

  pairedCell.append(grid);
  pairedRow.append(pairedCell);
  languageRow.before(pairedRow);
  recordedRow.remove();
  languageRow.remove();

  return true;
}

function observeReleaseRecordedLanguage() {
  const albumInfo = document.querySelector(".album_info");

  if (
    !albumInfo ||
    albumInfo.dataset.rymModernRecordedLanguageObserver === "true"
  ) {
    return;
  }

  const pairRows = () => enhanceReleaseRecordedLanguage();
  const observer = new MutationObserver(pairRows);

  pairRows();
  requestAnimationFrame(pairRows);
  window.setTimeout(pairRows, 250);
  observer.observe(albumInfo, { childList: true, subtree: true });
  albumInfo.dataset.rymModernRecordedLanguageObserver = "true";
}

function enhanceReleaseGenres() {
  for (const genreGroup of document.querySelectorAll(
    ".page_release .release_pri_genres, .page_release .release_sec_genres",
  )) {
    for (const node of genreGroup.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = node.textContent.replaceAll(",", "");
      }
    }
  }
}

function findReleaseContributionsSection() {
  const heading = [
    ...document.querySelectorAll(".release_page_header h2"),
  ].find((node) => node.textContent.trim().toLowerCase() === "contributions");
  let section = heading?.parentElement;

  while (
    section &&
    !(
      section.querySelector(".contributor_header") &&
      section.querySelector(".contrib_btn")
    )
  ) {
    section = section.parentElement;
  }

  return section;
}

function enhanceReleaseContributions() {
  const section = findReleaseContributionsSection();

  if (!section || section.dataset.rymModernEnhanced === "true") {
    return;
  }

  const header = section.querySelector(".contributor_header");
  const actions = [...section.querySelectorAll("div")].find((node) =>
    node.querySelector(".contrib_btn"),
  );

  if (!header || !actions) {
    return;
  }

  const body = document.createElement("div");
  const contributors = document.createElement("span");
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const actionCount = actions.querySelectorAll("a").length;

  body.className = "page_object_contributions";
  contributors.className = "contributors";
  actions.classList.add("contribution_links");
  details.className = "rym-modern-contribution-actions";
  summary.textContent = `Options ${actionCount}`;
  normalizeContributionHeader(header);

  for (let node = header.nextSibling; node && node !== actions; ) {
    const next = node.nextSibling;

    if (node.nodeType === Node.ELEMENT_NODE && node.matches("a.user")) {
      contributors.append(node);
    } else {
      node.remove();
    }

    node = next;
  }

  details.append(summary, actions);
  body.append(header, contributors, details);
  section.append(body);
  section.classList.add("rym-modern-contributions");
  section.dataset.rymModernEnhanced = "true";
}

function enhanceFooterDisclosure() {
  const footer = document.querySelector("footer");

  if (!footer || footer.dataset.rymModernEnhanced === "true") {
    return;
  }

  const toggle = document.createElement("button");

  toggle.className = "rym-modern-footer-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "Show footer";

  toggle.addEventListener("click", () => {
    const isOpen = footer.classList.toggle("rym-modern-footer-open");

    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "Hide footer" : "Show footer";
  });

  footer.classList.add("rym-modern-site-footer");
  footer.before(toggle);
  footer.dataset.rymModernEnhanced = "true";
}

function enhanceReleaseCommentsScrollIntent() {
  for (const list of document.querySelectorAll(
    ".page_release #rym-modern-release-comments .comments_list",
  )) {
    if (list.dataset.rymModernScrollIntent === "true") {
      continue;
    }

    let hoverTimer = null;
    let isScrollArmed = false;

    const disarm = () => {
      isScrollArmed = false;
      list.classList.remove("rym-modern-scroll-armed");
      window.clearTimeout(hoverTimer);
      hoverTimer = null;
    };

    list.addEventListener("pointerenter", () => {
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => {
        isScrollArmed = true;
        list.classList.add("rym-modern-scroll-armed");
      }, 1000);
    });

    list.addEventListener("pointerleave", disarm);
    list.addEventListener("pointerdown", () => {
      isScrollArmed = true;
      list.classList.add("rym-modern-scroll-armed");
    });
    list.addEventListener(
      "wheel",
      (event) => {
        if (isScrollArmed) {
          return;
        }

        event.preventDefault();
        window.scrollBy({
          left: event.deltaX,
          top: event.deltaY,
          behavior: "auto",
        });
      },
      { passive: false },
    );

    list.dataset.rymModernScrollIntent = "true";
  }
}

function getReleaseSection(selector) {
  return [...document.querySelectorAll(selector)].find(
    (section) => !section.closest(".show-for-small"),
  );
}

function createReleaseTab(target, section) {
  const tab = document.createElement("a");
  const count = section && getLeadingCount(section);

  tab.className = "rym-modern-release-tab";
  tab.href = `#${target.id}`;
  tab.dataset.target = target.id;
  tab.append(target.label);

  if (count) {
    const countElement = document.createElement("span");

    countElement.className = "rym-modern-release-tab-count";
    countElement.textContent = count;
    tab.append(" ", countElement);
  }

  return tab;
}

function createReleasePanel(id, className = "") {
  const panel = document.createElement("section");

  panel.id = id;
  panel.className = `rym-modern-release-tab-panel ${className}`.trim();

  return panel;
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 42rem)").matches;
}

function openMobileDiscussionOverlay(panel) {
  if (!panel.querySelector(".rym-mobile-overlay-close")) {
    const overlayHeader = document.createElement("div");
    overlayHeader.className = "rym-mobile-overlay-header";

    const reviewsEl = panel.querySelector("#reviews_shell");
    const commentsEl = panel.querySelector(
      ".section_comments, #rym-modern-release-comments",
    );
    const forumEl = panel.querySelector(".page_object_section_discussion");
    const subSections = [
      { label: "Reviews", el: reviewsEl },
      { label: "Comments", el: commentsEl },
      { label: "Forum", el: forumEl },
    ].filter((s) => s.el);

    const tabRow = document.createElement("div");
    tabRow.className = "rym-mobile-discussion-tabs";

    for (const { label, el } of subSections) {
      const tab = document.createElement("button");
      tab.className = "rym-mobile-discussion-tab";
      tab.textContent = label;
      tab.addEventListener("click", () => {
        for (const { el: sEl } of subSections) {
          sEl.hidden = sEl !== el;
        }
        for (const t of tabRow.querySelectorAll(".rym-mobile-discussion-tab")) {
          t.setAttribute("aria-current", String(t === tab));
        }
        panel.scrollTop = 0;
      });
      tabRow.append(tab);
    }

    if (subSections.length > 0) {
      tabRow.firstElementChild?.setAttribute("aria-current", "true");
      for (let i = 1; i < subSections.length; i++) {
        subSections[i].el.hidden = true;
      }
    }

    const closeBtn = document.createElement("button");
    closeBtn.className = "rym-mobile-overlay-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", () => {
      panel.classList.remove("rym-mobile-overlay-open");
      panel.hidden = true;
      document.documentElement.classList.remove("rym-mobile-overlay-active");
      for (const { el } of subSections) {
        el.hidden = false;
      }
    });

    overlayHeader.append(tabRow, closeBtn);
    panel.prepend(overlayHeader);
  }

  panel.scrollTop = 0;
  panel.hidden = false;
  panel.classList.add("rym-mobile-overlay-open");
  document.documentElement.classList.add("rym-mobile-overlay-active");
}

function enhanceReleasePage() {
  if (
    !document.documentElement.classList.contains("page_release") ||
    document.documentElement.dataset.rymModernReleaseEnhanced === "true"
  ) {
    return;
  }

  const reviewsShell = document.querySelector("#reviews_shell");
  const comments = getReleaseSection(".section_comments");
  const lists = getReleaseSection(".section_lists");
  const issues = document.querySelector(
    ".hide-for-small > .section_issues.section_outer",
  );
  const credits = document.querySelector(".hide-for-small > .section_credits");
  const discussion = getReleaseSection(".page_object_section_discussion");
  const suggestions = getReleaseSection(".section_suggestions");
  const releaseMainColumn = document.querySelector("#column_container_right");
  const panels = [];

  enhanceReleaseDateRank();
  observeReleaseRecordedLanguage();
  enhanceReleaseGenres();
  enhanceReleaseUserRating();
  enhanceReleaseRatingHitArea();
  enhanceReleaseInlineStars();
  enhanceReleaseTrackListingHeader();
  enhanceReleaseReviewPagination();
  enhanceReleaseRatingDistribution();
  enhanceReleaseContributions();

  if (reviewsShell) {
    const reviewsPanel = createReleasePanel(
      "rym-modern-release-reviews",
      "rym-modern-release-reviews-panel",
    );

    reviewsShell.before(reviewsPanel);
    panels.push(reviewsPanel);

    if (comments) {
      comments.id = "rym-modern-release-comments";
      comments.classList.add("rym-modern-release-main-section");
      reviewsPanel.append(comments);
      enhanceReleaseCommentsScrollIntent();
    }

    reviewsPanel.append(reviewsShell);
  }

  if (lists) {
    lists.classList.add("rym-modern-release-main-section");
  }

  const tabTargets = [
    {
      id: "rym-modern-release-reviews",
      label: "Discussion",
      section: reviewsShell,
      panel: panels[0],
    },
    {
      id: "rym-modern-release-issues",
      label: "Issues",
      section: issues,
    },
    {
      id: "rym-modern-release-credits",
      label: "Credits",
      section: credits,
    },
    {
      id: "rym-modern-release-lists",
      label: "Lists",
      section: lists,
    },
    {
      id: "rym-modern-release-discussion",
      label: "Forum",
      section: discussion,
    },
  ].filter((target) => target.panel || target.section);

  for (const target of tabTargets) {
    if (target.panel) {
      continue;
    }

    target.panel = createReleasePanel(target.id);
    target.panel.hidden = true;
    target.panel.append(target.section);
    panels.push(target.panel);
  }

  if (panels[0] && tabTargets.length > 1) {
    const tabList = document.createElement("nav");

    tabList.className = "rym-modern-release-tabs";
    tabList.setAttribute("aria-label", "Release sections");

    for (const target of tabTargets) {
      const tab = createReleaseTab(target, target.section);

      tab.setAttribute(
        "aria-current",
        String(target.id === "rym-modern-release-reviews"),
      );
      tab.addEventListener("click", (event) => {
        event.preventDefault();

        const openOverlay = document.querySelector(".rym-mobile-overlay-open");
        if (openOverlay) {
          openOverlay.classList.remove("rym-mobile-overlay-open");
          openOverlay.hidden = true;
          document.documentElement.classList.remove(
            "rym-mobile-overlay-active",
          );
        }

        if (isMobileViewport() && target.id === "rym-modern-release-reviews") {
          openMobileDiscussionOverlay(target.panel);
          return;
        }

        for (const panel of panels) {
          panel.hidden = panel.id !== target.id;
        }

        for (const sectionTab of tabList.querySelectorAll(
          ".rym-modern-release-tab",
        )) {
          sectionTab.setAttribute(
            "aria-current",
            String(sectionTab.dataset.target === target.id),
          );
        }

        history.replaceState(null, "", `#${target.id}`);
      });

      tabList.append(tab);
    }

    panels[0].before(tabList);

    for (let index = 1; index < panels.length; index += 1) {
      panels[index - 1].after(panels[index]);
    }
  }

  if (suggestions && releaseMainColumn) {
    suggestions.classList.add("rym-modern-release-bottom-section");
    releaseMainColumn.append(suggestions);
  }

  resetReleaseInitialScrollPosition();
  document.documentElement.dataset.rymModernReleaseEnhanced = "true";
}

function resetReleaseInitialScrollPosition() {
  if (document.documentElement.dataset.rymModernInitialScrollReset === "true") {
    return;
  }

  document.documentElement.dataset.rymModernInitialScrollReset = "true";

  if (location.hash.startsWith("#rym-modern-release")) {
    history.replaceState(null, "", location.pathname + location.search);
  }

  const scrollTop = () =>
    window.scrollTo({ left: 0, top: 0, behavior: "auto" });

  scrollTop();
  requestAnimationFrame(scrollTop);
  window.setTimeout(scrollTop, 0);
}

function fitInlineGroup(element, variableName, minimumScale) {
  element.style.setProperty(variableName, "1");

  const safetyMargin = 28;
  const availableWidth = Math.max(0, element.clientWidth - safetyMargin);
  const requiredWidth = element.scrollWidth;
  const scale =
    availableWidth > 0 && requiredWidth > availableWidth
      ? Math.max(minimumScale, Math.min(1, availableWidth / requiredWidth))
      : 1;

  element.style.setProperty(variableName, scale.toFixed(3));
}

function observeInlineFit(selector, variableName, minimumScale) {
  for (const element of document.querySelectorAll(selector)) {
    if (element.dataset.rymModernFit === variableName) {
      continue;
    }

    const fit = () => fitInlineGroup(element, variableName, minimumScale);

    fit();
    requestAnimationFrame(fit);
    window.setTimeout(fit, 250);

    document.fonts?.ready?.then(fit);

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(fit);

      observer.observe(element);
    } else {
      window.addEventListener("resize", fit);
    }

    element.dataset.rymModernFit = variableName;
  }
}

function enhanceResponsiveInlineGroups() {
  observeInlineFit(".artist_page_section", "--rym-tab-scale", 0.66);
  observeInlineFit(".rym-modern-disco-filters", "--rym-filter-scale", 0.64);
}

const _enhancements = [
  buildBottomNav,
  enhancePage,
  enhanceArtistInfo,
  enhanceArtistTabs,
  enhanceArtistSongStats,
  enhanceDiscographyFilters,
  enhanceContributions,
  enhanceReleasePage,
  enhanceMobileRelease,
  enhanceResponsiveInlineGroups,
  enhanceFooterDisclosure,
];
for (const fn of _enhancements) {
  try {
    fn();
  } catch (e) {
    console.error("[rym-modern]", fn.name, e);
  }
}

function buildBottomNav() {
  if (document.querySelector(".rym-modern-bottom-nav")) {
    return;
  }

  if (window.innerWidth <= 672) {
    // The RYM site header is a <header> element. Hide it directly.
    const siteHeader =
      document.querySelector("body > header") ??
      document.querySelector(".header_logo")?.closest("header");
    siteHeader?.style.setProperty("display", "none", "important");
    // Also hide the mobile nav menu which sits outside the <header>
    document
      .querySelector(".mobile_header_menu")
      ?.style.setProperty("display", "none", "important");
  }

  const profileImgEl = document.querySelector(".header_user_img");
  const bgStyle = profileImgEl?.style.backgroundImage;
  const bgUrl = bgStyle?.match(/url\(['"]?([^'"()]+)['"]?\)/)?.[1];
  const profileSrc = bgUrl ? bgUrl.replace(/^\/\//, "https://") : null;
  const profileLink = document.querySelector(
    ".header_profile a[href*='/~'], .header_profile_main a[href*='/~']",
  );
  const profileHref = profileLink?.href ?? "/account/";

  const mobileMenuAnchors = [
    ...document.querySelectorAll(".mobile_header_menu a"),
  ];
  const exploreItems =
    mobileMenuAnchors.length > 0
      ? mobileMenuAnchors.map((a) => ({
          href: a.href,
          label: a.textContent.trim(),
        }))
      : [
          { href: "/newreleases/", label: "New Music" },
          { href: "/genres/", label: "Genres" },
          { href: "/charts/", label: "Charts" },
          { href: "/lists/", label: "Lists" },
          { href: "/forums/", label: "Forums" },
        ];

  const homeSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  const gridSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`;
  const searchSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
  const personSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

  function createNavLink(href, iconHtml, label, avatarSrc) {
    const link = document.createElement("a");

    link.className = "rym-modern-bottom-nav-item";
    link.href = href;

    const icon = document.createElement("span");

    icon.className = "rym-modern-bottom-nav-icon";

    if (avatarSrc) {
      const img = document.createElement("img");

      img.className = "rym-modern-bottom-nav-avatar";
      img.src = avatarSrc;
      img.alt = "";
      icon.append(img);
    } else {
      icon.innerHTML = iconHtml;
    }

    const labelEl = document.createElement("span");

    labelEl.className = "rym-modern-bottom-nav-label";
    labelEl.textContent = label;
    link.append(icon, labelEl);

    return link;
  }

  const nav = document.createElement("nav");

  nav.className = "rym-modern-bottom-nav";
  nav.setAttribute("aria-label", "Main navigation");

  nav.append(createNavLink("/", homeSvg, "Home"));

  const exploreBtn = document.createElement("button");

  exploreBtn.type = "button";
  exploreBtn.className =
    "rym-modern-bottom-nav-item rym-modern-bottom-nav-explore";
  exploreBtn.setAttribute("aria-expanded", "false");
  exploreBtn.setAttribute("aria-controls", "rym-modern-explore-tray");

  const exploreIcon = document.createElement("span");

  exploreIcon.className = "rym-modern-bottom-nav-icon";
  exploreIcon.innerHTML = gridSvg;

  const exploreLabel = document.createElement("span");

  exploreLabel.className = "rym-modern-bottom-nav-label";
  exploreLabel.textContent = "Explore";
  exploreBtn.append(exploreIcon, exploreLabel);
  nav.append(exploreBtn);

  const searchLink = createNavLink("/search/", searchSvg, "Search");

  searchLink.addEventListener("click", (event) => {
    const searchInput = document.querySelector(".header_search input");

    if (searchInput && searchInput.offsetParent !== null) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      searchInput.focus();
    }
  });
  nav.append(searchLink);

  nav.append(createNavLink(profileHref, personSvg, "Account", profileSrc));

  const tray = document.createElement("div");

  tray.id = "rym-modern-explore-tray";
  tray.className = "rym-modern-explore-tray";
  tray.hidden = true;
  tray.setAttribute("aria-hidden", "true");

  const backdrop = document.createElement("div");

  backdrop.className = "rym-modern-explore-backdrop";

  const panel = document.createElement("div");

  panel.className = "rym-modern-explore-panel";

  for (const item of exploreItems) {
    const link = document.createElement("a");

    link.className = "rym-modern-explore-link";
    link.href = item.href;
    link.textContent = item.label;
    panel.append(link);
  }

  tray.append(backdrop, panel);

  function openTray() {
    tray.hidden = false;
    tray.setAttribute("aria-hidden", "false");
    exploreBtn.setAttribute("aria-expanded", "true");
    exploreBtn.classList.add("rym-modern-bottom-nav-item--active");
  }

  function closeTray() {
    tray.hidden = true;
    tray.setAttribute("aria-hidden", "true");
    exploreBtn.setAttribute("aria-expanded", "false");
    exploreBtn.classList.remove("rym-modern-bottom-nav-item--active");
  }

  exploreBtn.addEventListener("click", () => {
    if (tray.hidden) {
      openTray();
    } else {
      closeTray();
    }
  });

  backdrop.addEventListener("click", closeTray);
  document.body.append(nav, tray);
}

function buildMobileRatingMore(personalCard) {
  const frame = personalCard.querySelector(".rym-modern-release-user-rating");
  if (!frame || frame.querySelector(".rym-modern-rating-action-row")) return;

  const rateRow = frame.querySelector(".rym-modern-release-user-rating-rate");
  const rateLabel = rateRow?.querySelector(
    ".rym-modern-release-user-rating-rate-label",
  );
  const bumpBtn = frame.querySelector(".bump_btn");
  const catalogBtn = frame.querySelector(".catalog_btn");
  const reviewBtn = frame.querySelector(".review_btn");
  const listeningBtn = frame.querySelector(".listening_btn");
  const tagBtn = frame.querySelector(".tag_btn");
  const trackRatingBtn = frame.querySelector(".track_rating_btn");
  const streamingEl = personalCard.querySelector(
    ".rym-modern-release-streaming",
  );
  const streamingLinks = streamingEl?.querySelector(
    ".rym-modern-release-streaming-links",
  );
  const hasStreaming = streamingLinks && streamingLinks.children.length > 0;

  // Remove "Rate" label — stars speak for themselves
  rateLabel?.remove();

  // Move bump into the rate row (stars left, bump right)
  if (bumpBtn && rateRow) {
    rateRow.append(bumpBtn);
  }

  // Play button — opens streaming options inline; greyed if none available
  const playBtn = document.createElement("button");
  playBtn.className = "rym-modern-rating-play-btn";
  playBtn.setAttribute("aria-label", "Play options");
  playBtn.innerHTML = `<span class="rym-modern-rating-play-icon">▶</span><span class="rym-modern-rating-play-label">Play</span>`;

  // Always hide the streaming element — Play button controls its visibility
  if (streamingEl) streamingEl.hidden = true;

  if (!hasStreaming) {
    playBtn.disabled = true;
    playBtn.classList.add("rym-modern-rating-play-btn--disabled");
  } else if (streamingEl) {
    let playOpen = false;
    playBtn.addEventListener("click", () => {
      playOpen = !playOpen;
      streamingEl.hidden = !playOpen;
      playBtn.classList.toggle("rym-modern-rating-play-btn--active", playOpen);
    });
  }

  // Expanded section (shown via ···): Set listening, Tags, Catalog, Track ratings
  const expandedSection = document.createElement("div");
  expandedSection.className = "rym-modern-rating-expanded-section";
  expandedSection.hidden = true;

  for (const btn of [listeningBtn, tagBtn, catalogBtn, trackRatingBtn]) {
    if (btn) expandedSection.append(btn);
  }

  // ··· toggle
  const moreBtn = document.createElement("button");
  moreBtn.className = "rym-modern-rating-more-btn";
  moreBtn.setAttribute("aria-label", "More options");
  moreBtn.textContent = "···";

  moreBtn.addEventListener("click", () => {
    const nowOpen = expandedSection.hidden;
    expandedSection.hidden = !nowOpen;
  });

  // Row 2: [Play] [Review] [···]
  const actionRow = document.createElement("div");
  actionRow.className = "rym-modern-rating-action-row";

  actionRow.append(playBtn);
  if (reviewBtn) actionRow.append(reviewBtn);
  actionRow.append(moreBtn);

  if (rateRow) {
    rateRow.after(actionRow, expandedSection);
  } else {
    frame.append(actionRow, expandedSection);
  }
}

function buildMobileInfoSubTabs(infoPanel, tabBar) {
  // Wrap current info content in an Overview sub-panel
  const overviewPanel = document.createElement("div");
  overviewPanel.className = "rym-modern-info-sub-panel";
  overviewPanel.id = "rym-modern-info-overview";
  while (infoPanel.firstChild) overviewPanel.append(infoPanel.firstChild);

  const creditsPanel = document.getElementById("rym-modern-release-credits");
  const issuesPanel = document.getElementById("rym-modern-release-issues");

  const subSections = [
    { label: "Overview", el: overviewPanel },
    { label: "Credits", el: creditsPanel },
    { label: "Issues", el: issuesPanel },
  ].filter((s) => s.el);

  const subTabBar = document.createElement("div");
  subTabBar.className = "rym-modern-info-sub-tabs";

  for (const { label, el } of subSections) {
    const tab = document.createElement("button");
    tab.className = "rym-modern-info-sub-tab";
    tab.textContent = label;
    tab.addEventListener("click", () => {
      for (const { el: sEl } of subSections) sEl.hidden = sEl !== el;
      for (const t of subTabBar.querySelectorAll(".rym-modern-info-sub-tab")) {
        t.setAttribute("aria-current", String(t === tab));
      }
    });
    subTabBar.append(tab);
  }

  subTabBar.firstElementChild?.setAttribute("aria-current", "true");
  // Overview visible, rest hidden
  for (let i = 1; i < subSections.length; i++) subSections[i].el.hidden = true;

  infoPanel.append(subTabBar, ...subSections.map((s) => s.el));

  // Remove Credits and Issues from the main tab bar
  for (const id of [
    "rym-modern-release-credits",
    "rym-modern-release-issues",
  ]) {
    tabBar.querySelector(`[data-target="${id}"]`)?.remove();
  }
}

function enhanceMobileRelease() {
  if (!isMobileViewport()) return;
  if (!document.documentElement.classList.contains("page_release")) return;

  const tabBar = document.querySelector(".rym-modern-release-tabs");
  if (!tabBar) return;

  const mainInfo = document.querySelector(".section_main_info");
  if (!mainInfo) return;

  buildMobileHeroMeta(mainInfo);

  // Unified card: hero + ratings + nav + personal widget in one bordered container
  const pageSection = mainInfo.querySelector(".page_section");
  const albumInfoOuter = mainInfo.querySelector(".album_info_outer");
  const personalCard = document.querySelector(
    ".rym-modern-release-personal-card",
  );
  if (albumInfoOuter && personalCard) {
    const navEl = document.querySelector(".section_release_navigation");

    // Wrap cover + title + meta in a hero section at the top of the card.
    // Use direct-child search to avoid matching nested show-for-small elements.
    const heroSection = document.createElement("div");
    heroSection.className = "rym-modern-mobile-hero-section";
    const pageSectionKids = pageSection ? [...pageSection.children] : [];
    const coverEl = pageSectionKids.find((el) =>
      el.classList.contains("show-for-small"),
    );
    const titleEl = pageSectionKids.find((el) =>
      el.classList.contains("album_title"),
    );
    const metaEl = pageSectionKids.find((el) =>
      el.classList.contains("rym-modern-mobile-hero-meta"),
    );
    if (coverEl) heroSection.append(coverEl);
    if (titleEl) heroSection.append(titleEl);
    if (metaEl) heroSection.append(metaEl);

    const unifiedCard = document.createElement("div");
    unifiedCard.className = "rym-modern-mobile-unified-card";
    albumInfoOuter.replaceWith(unifiedCard);
    unifiedCard.append(heroSection, albumInfoOuter);
    if (navEl) unifiedCard.append(navEl);
    unifiedCard.append(personalCard);

    buildMobileRatingMore(personalCard);
  }

  const infoPanel = buildMobileInfoPanel();

  mainInfo.after(tabBar);

  if (infoPanel) {
    const firstPanel = document.querySelector(".rym-modern-release-tab-panel");
    if (firstPanel) {
      firstPanel.before(infoPanel);
    } else {
      tabBar.after(infoPanel);
    }

    const infoTab = document.createElement("a");
    infoTab.className = "rym-modern-release-tab";
    infoTab.href = "#rym-modern-release-info";
    infoTab.dataset.target = "rym-modern-release-info";
    infoTab.textContent = "Info";
    infoTab.setAttribute("aria-current", "true");
    tabBar.prepend(infoTab);

    for (const tab of tabBar.querySelectorAll(
      ".rym-modern-release-tab:not(:first-child)",
    )) {
      tab.setAttribute("aria-current", "false");
    }

    for (const panel of document.querySelectorAll(
      ".rym-modern-release-tab-panel:not(#rym-modern-release-info)",
    )) {
      panel.hidden = true;
    }

    // Move Forum content into the Discussion overlay; remove Forum from main bar
    const forumPanel = document.getElementById("rym-modern-release-discussion");
    const reviewsPanel = document.getElementById("rym-modern-release-reviews");
    if (forumPanel && reviewsPanel) {
      const forumContent = forumPanel.querySelector(
        ".page_object_section_discussion",
      );
      if (forumContent) reviewsPanel.append(forumContent);
      forumPanel.remove();
    }
    tabBar
      .querySelector('[data-target="rym-modern-release-discussion"]')
      ?.remove();

    // Build Info sub-tabs (Overview / Credits / Issues)
    buildMobileInfoSubTabs(infoPanel, tabBar);
    moveMobileTaxonomyRowsToInfo(infoPanel);
    const albumInfoTable = document.querySelector(".album_info");
    if (albumInfoTable) {
      new MutationObserver(() =>
        moveMobileTaxonomyRowsToInfo(infoPanel),
      ).observe(albumInfoTable, { childList: true, subtree: true });
    }

    infoTab.addEventListener("click", (event) => {
      event.preventDefault();
      for (const panel of document.querySelectorAll(
        ".rym-modern-release-tab-panel",
      )) {
        panel.hidden = panel !== infoPanel;
      }
      for (const tab of tabBar.querySelectorAll(".rym-modern-release-tab")) {
        tab.setAttribute("aria-current", String(tab === infoTab));
      }
      history.replaceState(null, "", "#rym-modern-release-info");
    });

    tabBar.addEventListener(
      "click",
      (event) => {
        const tab = event.target.closest(".rym-modern-release-tab");
        if (tab && tab !== infoTab) {
          infoPanel.hidden = true;
          infoTab.setAttribute("aria-current", "false");
        }
      },
      true,
    );
  }

  for (const tab of tabBar.querySelectorAll(".rym-modern-release-tab")) {
    if (tab.dataset.target === "rym-modern-release-info") continue;
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.target;
      if (!targetId || targetId === "rym-modern-release-reviews") return;
      const panel = document.getElementById(targetId);
      if (panel && !panel.hidden) {
        requestAnimationFrame(() =>
          panel.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      }
    });
  }
}

function buildMobileHeroMeta(mainInfo) {
  const summaryRow = mainInfo.querySelector(".rym-modern-release-summary-row");
  const titleEl = mainInfo.querySelector(".album_title");
  if (!summaryRow || !titleEl) return;

  const fields = {};
  for (const field of summaryRow.querySelectorAll(
    ".rym-modern-release-summary-field",
  )) {
    const label = field
      .querySelector(".rym-modern-release-summary-label")
      ?.textContent.trim()
      .toLowerCase();
    const value = field.querySelector(".rym-modern-release-summary-value");
    if (label && value) fields[label] = value;
  }

  const heroMeta = document.createElement("div");
  heroMeta.className = "rym-modern-mobile-hero-meta";

  const typeText = fields.type?.textContent.trim();
  const artistValue = fields.artist;
  if (typeText || artistValue) {
    const line = document.createElement("div");
    line.className = "rym-modern-mobile-hero-type-artist";
    if (typeText) line.append(typeText);
    if (typeText && artistValue) line.append(" by ");
    if (artistValue) line.append(...artistValue.cloneNode(true).childNodes);
    heroMeta.append(line);
  }

  const releaseValue = fields.release;
  if (releaseValue) {
    const line = document.createElement("div");
    line.className = "rym-modern-mobile-hero-release";
    line.append(...releaseValue.cloneNode(true).childNodes);
    heroMeta.append(line);
  }

  titleEl.after(heroMeta);
  summaryRow.classList.add("rym-modern-mobile-hidden");
}

function moveMobileTaxonomyRowsToInfo(infoPanel) {
  if (!infoPanel) return;
  const targetPanel =
    document.getElementById("rym-modern-info-overview") ?? infoPanel;
  let insertionPoint = [
    ...targetPanel.querySelectorAll(".rym-modern-info-section"),
  ].find(
    (section) =>
      section
        .querySelector(".rym-modern-info-label")
        ?.textContent.trim()
        .toLowerCase() === "genres",
  );

  const taxonomyRows = [...document.querySelectorAll(".album_info tr")].filter(
    (row) => {
      if (row.classList.contains("rym-modern-mobile-taxonomy-moved")) {
        return false;
      }
      const label = row
        .querySelector(".info_hdr")
        ?.textContent.trim()
        .toLowerCase();
      return ["scenes", "scene", "movements", "movement"].includes(label);
    },
  );

  for (const taxonomyRow of taxonomyRows) {
    taxonomyRow.classList.add(
      "rym-modern-mobile-hidden",
      "rym-modern-mobile-taxonomy-moved",
    );
    const labelText = taxonomyRow
      .querySelector(".info_hdr")
      ?.textContent.trim();
    const td = taxonomyRow.querySelector("td");
    if (!labelText || !td) continue;

    const section = document.createElement("div");
    section.className =
      "rym-modern-info-section rym-modern-info-section--taxonomy";
    const label = document.createElement("div");
    label.className = "rym-modern-info-label";
    label.textContent = labelText;
    const content = document.createElement("div");
    content.className = "rym-modern-info-values";
    content.append(...[...td.childNodes].map((node) => node.cloneNode(true)));
    section.append(label, content);

    if (insertionPoint) {
      insertionPoint.after(section);
    } else {
      targetPanel.prepend(section);
    }
    insertionPoint = section;
  }
}

function buildMobileInfoPanel() {
  // Use class-based selector — more reliable than matching .info_hdr text
  const genreRow = document.querySelector(".album_info tr.release_genres");
  const descriptorRow = document
    .querySelector(".album_info .release_pri_descriptors")
    ?.closest("tr");
  const hasTaxonomyRows = [...document.querySelectorAll(".album_info tr")].some(
    (row) => {
      const label = row
        .querySelector(".info_hdr")
        ?.textContent.trim()
        .toLowerCase();
      return ["scenes", "scene", "movements", "movement"].includes(label);
    },
  );

  // Language: either already paired with Recorded, or still a plain TR
  const languagePairedRow = document.querySelector(
    ".album_info .rym-modern-release-language-recorded-row",
  );
  const languagePlainRow = !languagePairedRow
    ? [...document.querySelectorAll(".album_info tr")].find(
        (row) =>
          row.querySelector(".info_hdr")?.textContent.trim().toLowerCase() ===
          "language",
      )
    : null;

  // Use the show-for-small tracklist (already mobile-visible, avoids duplicate
  // with the hide-for-small desktop tracklist which stays hidden on mobile)
  const tracklist =
    document.querySelector(".show-for-small .section_tracklisting") ??
    getReleaseSection(".section_tracklisting");

  if (
    !genreRow &&
    !hasTaxonomyRows &&
    !descriptorRow &&
    !tracklist &&
    !languagePairedRow &&
    !languagePlainRow
  )
    return null;

  const panel = document.createElement("div");
  panel.id = "rym-modern-release-info";
  panel.className =
    "rym-modern-release-tab-panel rym-modern-release-info-panel";

  if (genreRow) {
    genreRow.classList.add("rym-modern-mobile-hidden");
    const sec = document.createElement("div");
    sec.className = "rym-modern-info-section";
    const lbl = document.createElement("div");
    lbl.className = "rym-modern-info-label";
    lbl.textContent = "Genres";
    const content = document.createElement("div");
    content.className = "rym-modern-info-genres";
    const pri = genreRow.querySelector(".release_pri_genres");
    const sec2 = genreRow.querySelector(".release_sec_genres");
    if (pri) content.append(pri.cloneNode(true));
    if (sec2) content.append(sec2.cloneNode(true));
    sec.append(lbl, content);
    panel.append(sec);
  }

  moveMobileTaxonomyRowsToInfo(panel);

  if (descriptorRow) {
    descriptorRow.classList.add("rym-modern-mobile-hidden");
    const sec = document.createElement("div");
    sec.className = "rym-modern-info-section";
    const lbl = document.createElement("div");
    lbl.className = "rym-modern-info-label";
    lbl.textContent = "Descriptors";
    const descriptors = descriptorRow.querySelector(".release_pri_descriptors");
    if (descriptors) sec.append(lbl, descriptors.cloneNode(true));
    panel.append(sec);
  }

  if (languagePairedRow) {
    languagePairedRow.classList.add("rym-modern-mobile-hidden");
    const sec = document.createElement("div");
    sec.className = "rym-modern-info-section";
    const grid = languagePairedRow.querySelector(
      ".rym-modern-release-language-recorded-grid",
    );
    if (grid) sec.append(grid.cloneNode(true));
    panel.append(sec);
  } else if (languagePlainRow) {
    languagePlainRow.classList.add("rym-modern-mobile-hidden");
    const sec = document.createElement("div");
    sec.className = "rym-modern-info-section";
    const lbl = document.createElement("div");
    lbl.className = "rym-modern-info-label";
    lbl.textContent = "Language";
    const td = languagePlainRow.querySelector("td");
    if (td) {
      const val = document.createElement("div");
      val.append(...[...td.childNodes].map((n) => n.cloneNode(true)));
      sec.append(lbl, val);
    }
    panel.append(sec);
  }

  if (tracklist) {
    panel.append(tracklist);
  }

  return panel;
}
