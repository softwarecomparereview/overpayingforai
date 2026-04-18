// scripts/lib/extractors.js
// Page-level extractors. Run inside Playwright's page.evaluate() context where
// possible, then post-process in Node.

import { cleanText, isCrawlableHref, normalizeUrl, sameDomain } from "./utils.js";

const PRICING_PATTERNS = [
  /\$\s?\d/, /\d+\s?(?:\/|per)\s?(?:mo|month|yr|year|user)/i,
  /\btokens?\b/i, /\bcredits?\b/i, /\bpricing\b/i, /\bcost\b/i,
  /\bbilled\b/i, /\busage\b/i, /\bsubscription\b/i, /\bplan\b/i,
];

const RECOMMENDATION_PATTERNS = [
  /\bbest\b/i, /\bwinner\b/i, /\brecommended\b/i, /\btop\s+pick\b/i,
  /\bbest\s+choice\b/i, /\bcheapest\b/i, /\bbalance\b/i,
  /\bfinal\s+verdict\b/i, /\bour\s+pick\b/i, /\bbest\s+value\b/i,
];

const CTA_TEXT_PATTERNS = [
  /\btry\b/i, /\bstart\b/i, /\bvisit\b/i, /\bpricing\b/i, /\bchoose\b/i,
  /\bcompare\b/i, /\bcalculate\b/i, /\bget\s+started\b/i,
  /\buse\s+calculator\b/i, /\bsee\s+result/i, /\bread\s+more\b/i,
  /\blearn\s+more\b/i, /\bsign\s?up\b/i, /\bshop\b/i, /\bbuy\b/i,
  /\bsubscribe\b/i, /\bcheck\b/i, /\bfind\b/i, /\bdiscover\b/i,
];

const COMMERCIAL_PATH_PATTERNS = [
  /\/best(\/|$)/i, /\/compare(\/|$)/i, /\/vs(\/|$|-)/i,
  /\/calculator(\/|$)/i, /\/recommend/i, /\/pricing/i, /\/result/i,
];

const COMMERCIAL_TEXT_PATTERNS = [
  /\bbest\b/i, /\bcheapest\b/i, /\bvs\b/i, /\bcompare\b/i,
  /\bwinner\b/i, /\brecommended\b/i, /\bcalculator\b/i,
];

/**
 * Runs inside the browser context and returns the raw page snapshot.
 * Keep this self-contained — it's serialized and shipped to the page.
 */
async function pageSnapshot(page) {
  return page.evaluate(() => {
    function visible(el) {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return false;
      if (r.width <= 1 || r.height <= 1) return false;
      return true;
    }
    function txt(el) { return (el?.innerText || el?.textContent || "").trim(); }

    const title = document.title || "";
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
    const robots = document.querySelector('meta[name="robots"]')?.getAttribute("content") || "";
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content") || "";
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute("content") || "";

    const h1Els = Array.from(document.querySelectorAll("h1"));
    const h2Els = Array.from(document.querySelectorAll("h2"));
    const h1 = h1Els.map(txt).filter(Boolean);
    const h2 = h2Els.map(txt).filter(Boolean);

    const anchors = Array.from(document.querySelectorAll("a[href]"));
    const linkRows = anchors.map((a) => ({
      href: a.getAttribute("href") || "",
      text: txt(a).slice(0, 200),
      visible: visible(a),
      rel: a.getAttribute("rel") || "",
      target: a.getAttribute("target") || "",
    }));

    // Collect button-like CTAs (buttons + role=button + nav links styled as buttons)
    const ctaCandidates = [
      ...Array.from(document.querySelectorAll("button")),
      ...Array.from(document.querySelectorAll('[role="button"]')),
      ...Array.from(document.querySelectorAll("a[href]")),
    ];
    const ctaTexts = [];
    for (const el of ctaCandidates) {
      if (!visible(el)) continue;
      const t = txt(el);
      if (t && t.length > 1 && t.length < 80) ctaTexts.push(t);
    }

    // Body length and visible text in viewport
    const bodyText = (document.body?.innerText || "").trim();

    // Approx number of major sections
    const sectionEls = document.querySelectorAll("section, article, main > div");
    const sectionCount = sectionEls.length;

    // Tables (used for comparison detection)
    const tableCount = document.querySelectorAll("table").length;

    // JSON-LD — count blocks but don't bloat the payload by storing full content
    const ldEls = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    const ldScripts = ldEls.map((s) => (s.textContent || "").slice(0, 1000)).filter(Boolean);
    const ldCount = ldEls.length;

    // Above-the-fold visible text
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let foldText = "";
    const all = document.body?.querySelectorAll("*") || [];
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.left < vw && r.bottom > 0 && r.right > 0) {
        if (el.children.length === 0) {
          const t = (el.textContent || "").trim();
          if (t) foldText += " " + t;
          if (foldText.length > 4000) break;
        }
      }
    }

    return {
      title,
      metaDesc,
      canonical,
      robots,
      ogTitle,
      ogDesc,
      h1,
      h2,
      links: linkRows,
      ctaTexts,
      bodyText,
      sectionCount,
      tableCount,
      ldScripts,
      ldCount,
      foldText: foldText.trim().slice(0, 4000),
      url: location.href,
    };
  });
}

