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

    const closeOverlay = () => {
      panel.classList.remove("rym-mobile-overlay-open");
      panel.hidden = true;
      document.documentElement.classList.remove("rym-mobile-overlay-active");
      for (const { el } of subSections) {
        el.hidden = false;
      }
      // Opening the overlay hid the inline Info/Lists panels, so without
      // restoring a tab the page would be blank after closing.
      document
        .querySelector(
          '.rym-modern-release-tab[data-target="rym-modern-release-info"]',
        )
        ?.click();
    };

    const closeBtn = document.createElement("button");
    closeBtn.className = "rym-mobile-overlay-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", closeOverlay);

    overlayHeader.append(tabRow, closeBtn);
    panel.prepend(overlayHeader);

    // The review composer lives in the rating widget, not in the reviews
    // section. Give the Reviews tab a sticky CTA that closes the overlay
    // and opens the native review editor.
    if (reviewsEl && !reviewsEl.querySelector(".rym-mobile-review-cta")) {
      const reviewCta = document.createElement("button");
      reviewCta.className = "rym-mobile-review-cta";
      reviewCta.textContent = "Write a review";
      reviewCta.addEventListener("click", () => {
        closeOverlay();
        const reviewBtn = document.querySelector(".review_btn");
        reviewBtn?.click();
        const editor = document.querySelector(
          "#review_edit, .my_review, .review_btn",
        );
        editor?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      reviewsEl.append(reviewCta);
    }
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
  enhanceChartsPage,
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
