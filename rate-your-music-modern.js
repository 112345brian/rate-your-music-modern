// ==UserScript==
// @name         Rate Your Music Modern
// @namespace    github.com/112345brian/rate-your-music-modern
// @version      0.1.0
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

enhancePage();
