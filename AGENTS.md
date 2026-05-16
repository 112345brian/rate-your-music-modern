# Agent Guide — read this before modifying anything

This repo is a Stylus user-CSS plus Tampermonkey user-JS project that restyles
rateyourmusic.com, with a heavy mobile redesign. This file is the map for any
AI coding assistant or human maintainer so the architecture does not need to be
rediscovered on every change.

## Golden Rule: Root Bundles Are Generated

Do not hand-edit the generated root bundles.

| Generated file               | Built from                   | Build script                      |
| ---------------------------- | ---------------------------- | --------------------------------- |
| `rate-your-music-modern.css` | `css/*.css`                  | `scripts/build-css.mjs`           |
| `rate-your-music-modern.js`  | `src/*.js`                   | `scripts/build-js.mjs`            |
| `preview.css`                | `rate-your-music-modern.css` | `scripts/build-preview-css.mjs`   |
| `assets/*/preview.html`      | saved RYM `*.html` fixtures  | `scripts/build-preview-pages.mjs` |

Edit `css/*.css` and `src/*.js`, then run `npm run sync:preview`. Hand-edits to
generated bundles are overwritten on the next build.

## Metadata Versions

Versions live in the build scripts, not in the generated bundles.

- Userscript `@version`: `scripts/build-js.mjs`
- Userstyle `@version`: `scripts/build-css.mjs`

Bump the side you changed. JS-only changes only need the userscript version;
CSS-only changes only need the userstyle version. Both update URLs point at raw
files on `main`, so version bumps are what make Stylus and Tampermonkey
re-download.

## Source Map

### JavaScript: `src/*.js`

`scripts/build-js.mjs` concatenates these files in order into one userscript.
This is not an ES module build, so do not use `import` or `export`.

- `01-artist.js`: generic DOM helpers, artist info, artist tabs, song stats,
  discography filters, follower counts, and `enhancePage`.
- `02-release-core.js`: most release-page behavior, including rating summary,
  catalog and friends preview, inline stars, tracklist header, review
  pagination, user-rating widget, date and rank handling, recorded/language
  pairing, genres, footer disclosure, and comment scrolling.
- `03-release-tabs.js`: release tab and panel helpers, mobile viewport checks,
  mobile discussion overlay, release page assembly, scroll reset, inline-fit
  helpers, and the enhancement runner.
- `04-mobile.js`: bottom navigation, mobile rating more menu, mobile Info
  sub-tabs, mobile release wrapper, hero metadata, taxonomy moves, and mobile
  Info panel.
- `05-charts.js`: `enhanceChartsPage` — rebuilds each chart item's nested RYM
  markup into a flat `.rym-modern-chart-row` DOM (rank, cover, main, meta).
  This is a full DOM restructure, not CSS-only; `charts.css` styles the
  rebuilt classes, not RYM's `.page_charts_section_charts_item_*` markup.

The enhancement runner lives at the end of `03-release-tabs.js`. Functions
defined in later files (`04`, `05`) are reachable from it via function
hoisting in the concatenated scope — add new enhancements to the
`_enhancements` array there and to `SOURCE_FILES` in `build-js.mjs`.

### CSS: `css/*.css`

- `base.css`: variables and resets.
- `artist.css`, `charts.css`, `mobile-nav.css`: page-specific styles.
- `release.css`: the large release-page stylesheet. Desktop rules come first;
  mobile rules are later. Build order is base, artist, release, charts,
  mobile-nav.

## CSS Specificity

RYM markup and desktop rules often use ID/element selectors with `!important`.
Plain mobile class overrides can silently lose. Before adding a mobile rule,
grep the matching base rule and match or exceed its specificity with
`.page_release`, the relevant `#id`, an element qualifier, or a
`.rym-modern-mobile-unified-card` parent. Verify computed styles in Playwright
instead of relying on rule presence.

## Mobile Release Architecture

- Mobile breakpoint: `@media only screen and (max-width: 42rem)`.
- Desktop starts at `(width >= 43rem)`, with an additional `(width < 66rem)`
  tier. Keep phone-only changes inside the 42rem block.
- `enhanceMobileRelease` reparents the hero, rating info, release navigation,
  and personal interaction widget into `.rym-modern-mobile-unified-card`.
- Mobile top tabs are Info, Discussion, and Lists.
- Discussion opens a full-screen overlay through `openMobileDiscussionOverlay`;
  it is not an inline panel.
- Closing the overlay must restore Info as the active panel, otherwise the page
  can be left blank.
- The review composer lives in the rating widget and is toggled by the native
  `.review_btn`; overlay CTAs delegate to that button.
- Bottom navigation and overlays must account for
  `env(safe-area-inset-bottom)`.

## Rating Summary

`enhanceReleaseRatingDistribution` builds the unified RYM/Friends summary.
Google Charts can fail on real mobile, so this code must not require
`#chart_div`.

Important modifier classes on `.rym-modern-release-rating-summary`:

- `--with-friends` / `--distribution-only`: desktop layout variants.
- `--no-chart`: chart missing; rating card spans full width on desktop.
- `--has-friends`: friend ratings exist, with or without a chart. Mobile uses
  this for the RYM/Friends two-column layout.

If this function changes, test the no-chart path. The preview fixture has a
chart; real phones often do not.

## Workflow

```sh
npm run dev
npm run sync:preview
npm run check
```

Use Playwright against `assets/<page>/preview.html` with `devices["Pixel 5"]`
for mobile verification. Prefer computed styles and bounding boxes in addition
to screenshots.

## Commit Checklist

When committing:

1. Edit source files in `src/*.js` and/or `css/*.css`.
2. Bump the relevant build-script version.
3. Run `npm run check`.
4. Commit source changes and regenerated bundles together.
5. Push with `git push origin HEAD:main`.

If push is rejected, run `git fetch` and `git rebase origin/main`; do not
force-push.
