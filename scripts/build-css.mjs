import { readFile, writeFile } from "node:fs/promises";
import prettier from "prettier";

const USERSTYLE_HEADER = `/* ==UserStyle==
@name           Rate Your Music Modern
@namespace      github.com/112345brian/rate-your-music-modern
@version        1.8.13
@description    Modern visual treatment for Rate Your Music.
@author         bri
@homepageURL    https://github.com/112345brian/rate-your-music-modern
@supportURL     https://github.com/112345brian/rate-your-music-modern/issues
@updateURL      https://raw.githubusercontent.com/112345brian/rate-your-music-modern/main/rate-your-music-modern.css
@preprocessor   default
==/UserStyle== */`;

const SOURCE_FILES = [
  "css/base.css",
  "css/artist.css",
  "css/release.css",
  "css/charts.css",
  "css/mobile-nav.css",
];

const parts = await Promise.all(SOURCE_FILES.map((f) => readFile(f, "utf8")));
const combined = parts.map((p) => p.trimEnd()).join("\n\n");

const assembled = `${USERSTYLE_HEADER}\n\n@-moz-document domain("rateyourmusic.com"), domain("localhost"), domain("127.0.0.1") {\n${combined}\n}\n`;

const formatted = await prettier.format(assembled, { parser: "css" });

await writeFile("rate-your-music-modern.css", formatted);
