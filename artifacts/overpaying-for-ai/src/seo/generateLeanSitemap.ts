/**
 * generateLeanSitemap.ts
 *
 * Generates public/sitemap.xml using the lean sitemap config.
 *
 * Run from artifacts/overpaying-for-ai/:
 *   npx tsx src/seo/generateLeanSitemap.ts
 *
 * This replaces the previous generateSitemap.ts output with the
 * high-trust lean route set defined in leanSitemap.ts.
 */

import { fileURLToPath } from "url";
import * as path from "path";
import * as fs from "fs";
import { generateLeanSitemapXml } from "./generateLeanSitemapXml";
import { LEAN_SITEMAP_ROUTES, CANONICAL_SITE_URL } from "./leanSitemap";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../../public");

function main() {
  const xml = generateLeanSitemapXml();

  const sitemapPath = path.join(PUBLIC_DIR, "sitemap.xml");
  fs.writeFileSync(sitemapPath, xml, "utf-8");

  console.log(`✓ Lean sitemap.xml written to ${sitemapPath}`);
  console.log(`✓ ${LEAN_SITEMAP_ROUTES.length} URLs included`);
  console.log(`✓ Canonical base: ${CANONICAL_SITE_URL}`);
  console.log("\nActive URLs:");
  LEAN_SITEMAP_ROUTES.forEach((r) => console.log(`  ${CANONICAL_SITE_URL}${r.path}`));
}

main();
