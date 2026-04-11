import { SitemapEntry } from "./leanSitemap";

export function validateSitemapEntries(entries: SitemapEntry[]): void {
  const seen = new Set<string>();

  for (const entry of entries) {
    const path = entry.path;

    if (!path.startsWith("/")) {
      throw new Error(`Invalid sitemap path: "${path}" must start with "/"`);
    }

    if (path.includes("www.")) {
      throw new Error(`Invalid sitemap path: "${path}" must not include www`);
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
      throw new Error(`Invalid sitemap path: "${path}" must be a relative path`);
    }

    if (seen.has(path)) {
      throw new Error(`Duplicate sitemap path detected: "${path}"`);
    }

    seen.add(path);
  }
}
