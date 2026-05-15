# Rate Your Music Modern

User CSS for Stylus and user JavaScript for Tampermonkey.

## Install

- Stylus: <https://raw.githubusercontent.com/112345brian/rate-your-music-modern/main/rate-your-music-modern.css>
- Tampermonkey: <https://raw.githubusercontent.com/112345brian/rate-your-music-modern/main/rate-your-music-modern.js>

Both files include metadata that points update checks at the raw files on the
`main` branch.

## Development

```sh
npm install
npm run dev
npm run check
```

The local fixture runs at <http://127.0.0.1:5173/> and loads the same CSS and JS
files that Stylus and Tampermonkey install.

`rate-your-music-modern.css` and `rate-your-music-modern.js` are **generated**.
Edit the sources, not the bundles:

- CSS: `css/*.css` → `npm run build:css`
- JS: `src/*.js` → `npm run build:js`

The userscript/userstyle headers (including the `@version` numbers) live in
`scripts/build-js.mjs` and `scripts/build-css.mjs`. `npm run sync:preview`
rebuilds everything and regenerates the preview pages.
