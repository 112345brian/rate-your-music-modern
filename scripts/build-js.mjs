import { readFile, writeFile } from "node:fs/promises";
import prettier from "prettier";

const USERSCRIPT_HEADER = `// ==UserScript==
// @name         Rate Your Music Modern
// @namespace    github.com/112345brian/rate-your-music-modern
// @version      1.5.0
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
// ==/UserScript==`;

// Concatenated in order into a single script (no ES module boundaries) —
// every function lands in one scope, exactly like the previous monolith.
const SOURCE_FILES = [
  "src/01-artist.js",
  "src/02-release-core.js",
  "src/03-release-tabs.js",
  "src/04-mobile.js",
  "src/05-charts.js",
];

const parts = await Promise.all(SOURCE_FILES.map((f) => readFile(f, "utf8")));
const combined = parts.map((p) => p.trim()).join("\n\n");

const assembled = `${USERSCRIPT_HEADER}\n\n${combined}\n`;

const formatted = await prettier.format(assembled, { parser: "babel" });

await writeFile("rate-your-music-modern.js", formatted);
