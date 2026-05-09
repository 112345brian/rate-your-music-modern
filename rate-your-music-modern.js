// ==UserScript==
// @name         Rate Your Music Modern
// @namespace    github.com/112345brian/rate-your-music-modern
// @version      0.2.7
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
  const compactLayout = window.matchMedia("(width <= 82rem)");

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
  let activePanelId = "rym-modern-discography";

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
    activePanelId = panelId;

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

  const songsSection = [...document.querySelectorAll(".section_lists")].find(
    (candidate) =>
      candidate.closest(".artist_right_col") &&
      headerMatches(candidate, "Songs"),
  );
  const songsTab =
    songsSection &&
    createTab(
      {
        id: "rym-modern-songs",
        label: "Songs",
      },
      songsSection,
    );
  const songsPlaceholder = document.createComment("rym-modern-songs-home");

  if (songsSection && songsTab) {
    songsSection.before(songsPlaceholder);
    songsTab.classList.add("rym-modern-songs-tab");
    songsTab.hidden = true;
    tabList.append(songsTab);
  }

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

  function syncSongsPanel() {
    if (!songsSection || !songsTab) {
      return;
    }

    panels.length = 0;
    panels.push(...persistentPanels);

    if (compactLayout.matches) {
      songsSection.id = "rym-modern-songs";
      songsSection.classList.add("rym-modern-tab-panel");
      songsTab.hidden = false;

      if (songsSection.parentElement !== discography.parentElement) {
        discography.after(songsSection);
      }

      if (!panels.includes(songsSection)) {
        panels.splice(1, 0, songsSection);
      }

      songsSection.hidden = activePanelId !== songsSection.id;
    } else {
      if (activePanelId === "rym-modern-songs") {
        activePanelId = "rym-modern-discography";
      }

      songsTab.hidden = true;
      songsSection.hidden = false;
      songsSection.classList.remove("rym-modern-tab-panel");
      songsSection.removeAttribute("id");
      songsPlaceholder.after(songsSection);
    }

    showPanel(activePanelId);
  }

  compactLayout.addEventListener("change", syncSongsPanel);
  syncSongsPanel();
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
enhanceResponsiveInlineGroups();
