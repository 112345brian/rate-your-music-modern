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
      requestAnimationFrame(() =>
        tabBar.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
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
          tabBar.scrollIntoView({ behavior: "smooth", block: "start" }),
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
      const label = getAlbumInfoRowLabel(row);
      return ["scenes", "scene", "movements", "movement"].includes(label);
    },
  );

  for (const taxonomyRow of taxonomyRows) {
    taxonomyRow.classList.add(
      "rym-modern-mobile-hidden",
      "rym-modern-mobile-taxonomy-moved",
    );
    const labelText =
      taxonomyRow.querySelector(".info_hdr")?.textContent.trim() ??
      taxonomyRow.querySelector("th")?.textContent.trim();
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
    cleanMobileInlineList(content);
    section.append(label, content);

    if (insertionPoint) {
      insertionPoint.after(section);
    } else {
      targetPanel.prepend(section);
    }
    insertionPoint = section;
  }
}

function getAlbumInfoRowLabel(row) {
  const labelNode =
    row.querySelector(".info_hdr") ??
    row.querySelector("th") ??
    row.firstElementChild;
  return labelNode?.textContent.trim().toLowerCase() ?? "";
}

function cleanMobileInlineList(root) {
  for (const br of root.querySelectorAll("br")) br.remove();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  for (const node of textNodes) {
    if (/^[\s,;/|•·]+$/.test(node.textContent)) {
      node.remove();
    }
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
      const label = getAlbumInfoRowLabel(row);
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
    cleanMobileInlineList(content);
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
