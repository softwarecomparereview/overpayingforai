import { CANONICAL_SITE_URL, LEAN_SITEMAP_ROUTES } from "./leanSitemap";
import { validateSitemapEntries } from "./validateSitemapEntries";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function generateLeanSitemapXml(): string {
  validateSitemapEntries(LEAN_SITEMAP_ROUTES);

  const today = new Date().toISOString().split("T")[0];

  const urls = LEAN_SITEMAP_ROUTES.map(({ path, priority = "0.7", changefreq = "weekly" }) => {
    const loc = `${CANONICAL_SITE_URL}${path}`;
    return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}
