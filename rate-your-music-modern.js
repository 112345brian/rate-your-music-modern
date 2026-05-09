// ==UserScript==
// @name         Rate Your Music Modern
// @namespace    github.com/112345brian/rate-your-music-modern
// @version      0.4.2
// @description  Behavior enhancements for the Rate Your Music Modern userstyle.
// @author       bri
// @homepageURL  https://github.com/112345brian/rate-your-music-modern
// @supportURL   https://github.com/112345brian/rate-your-music-modern/issues
// @updateURL    https://raw.githubusercontent.com/112345brian/rate-your-music-modern/rating-on-left/rate-your-music-modern.js
// @downloadURL  https://raw.githubusercontent.com/112345brian/rate-your-music-modern/rating-on-left/rate-your-music-modern.js
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

  if (links) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const actionCount = links.querySelectorAll("a").length;

    details.className = "rym-modern-contribution-actions";
    summary.textContent = `Contribution options ${actionCount}`;
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

  const distribution = document.createElement("div");
  const summaryRow = document.createElement("tr");
  const summaryCell = document.createElement("td");
  const summary = document.createElement("div");
  const ratingCard = document.createElement("div");

  distribution.className = "rym-modern-rating-distribution";
  distribution.append(chart);

  summaryRow.className = "rym-modern-release-rating-row";
  summaryCell.colSpan = 3;
  summary.className = "rym-modern-release-rating-summary";
  ratingCard.className = "rym-modern-release-rating-card";
  ratingCard.append(
    createReleaseInfoLabel(ratingLabel.textContent),
    ratingContent,
    distribution,
  );
  summary.append(ratingCard);

  if (friendsContent) {
    const friendsCard = document.createElement("div");
    const friendsPreview = createReleaseFriendsPreview();

    friendsCard.className = "rym-modern-release-friends-card";
    friendsCard.append(createReleaseInfoLabel(friendsLabel.textContent));
    friendsCard.append(friendsContent);

    if (friendsPreview) {
      friendsCard.append(friendsPreview);
    }

    summary.append(friendsCard);
    friendsRow?.remove();
  }

  summaryCell.append(summary);
  summaryRow.append(summaryCell);
  ratingRow.before(summaryRow);
  ratingRow.remove();
}

function createReleaseInfoLabel(text) {
  const label = document.createElement("div");

  label.className = "info_hdr";
  label.textContent = text.trim();

  return label;
}

function createReleaseFriendsPreview() {
  const catalogSection = getReleaseSection(".section_catalog");
  const friendLines = [
    ...document.querySelectorAll(".section_catalog .catalog_line"),
  ].filter((line) => line.querySelector(".catalog_header.friend"));

  if (!catalogSection || friendLines.length === 0) {
    return null;
  }

  const preview = document.createElement("div");
  const moreLink = document.createElement("a");

  catalogSection.id = catalogSection.id || "rym-modern-release-ratings";
  preview.className = "rym-modern-release-friends-preview";

  for (const line of friendLines.slice(0, 3)) {
    const clone = line.cloneNode(true);

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

    preview.append(clone);
  }

  moreLink.className = "rym-modern-release-friends-more";
  moreLink.href = "#rym-modern-release-ratings";
  moreLink.textContent =
    friendLines.length > 3
      ? `Show ${friendLines.length - 3} more ratings`
      : "Show ratings";
  preview.append(moreLink);

  return preview;
}

function enhanceReleaseInlineStars() {
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
  }
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

function enhanceReleaseUserRating() {
  const catalogControls = document.querySelector(
    ".section_my_catalog .release_my_catalog",
  );
  const reviewEditor = document.querySelector(".section_my_catalog #my_review");
  const releaseArtFrame = document.querySelector(
    ".page_release .page_release_art_frame",
  );
  const albumInfoOuter = document.querySelector(".album_info_outer");
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
  const rank = rankedContent?.querySelector("b")?.textContent.trim();
  const chartLink = rankedContent?.querySelector("a[href*='/charts/']");

  if (!releasedContent) {
    return;
  }

  if (
    rankedRow &&
    rank &&
    chartLink &&
    !releasedContent.querySelector(".rym-modern-release-rank")
  ) {
    const rankLink = document.createElement("a");
    const separator = document.createElement("span");

    separator.className = "rym-modern-release-meta-separator";
    separator.textContent = " ";
    rankLink.className = "rym-modern-release-rank";
    rankLink.href = chartLink.href;
    rankLink.textContent = `ranked #${rank} that year`;
    releasedContent.append(separator, rankLink);
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
  const releaseGrid = document.querySelector(".release_page > div > .row");
  const panels = [];

  enhanceReleaseDateRank();
  enhanceReleaseGenres();
  enhanceReleaseUserRating();
  enhanceReleaseRatingHitArea();
  enhanceReleaseInlineStars();
  enhanceReleaseTrackListingHeader();
  enhanceReleaseRatingDistribution();

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

  if (suggestions && releaseGrid) {
    suggestions.classList.add("rym-modern-release-bottom-section");
    releaseGrid.after(suggestions);
  }

  document.documentElement.dataset.rymModernReleaseEnhanced = "true";
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

enhancePage();
enhanceArtistInfo();
enhanceArtistTabs();
enhanceArtistSongStats();
enhanceDiscographyFilters();
enhanceContributions();
enhanceReleasePage();
enhanceResponsiveInlineGroups();