/**
 * Wraps pageSnapshot with retry and post-processing.
 */
export async function extractPage({ page, finalUrl, sourceUrl, status, rootHost, timingMs }) {
  const snap = await pageSnapshot(page);

  const internalLinks = [];
  const outboundLinks = [];
  const outboundDomains = new Set();
  const seenLink = new Set();
  let visibleOutboundCta = false;
  let visibleAnyCta = false;

  for (const link of snap.links) {
    if (!isCrawlableHref(link.href)) continue;
    const norm = normalizeUrl(link.href, finalUrl);
    if (!norm) continue;
    if (seenLink.has(norm)) continue;
    seenLink.add(norm);
    const isInternal = sameDomain(norm, rootHost);
    if (isInternal) internalLinks.push({ url: norm, text: link.text, visible: link.visible });
    else {
      outboundLinks.push({ url: norm, text: link.text, visible: link.visible, rel: link.rel });
      try { outboundDomains.add(new URL(norm).hostname); } catch {}
    }
    // CTA-style anchors
    if (link.visible && link.text) {
      const looksLikeCta = CTA_TEXT_PATTERNS.some((re) => re.test(link.text));
      if (looksLikeCta) {
        visibleAnyCta = true;
        if (!isInternal) visibleOutboundCta = true;
      }
    }
  }

  // Visible button-style CTAs
  const buttonCtas = (snap.ctaTexts || []).filter((t) => CTA_TEXT_PATTERNS.some((re) => re.test(t)));
  if (buttonCtas.length > 0) visibleAnyCta = true;

  const allCtaTexts = Array.from(new Set([
    ...buttonCtas,
    ...snap.links.filter((l) => l.visible && CTA_TEXT_PATTERNS.some((re) => re.test(l.text))).map((l) => l.text),
  ])).slice(0, 30);

  const bodyText = snap.bodyText || "";
  const foldText = snap.foldText || "";

  const hasPricingText = PRICING_PATTERNS.some((re) => re.test(bodyText));
  const hasRecommendationBlock = RECOMMENDATION_PATTERNS.some((re) => re.test(bodyText));
  const path = (() => { try { return new URL(finalUrl).pathname; } catch { return ""; } })();
  const isCommercial = COMMERCIAL_PATH_PATTERNS.some((re) => re.test(path)) ||
                       COMMERCIAL_TEXT_PATTERNS.some((re) => re.test(bodyText.slice(0, 4000)));

  // Likely affiliate / outbound money link: outbound link with rel*=sponsored/nofollow OR text matches CTA
  const likelyAffiliate = outboundLinks.some((l) =>
    /sponsored|affiliate/i.test(l.rel) ||
    (l.visible && CTA_TEXT_PATTERNS.some((re) => re.test(l.text)))
  );

  // Visually bare heuristic — requires either low body text OR sparse fold,
  // plus at least 3 other weak signals. This avoids flagging long-form articles
  // that simply omit <table> or <section> tags.
  const lowText = bodyText.length < 800;
  const noTable = snap.tableCount === 0;
  const fewSections = (snap.sectionCount || 0) < 3;
  const sparseFold = foldText.length < 220;
  const weakSignals = [lowText, noTable, fewSections, !visibleAnyCta, !hasRecommendationBlock, sparseFold].filter(Boolean).length;
  const bareSignals = weakSignals;
  const visuallyBare = (lowText || sparseFold) && weakSignals >= 4;

  return {
    sourceUrl: sourceUrl || null,
    finalUrl,
    status: status ?? null,
    title: cleanText(snap.title),
    metaDescription: cleanText(snap.metaDesc),
    h1: snap.h1.map(cleanText),
    h1First: cleanText(snap.h1[0] || ""),
    h2: snap.h2.map(cleanText),
    canonical: cleanText(snap.canonical),
    robots: cleanText(snap.robots),
    ogTitle: cleanText(snap.ogTitle),
    ogDescription: cleanText(snap.ogDesc),
    internalLinkCount: internalLinks.length,
    outboundLinkCount: outboundLinks.length,
    outboundDomains: Array.from(outboundDomains).sort(),
    hasVisibleCta: visibleAnyCta,
    hasVisibleOutboundCta: visibleOutboundCta,
    hasLikelyAffiliateLink: likelyAffiliate,
    hasPricingText,
    hasRecommendationBlock,
    isCommercial,
    visuallyBare,
    bareSignalCount: bareSignals,
    bodyTextLength: bodyText.length,
    sectionCount: snap.sectionCount,
    tableCount: snap.tableCount,
    firstCtaText: cleanText(allCtaTexts[0] || ""),
    ctaTexts: allCtaTexts,
    hasJsonLd: (snap.ldCount || 0) > 0,
    jsonLdCount: snap.ldCount || 0,
    timingMs: timingMs ?? null,
    internalLinkUrls: internalLinks.map((l) => l.url),
    outboundLinkUrls: outboundLinks.map((l) => l.url),
  };
}

export {
  PRICING_PATTERNS,
  RECOMMENDATION_PATTERNS,
  CTA_TEXT_PATTERNS,
  COMMERCIAL_PATH_PATTERNS,
};
