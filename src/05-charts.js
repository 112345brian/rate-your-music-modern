function chartCleanText(node) {
  return node ? node.textContent.replace(/\s+/g, " ").trim() : "";
}

function chartLinkData(anchor) {
  if (!anchor) {
    return null;
  }

  const locale = anchor.querySelector(
    ".ui_name_locale_original, .ui_name_locale",
  );

  return {
    href: anchor.getAttribute("href") || "",
    text: chartCleanText(locale) || chartCleanText(anchor),
  };
}

function chartReadRank(wrapper, fallbackIndex) {
  const fromId = wrapper.id && wrapper.id.match(/\d+/);

  if (fromId) {
    return fromId[0];
  }

  const fromCounter =
    wrapper.getAttribute("style") &&
    wrapper.getAttribute("style").match(/counter-reset:[^;]*?(\d+)/);

  if (fromCounter) {
    return fromCounter[1];
  }

  return String(fallbackIndex + 1);
}

function chartBuildLinkList(anchors, className) {
  const list = document.createElement("div");

  list.className = className;

  for (const anchor of anchors) {
    const data = chartLinkData(anchor);

    if (!data || !data.text) {
      continue;
    }

    const link = document.createElement("a");

    link.className = "rym-modern-chart-link";
    link.textContent = data.text;

    if (data.href) {
      link.href = data.href;
    }

    list.append(link);
  }

  return list.children.length > 0 ? list : null;
}

