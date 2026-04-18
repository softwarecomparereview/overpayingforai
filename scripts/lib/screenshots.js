// scripts/lib/screenshots.js
// Screenshot helpers: full-page and above-the-fold.

import { join } from "node:path";
import { ensureDir } from "./utils.js";

export async function captureScreenshots({ page, slug, fullDir, foldDir }) {
  ensureDir(fullDir);
  ensureDir(foldDir);
  const fullPath = join(fullDir, `${slug}.png`);
  const foldPath = join(foldDir, `${slug}.png`);
  const out = { full: null, fold: null };

  try {
    await page.screenshot({ path: fullPath, fullPage: true });
    out.full = fullPath;
  } catch (err) {
    out.fullError = String(err?.message || err);
  }

  try {
    await page.screenshot({ path: foldPath, fullPage: false });
    out.fold = foldPath;
  } catch (err) {
    out.foldError = String(err?.message || err);
  }

  return out;
}
