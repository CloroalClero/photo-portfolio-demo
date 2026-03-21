/**
 * Divide un CSS monolitico in style-shared / style-mobile / style-desktop.
 * Uso: incolla il bundle in style.monolith.css (root) oppure:
 *   node tools/split-styles.mjs percorso/al/file.css
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const argPath = process.argv[2];
const srcPath = argPath
  ? path.resolve(argPath)
  : path.join(root, "style.monolith.css");
if (!fs.existsSync(srcPath)) {
  console.error(
    "File non trovato:",
    srcPath,
    "\nCrea style.monolith.css nella root con il CSS completo, oppure passa il path come argomento."
  );
  process.exit(1);
}
const css = fs.readFileSync(srcPath, "utf8");

function extractAtMediaBlocks(text) {
  const blocks = [];
  let i = 0;
  while (i < text.length) {
    const idx = text.indexOf("@media", i);
    if (idx === -1) break;
    const openBrace = text.indexOf("{", idx);
    if (openBrace === -1) break;
    let depth = 0;
    let j = openBrace;
    for (; j < text.length; j++) {
      const c = text[j];
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    const full = text.slice(idx, j);
    blocks.push({ start: idx, end: j, full });
    i = j;
  }
  return blocks;
}

const blocks = extractAtMediaBlocks(css);
const mobileChunks = [];
const desktopChunks = [];
const removeRanges = [];

for (const b of blocks) {
  const q = b.full.slice(0, b.full.indexOf("{")).replace(/\s+/g, " ");
  const isMax =
    /\(max-width\s*:/i.test(q) || /\(max-height\s*:/i.test(q);
  const isMinDesktop = /\(min-width\s*:\s*1100px\)/i.test(q);
  const isReducedMotion = /prefers-reduced-motion/i.test(q);

  if (isReducedMotion) continue;

  removeRanges.push([b.start, b.end]);

  if (isMinDesktop) {
    desktopChunks.push(b.full.trim() + "\n\n");
  } else if (isMax) {
    mobileChunks.push(b.full.trim() + "\n\n");
  } else {
    // es. print, unknown — keep in shared by not removing? For safety keep in shared
    removeRanges.pop();
  }
}

// Build shared: remove ranges from end to start
removeRanges.sort((a, b) => b[0] - a[0]);
let shared = css;
for (const [start, end] of removeRanges) {
  shared = shared.slice(0, start) + shared.slice(end);
}

const mobileHeader = `/* Regole responsive: telefono / viewport stretto (estratti da style.css) */\n\n`;
const desktopHeader = `/* Regole desktop: schermi larghi (estratti da style.css) */\n\n`;

fs.writeFileSync(path.join(root, "style-shared.css"), shared.trim() + "\n");
fs.writeFileSync(
  path.join(root, "style-mobile.css"),
  mobileHeader + mobileChunks.join("")
);
fs.writeFileSync(
  path.join(root, "style-desktop.css"),
  desktopHeader + desktopChunks.join("")
);

console.log(
  "Wrote style-shared.css, style-mobile.css, style-desktop.css",
  "\nmobile @media blocks:",
  mobileChunks.length,
  "desktop:",
  desktopChunks.length
);
