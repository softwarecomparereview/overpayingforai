// scripts/lib/crawler.js
// BFS crawler with dedup, retry, networkidle wait, link discovery.

import { normalizeUrl, sameDomain } from "./utils.js";

/**
 * @param {object} opts
 * @param {import('playwright').BrowserContext} opts.context
 * @param {string[]} opts.seeds
 * @param {string} opts.rootHost
 * @param {number} opts.maxPages
 * @param {number} opts.timeoutMs
 * @param {function} opts.onPage  async ({page, finalUrl, sourceUrl, status, timingMs}) => extracted
 * @param {function} [opts.onError]
 * @param {function} [opts.onDiscover]  ({fromUrl, toUrl})
 */
export async function crawlSite({
  context,
  seeds,
  rootHost,
  maxPages = 100,
  timeoutMs = 30000,
  onPage,
  onError,
  onDiscover,
}) {
  const queue = [];
  const seen = new Set();
  const sourceMap = new Map();

  for (const s of seeds) {
    const n = normalizeUrl(s);
    if (n && !seen.has(n)) {
      seen.add(n);
      queue.push({ url: n, source: null });
    }
  }

  const results = [];
  let pageCount = 0;

  while (queue.length && pageCount < maxPages) {
    const { url, source } = queue.shift();
    pageCount++;
    console.log(`[crawl ${pageCount}/${maxPages}] queue=${queue.length} ${url}`);

    const page = await context.newPage();
    let status = null;
    let finalUrl = url;
    const start = Date.now();
    let extracted = null;

    let attempts = 0;
    let lastErr = null;
    while (attempts < 2 && !extracted) {
      attempts++;
      try {
        const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
        status = resp ? resp.status() : null;
        // wait for the SPA/network to settle, but don't fail if it never goes idle
        try { await page.waitForLoadState("networkidle", { timeout: timeoutMs }); }
        catch { /* tolerate */ }
        finalUrl = page.url();
        const timingMs = Date.now() - start;
        extracted = await onPage({ page, finalUrl, sourceUrl: source, status, timingMs });
        break;
      } catch (err) {
        lastErr = err;
        if (attempts >= 2) {
          console.warn(`  ! failed after ${attempts} attempts: ${err?.message || err}`);
          if (onError) onError({ url, source, error: String(err?.message || err) });
        } else {
          console.warn(`  retry: ${err?.message || err}`);
        }
      }
    }

    if (extracted) {
      results.push(extracted);
      // discover internal links
      for (const ln of extracted.internalLinkUrls || []) {
        if (!sameDomain(ln, rootHost)) continue;
        if (seen.has(ln)) continue;
        seen.add(ln);
        sourceMap.set(ln, finalUrl);
        queue.push({ url: ln, source: finalUrl });
        if (onDiscover) onDiscover({ fromUrl: finalUrl, toUrl: ln });
      }
    } else if (lastErr) {
      results.push({
        sourceUrl: source,
        finalUrl: url,
        status,
        title: "",
        metaDescription: "",
        h1: [],
        h1First: "",
        h2: [],
        canonical: "",
        robots: "",
        ogTitle: "",
        ogDescription: "",
        internalLinkCount: 0,
        outboundLinkCount: 0,
        outboundDomains: [],
        hasVisibleCta: false,
        hasVisibleOutboundCta: false,
        hasLikelyAffiliateLink: false,
        hasPricingText: false,
        hasRecommendationBlock: false,
        isCommercial: false,
        visuallyBare: true,
        bareSignalCount: 6,
        bodyTextLength: 0,
        sectionCount: 0,
        tableCount: 0,
        firstCtaText: "",
        ctaTexts: [],
        hasJsonLd: false,
        jsonLdCount: 0,
        timingMs: Date.now() - start,
        internalLinkUrls: [],
        outboundLinkUrls: [],
        error: String(lastErr?.message || lastErr),
      });
    }

    try { await page.close(); } catch { /* ignore */ }
  }

  return results;
}
