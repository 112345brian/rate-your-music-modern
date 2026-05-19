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
    document.querySelector(".rym-modern-release-rating-summary")
  ) {
    return;
  }

  if (
    chart?.previousElementSibling?.textContent.trim().toLowerCase() ===
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

  const summaryRow = document.createElement("tr");
  const summaryCell = document.createElement("td");
  const summary = document.createElement("div");
  const ratingCard = document.createElement("div");
  const friendsPreview = createReleaseFriendsPreview();
  const hasFriendRatings = Boolean(friendsContent && friendsPreview);

  summaryRow.className = "rym-modern-release-rating-row";
  summaryCell.colSpan = 3;
  summary.className = "rym-modern-release-rating-summary";
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

  // The distribution chart relies on Google Charts, which often fails to
  // load (especially on mobile). When it's absent, still render the
  // rating summary so RYM rating and Friends rating share one row.
  let distributionCard = null;

  if (chart) {
    const distribution = document.createElement("div");
    distribution.className = "rym-modern-rating-distribution";
    distribution.append(chart);

    const chartTabs = createReleaseChartTabs([
      { label: "Distribution", panel: distribution },
      trendChart
        ? {
            label: "Trend",
            panel: createReleaseTrendPanel(trendChart),
          }
        : null,
    ]);

    distributionCard = document.createElement("div");
    distributionCard.className = "rym-modern-release-distribution-card";
    distributionCard.append(chartTabs);
    if (!hasFriendRatings && catalogSection) {
      distributionCard.append(createReleaseCatalogLink("See Catalog"));
    }
  }

  summary.classList.add(
    !distributionCard
      ? "rym-modern-release-rating-summary--no-chart"
      : hasFriendRatings
        ? "rym-modern-release-rating-summary--with-friends"
        : "rym-modern-release-rating-summary--distribution-only",
  );
  if (hasFriendRatings) {
    summary.classList.add("rym-modern-release-rating-summary--has-friends");
  }

  summary.append(ratingCard);
  if (distributionCard) {
    summary.append(distributionCard);
  }

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
  // Keep native comma separators now that genre links are plain text again.
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