function buildChartRow(wrapper, item, fallbackIndex) {
  const titleLink = item.querySelector(
    ".page_charts_section_charts_item_link.release, " +
      ".page_charts_section_charts_item_link",
  );
  const imageLink = item.querySelector(
    ".page_charts_section_charts_item_image_link",
  );
  const picture = item.querySelector(".page_charts_section_charts_item_image");
  const releaseHref =
    (titleLink && titleLink.getAttribute("href")) ||
    (imageLink && imageLink.getAttribute("href")) ||
    "";
  const titleText =
    chartCleanText(
      item.querySelector(
        ".page_charts_section_charts_item_title .ui_name_locale_original",
      ),
    ) ||
    chartCleanText(
      item.querySelector(".page_charts_section_charts_item_title a"),
    );

  if (!titleText) {
    return null;
  }

  const row = document.createElement("div");

  row.className = "rym-modern-chart-row";

  // Rank
  const rank = document.createElement("div");

  rank.className = "rym-modern-chart-rank";
  rank.textContent = chartReadRank(wrapper, fallbackIndex);
  row.append(rank);

  // Cover
  const cover = document.createElement("a");

  cover.className = "rym-modern-chart-cover";

  if (releaseHref) {
    cover.href = releaseHref;
  }

  if (picture) {
    cover.append(picture);
  } else {
    const placeholder = document.createElement("span");

    placeholder.className = "rym-modern-chart-cover-empty";
    cover.append(placeholder);
  }

  row.append(cover);

  // Main column
  const main = document.createElement("div");

  main.className = "rym-modern-chart-main";

  const title = document.createElement("a");

  title.className = "rym-modern-chart-title";
  title.textContent = titleText;

  if (releaseHref) {
    title.href = releaseHref;
  }

  main.append(title);

  const artistAnchors = [
    ...item.querySelectorAll(
      ".page_charts_section_charts_item_credited_text a.artist, " +
        ".page_charts_section_charts_item_credited_text a",
    ),
  ];

  if (artistAnchors.length > 0) {
    const artists = document.createElement("div");

    artists.className = "rym-modern-chart-artist";

    artistAnchors.forEach((anchor, index) => {
      const data = chartLinkData(anchor);

      if (!data || !data.text) {
        return;
      }

      if (index > 0 && artists.children.length > 0) {
        artists.append(document.createTextNode(", "));
      }

      const link = document.createElement("a");

      link.textContent = data.text;

      if (data.href) {
        link.href = data.href;
      }

      artists.append(link);
    });

    if (artists.childNodes.length > 0) {
      main.append(artists);
    }
  }

  const dateText = chartCleanText(
    item.querySelector(
      ".page_charts_section_charts_item_title_date_compact span",
    ),
  );
  const typeText = chartCleanText(
    item.querySelector(".page_charts_section_charts_item_release_type"),
  );
  const metaParts = [typeText, dateText].filter(Boolean);

  if (metaParts.length > 0) {
    const sub = document.createElement("div");

    sub.className = "rym-modern-chart-subline";
    sub.textContent = metaParts.join(" · ");
    main.append(sub);
  }

  const primaryGenres = chartBuildLinkList(
    item.querySelectorAll(
      ".page_charts_section_charts_item_genres_primary a.genre",
    ),
    "rym-modern-chart-genres rym-modern-chart-genres--primary",
  );

  if (primaryGenres) {
    main.append(primaryGenres);
  }

  const secondaryGenres = chartBuildLinkList(
    item.querySelectorAll(
      ".page_charts_section_charts_item_genres_secondary a.genre",
    ),
    "rym-modern-chart-genres rym-modern-chart-genres--secondary",
  );

  if (secondaryGenres) {
    main.append(secondaryGenres);
  }

  const descriptorNodes = [
    ...item.querySelectorAll(
      ".page_charts_section_charts_item_genre_descriptors span",
    ),
  ]
    .map((node) => chartCleanText(node))
    .filter(Boolean);

  if (descriptorNodes.length > 0) {
    const descriptors = document.createElement("div");

    descriptors.className = "rym-modern-chart-descriptors";
    descriptors.textContent = descriptorNodes.join(" · ");
    main.append(descriptors);
  }

  row.append(main);

  // Meta column (rating, reviews, media links)
  const meta = document.createElement("div");

  meta.className = "rym-modern-chart-meta";

  const ratingValue = chartCleanText(
    item.querySelector(".page_charts_section_charts_item_details_average_num"),
  );

  if (ratingValue) {
    const rating = document.createElement("div");

    rating.className = "rym-modern-chart-rating";

    const star = document.createElement("span");

    star.className = "rym-modern-chart-rating-star";
    star.textContent = "★";

    const value = document.createElement("span");

    value.className = "rym-modern-chart-rating-value";
    value.textContent = ratingValue;

    rating.append(star, value);

    const countText = chartCleanText(
      item.querySelector(
        ".page_charts_section_charts_item_details_ratings .abbr",
      ),
    );

    if (countText) {
      const count = document.createElement("span");

      count.className = "rym-modern-chart-rating-count";
      count.textContent = countText;
      rating.append(count);
    }

    meta.append(rating);
  }

  const reviewsText = chartCleanText(
    item.querySelector(
      ".page_charts_section_charts_item_details_reviews .abbr",
    ),
  );

  if (reviewsText) {
    const reviews = document.createElement("div");

    reviews.className = "rym-modern-chart-reviews";
    reviews.textContent = `${reviewsText} reviews`;
    meta.append(reviews);
  }

  const mediaLinks = item.querySelector(
    ".page_charts_section_charts_item_media_links",
  );

  if (mediaLinks) {
    const media = document.createElement("div");

    media.className = "rym-modern-chart-media";
    media.append(mediaLinks);
    meta.append(media);
  }

  if (meta.children.length > 0) {
    row.append(meta);
  }

  return row;
}

function enhanceChartsPage() {
  if (document.documentElement.id !== "page_charts") {
    return;
  }

  const container = document.querySelector(
    "#page_charts_section_charts .page_charts_section_charts_items",
  );

  if (!container || container.dataset.rymModernEnhanced === "true") {
    return;
  }

  const wrappers = [
    ...container.querySelectorAll(".page_section_charts_item_wrapper"),
  ];

  wrappers.forEach((wrapper, index) => {
    const item = wrapper.querySelector(".page_charts_section_charts_item");

    if (!item || item.dataset.rymModernEnhanced === "true") {
      return;
    }

    let row = null;

    try {
      row = buildChartRow(wrapper, item, index);
    } catch (error) {
      console.error("[rym-modern] buildChartRow", error);
      return;
    }

    if (row) {
      item.replaceChildren(row);
      item.classList.add("rym-modern-chart-enhanced");
      item.dataset.rymModernEnhanced = "true";
    }
  });

  container.classList.add("rym-modern-chart-list");
  container.dataset.rymModernEnhanced = "true";
}
