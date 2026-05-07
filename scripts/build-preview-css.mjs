import { readFile, writeFile } from "node:fs/promises";
import prettier from "prettier";

const USERSTYLE_FILE = "rate-your-music-modern.css";
const PREVIEW_FILE = "preview.css";

function extractScopedCss(userstyle) {
  const scopedCss = userstyle.match(
    /@-moz-document[^{]+{\n([\s\S]*)\n}\s*$/,
  )?.[1];

  if (!scopedCss) {
    throw new Error(
      `Could not extract @-moz-document block from ${USERSTYLE_FILE}`,
    );
  }

  return scopedCss.replace(/^ {2}/gm, "");
}

const userstyle = await readFile(USERSTYLE_FILE, "utf8");
const previewCss = await prettier.format(
  `/* Generated from ${USERSTYLE_FILE}. Do not edit directly. */\n${extractScopedCss(
    userstyle,
  )}`,
  { parser: "css" },
);

await writeFile(PREVIEW_FILE, previewCss);
