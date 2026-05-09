import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ASSETS_DIR = "assets";
const PREVIEW_SCRIPT = "../../rate-your-music-modern.js";
const PREVIEW_STYLESHEET = "../../preview.css";
const PREVIEW_MARKER = "data-rym-modern-preview-css";
const PREVIEW_SCRIPT_MARKER = "data-rym-modern-preview-js";

const pages = [
  {
    label: "Home",
    directory: "home-page",
  },
  {
    label: "Artist",
    directory: "artist-page",
  },
  {
    label: "Charts",
    directory: "charts-page",
  },
  {
    label: "Lists",
    directory: "list-page",
  },
  {
    label: "Release",
    directory: "release-page",
  },
];

function injectPreviewAssets(html) {
  const cleaned = html
    .replace(
      /\n\s*<link rel="stylesheet" href="\.\.\/\.\.\/preview\.css" data-rym-modern-preview-css>\s*/g,
      "",
    )
    .replace(
      /\n\s*<script src="\.\.\/\.\.\/rate-your-music-modern\.js" data-rym-modern-preview-js><\/script>\s*/g,
      "",
    )
    .replace(/position:fixed:\s*top/g, "position:fixed;top");
  const link = `\n<link rel="stylesheet" href="${PREVIEW_STYLESHEET}" ${PREVIEW_MARKER}>`;
  const script = `\n<script src="${PREVIEW_SCRIPT}" ${PREVIEW_SCRIPT_MARKER}></script>`;

  if (!cleaned.includes("</head>")) {
    throw new Error("Fixture is missing </head>");
  }

  if (!cleaned.includes("</body>")) {
    throw new Error("Fixture is missing </body>");
  }

  return cleaned
    .replace("</head>", `${link}</head>`)
    .replace("</body>", `${script}</body>`);
}

async function findHtmlFile(directory) {
  const assetDirectory = path.join(ASSETS_DIR, directory);
  const files = await readdir(assetDirectory);
  const htmlFile = files.find(
    (file) => file.endsWith(".html") && !file.endsWith(".preview.html"),
  );

  if (!htmlFile) {
    throw new Error(`No source HTML found in ${assetDirectory}`);
  }

  return path.join(assetDirectory, htmlFile);
}

for (const page of pages) {
  const source = await findHtmlFile(page.directory);
  const html = await readFile(source, "utf8");
  const previewPath = path.join(ASSETS_DIR, page.directory, "preview.html");

  await writeFile(previewPath, injectPreviewAssets(html));
  console.log(`Generated ${page.label} preview: ${previewPath}`);
}
