// ==UserScript==
// @name         Rate Your Music Modern
// @namespace    github.com/112345brian/rate-your-music-modern
// @version      0.1.4
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

function enhanceArtistTabs() {
  const tabList = document.querySelector(".artist_page_section");

  if (!tabList || tabList.dataset.rymModernEnhanced === "true") {
    return;
  }

  const sectionTargets = [
    {
      id: "rym-modern-songs",
      label: "Songs",
      selector: ".artist_right_col .section_lists",
    },
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

  for (const target of sectionTargets) {
    const section = [...document.querySelectorAll(target.selector)].find(
      (candidate) => headerMatches(candidate, target.label),
    );

    if (!section) {
      continue;
    }

    section.id = target.id;

    const tab = document.createElement("a");

    tab.className = "rym-modern-section-tab";
    tab.href = `#${target.id}`;
    tab.textContent = target.label;
    tabList.append(tab);
  }

  tabList.dataset.rymModernEnhanced = "true";
}

function collectDiscographySections(discography) {
  const sections = [];
  const children = [...discography.children];

  for (let index = 0; index < children.length; index += 1) {
    const header = children[index];

    if (!header.classList.contains("disco_header_top")) {
      continue;
    }

    const label = header.querySelector(".disco_header_label")?.textContent.trim();
    const nodes = [header];

    for (let nextIndex = index + 1; nextIndex < children.length; nextIndex += 1) {
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
    { id: "all", label: "All", labels: sections.map((section) => section.label) },
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

  function applyFilter(filterId) {
    const activeFilter = filters.find((filter) => filter.id === filterId);

    if (!activeFilter) {
      return;
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

    button.addEventListener("click", () => applyFilter(filter.id));
    filterBar.append(button);
  }

  toolbar.after(filterBar);
  applyFilter("all");
  discography.dataset.rymModernFilters = "true";
}

enhancePage();
enhanceArtistInfo();
enhanceArtistTabs();
enhanceDiscographyFilters();
