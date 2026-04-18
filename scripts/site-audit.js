// scripts/site-audit.js
// Production site audit + crawl + screenshots for overpayingforai.com.
//
// Usage:
//   node scripts/site-audit.js --maxPages=100 --headless=true
//   node scripts/site-audit.js --maxPages=20 --noScreenshots --seeds=https://overpayingforai.com/best
//
// Outputs:
//   out/screenshots/full/<slug>.png
//   out/screenshots/hero/<slug>.png
//   out/reports/pages.json
//   out/reports/pages.csv
//   out/reports/issues.json
//   out/reports/summary.md

import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

import {
  parseArgs, asBool, asInt, normalizeUrl, slugifyUrl,
  ensureDir, writeJson, writeCsv, findDuplicates, nowIso,
} from "./lib/utils.js";
import { extractPage } from "./lib/extractors.js";
import { captureScreenshots } from "./lib/screenshots.js";
import { crawlSite } from "./lib/crawler.js";

const require = createRequire(import.meta.url);
// Reuse the Playwright install already vendored under qa/node_modules.
const { chromium } = require("../qa/node_modules/playwright");

function resolveChromium() {
  if (process.env.CHROMIUM_PATH && existsSync(process.env.CHROMIUM_PATH)) {
    return process.env.CHROMIUM_PATH;
  }
  try {
    const found = execSync("command -v chromium || command -v chromium-browser || command -v google-chrome", {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (found && existsSync(found)) return found;
  } catch { /* none on PATH */ }
  return null; // fall back to bundled Playwright Chromium
}
const CHROMIUM_EXEC = resolveChromium();

const DEFAULT_SEEDS = [
  "https://overpayingforai.com/",
  "https://overpayingforai.com/best",
  "https://overpayingforai.com/calculator",
  "https://overpayingforai.com/ai-types",
];

const args = parseArgs(process.argv);
const MAX_PAGES = asInt(args.maxPages, 100);
const HEADLESS = asBool(args.headless, true);
const TIMEOUT_MS = asInt(args.timeout, 30000);
const SHOTS = !asBool(args.noScreenshots, false);
const VIEWPORT_W = asInt(args.width, 1366);
const VIEWPORT_H = asInt(args.height, 900);
const SEEDS = args.seeds
  ? args.seeds.split(",").map((s) => s.trim()).filter(Boolean)
  : DEFAULT_SEEDS;

const ROOT = resolve(process.cwd());
const OUT_BASE = join(ROOT, "out");
const FULL_DIR = join(OUT_BASE, "screenshots", "full");
const FOLD_DIR = join(OUT_BASE, "screenshots", "hero");
const REPORTS_DIR = join(OUT_BASE, "reports");

[OUT_BASE, FULL_DIR, FOLD_DIR, REPORTS_DIR].forEach(ensureDir);

const ROOT_HOST = (() => {
  try { return new URL(SEEDS[0]).hostname.replace(/^www\./, ""); }
  catch { return "overpayingforai.com"; }
})();

console.log("Site audit starting");
console.log(`  seeds:      ${SEEDS.join(", ")}`);
console.log(`  rootHost:   ${ROOT_HOST}`);
console.log(`  maxPages:   ${MAX_PAGES}`);
console.log(`  headless:   ${HEADLESS}`);
console.log(`  timeout:    ${TIMEOUT_MS}ms`);
console.log(`  viewport:   ${VIEWPORT_W}x${VIEWPORT_H}`);
console.log(`  screenshots:${SHOTS}`);
console.log(`  outputDir:  ${OUT_BASE}`);

const slugSeen = new Map();
const errors = [];

(async () => {
  const launchOptions = {
    headless: HEADLESS,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  };
  if (CHROMIUM_EXEC) {
    launchOptions.executablePath = CHROMIUM_EXEC;
    console.log(`  chromium:   ${CHROMIUM_EXEC}`);
  }
  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_W, height: VIEWPORT_H },
    userAgent: "Mozilla/5.0 (compatible; OverpayingForAI-Audit/1.0)",
    ignoreHTTPSErrors: true,
  });

  const startedAt = nowIso();
  const pages = await crawlSite({
    context,
    seeds: SEEDS,
    rootHost: ROOT_HOST,
    maxPages: MAX_PAGES,
    timeoutMs: TIMEOUT_MS,
    onError: (e) => errors.push(e),
    onPage: async ({ page, finalUrl, sourceUrl, status, timingMs }) => {
      const extracted = await extractPage({
        page, finalUrl, sourceUrl, status, rootHost: ROOT_HOST, timingMs,
      });
      if (SHOTS) {
        const slug = slugifyUrl(normalizeUrl(finalUrl) || finalUrl, slugSeen);
        const shots = await captureScreenshots({
          page, slug, fullDir: FULL_DIR, foldDir: FOLD_DIR,
        });
        extracted.slug = slug;
        extracted.screenshotFull = shots.full;
        extracted.screenshotFold = shots.fold;
        if (shots.fullError || shots.foldError) {
          extracted.screenshotError = [shots.fullError, shots.foldError].filter(Boolean).join(" | ");
        }
      }
      return extracted;
    },
  });
  const finishedAt = nowIso();

  await context.close();
  await browser.close();

  // ───── Issues detection ──────────────────────────────────────────
  const issues = [];
  const titleDupes = findDuplicates(pages, (p) => p.finalUrl, (p) => p.title);
  const h1Dupes = findDuplicates(pages, (p) => p.finalUrl, (p) => p.h1First);
  const titleDupeSet = new Set();
  Object.values(titleDupes).forEach((arr) => arr.forEach((u) => titleDupeSet.add(u)));
  const h1DupeSet = new Set();
  Object.values(h1Dupes).forEach((arr) => arr.forEach((u) => h1DupeSet.add(u)));

  for (const p of pages) {
    const add = (type, severity, detail) =>
      issues.push({ type, severity, url: p.finalUrl, source: p.sourceUrl, detail });

    if (p.error) {
      add("navigation_error", "high", p.error);
      continue;
    }
    if (!p.title) add("missing_title", "high", "");
    if (!p.metaDescription) add("missing_meta_description", "medium", "");
    if (!p.h1First) add("missing_h1", "medium", "");
    if (!p.canonical) add("missing_canonical", "medium", "");
    if (titleDupeSet.has(p.finalUrl) && p.title) add("duplicate_title", "low", p.title);
    if (h1DupeSet.has(p.finalUrl) && p.h1First) add("duplicate_h1", "low", p.h1First);

    if (!p.hasVisibleCta) add("no_cta", "medium", "");
    if (p.isCommercial && !p.hasVisibleOutboundCta) {
      add("no_outbound_cta_on_commercial_page", "high", "");
    }
    if (p.internalLinkCount < 4) add("low_internal_link_count", "low", `count=${p.internalLinkCount}`);
    if (p.visuallyBare) add("bare_page", "high", `signals=${p.bareSignalCount}`);
    if (p.isCommercial && !p.hasRecommendationBlock) {
      add("missing_recommendation_block_on_commercial_page", "medium", "");
    }
    if (p.isCommercial && !p.hasPricingText) {
      add("missing_pricing_context_on_commercial_page", "medium", "");
    }
  }

  // Possible broken links: pages that returned a non-2xx status.
  for (const p of pages) {
    if (p.status && (p.status >= 400 || p.status < 200)) {
      issues.push({
        type: "possible_broken_link",
        severity: "high",
        url: p.finalUrl,
        source: p.sourceUrl,
        detail: `status=${p.status}`,
      });
    }
  }

  // ───── Outputs ────────────────────────────────────────────────────
  writeJson(join(REPORTS_DIR, "pages.json"), {
    startedAt, finishedAt,
    rootHost: ROOT_HOST,
    seeds: SEEDS,
    maxPages: MAX_PAGES,
    pageCount: pages.length,
    pages,
  });

  // Flatten arrays for CSV
  const flatRows = pages.map((p) => ({
    finalUrl: p.finalUrl,
    sourceUrl: p.sourceUrl,
    status: p.status,
    title: p.title,
    metaDescription: p.metaDescription,
    h1: p.h1First,
    h1AllJoined: (p.h1 || []).join(" | "),
    h2Count: (p.h2 || []).length,
    h2AllJoined: (p.h2 || []).join(" | "),
    canonical: p.canonical,
    robots: p.robots,
    internalLinkCount: p.internalLinkCount,
    outboundLinkCount: p.outboundLinkCount,
    outboundDomains: (p.outboundDomains || []).join(" | "),
    hasVisibleCta: p.hasVisibleCta,
    hasVisibleOutboundCta: p.hasVisibleOutboundCta,
    hasLikelyAffiliateLink: p.hasLikelyAffiliateLink,
    hasPricingText: p.hasPricingText,
    hasRecommendationBlock: p.hasRecommendationBlock,
    isCommercial: p.isCommercial,
    visuallyBare: p.visuallyBare,
    bareSignalCount: p.bareSignalCount,
    bodyTextLength: p.bodyTextLength,
    sectionCount: p.sectionCount,
    tableCount: p.tableCount,
    firstCtaText: p.firstCtaText,
    ctaTexts: (p.ctaTexts || []).join(" | "),
    hasJsonLd: p.hasJsonLd,
    jsonLdCount: p.jsonLdCount,
    timingMs: p.timingMs,
    screenshotFull: p.screenshotFull || "",
    screenshotFold: p.screenshotFold || "",
    error: p.error || "",
  }));
  writeCsv(join(REPORTS_DIR, "pages.csv"), flatRows);

  writeJson(join(REPORTS_DIR, "issues.json"), {
    startedAt, finishedAt,
    issueCount: issues.length,
    issues,
  });

  // ───── Summary markdown ───────────────────────────────────────────
  const commercial = pages.filter((p) => p.isCommercial);
  const noCta = pages.filter((p) => !p.hasVisibleCta && !p.error);
  const noOutbound = pages.filter((p) => !p.hasVisibleOutboundCta && !p.error);
  const bare = pages.filter((p) => p.visuallyBare && !p.error);
  const withPricing = pages.filter((p) => p.hasPricingText);
  const noRec = commercial.filter((p) => !p.hasRecommendationBlock);
  const allOutboundDomains = new Set();
  pages.forEach((p) => (p.outboundDomains || []).forEach((d) => allOutboundDomains.add(d)));

  const issueCountsByType = issues.reduce((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + 1;
    return acc;
  }, {});

  const md = [];
  md.push(`# Site Audit Summary`);
  md.push(``);
  md.push(`- Started: ${startedAt}`);
  md.push(`- Finished: ${finishedAt}`);
  md.push(`- Root host: \`${ROOT_HOST}\``);
  md.push(`- Pages crawled: **${pages.length}**`);
  md.push(`- Commercial / high-intent pages: **${commercial.length}**`);
  md.push(`- Pages with pricing text: **${withPricing.length}**`);
  md.push(`- Pages flagged visually bare: **${bare.length}**`);
  md.push(`- Pages with NO visible CTA: **${noCta.length}**`);
  md.push(`- Pages with NO outbound/affiliate CTA: **${noOutbound.length}**`);
  md.push(`- Commercial pages missing recommendation block: **${noRec.length}**`);
  md.push(`- Total issues recorded: **${issues.length}**`);
  md.push(`- Outbound domains discovered: **${allOutboundDomains.size}**`);
  md.push(``);
  md.push(`## Issue counts by type`);
  Object.entries(issueCountsByType).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => {
    md.push(`- ${t}: ${n}`);
  });
  md.push(``);
  md.push(`## Top pages with NO visible CTA`);
  noCta.slice(0, 20).forEach((p) => md.push(`- ${p.finalUrl}`));
  md.push(``);
  md.push(`## Top pages with NO outbound/affiliate CTA`);
  noOutbound.slice(0, 20).forEach((p) => md.push(`- ${p.finalUrl}`));
  md.push(``);
  md.push(`## Pages with pricing text`);
  withPricing.slice(0, 20).forEach((p) => md.push(`- ${p.finalUrl}`));
  md.push(``);
  md.push(`## Commercial pages missing recommendation block`);
  noRec.slice(0, 20).forEach((p) => md.push(`- ${p.finalUrl}`));
  md.push(``);
  md.push(`## Likely highest-intent pages (commercial)`);
  commercial.slice(0, 30).forEach((p) => md.push(`- ${p.finalUrl}`));
  md.push(``);
  md.push(`## Visually bare pages`);
  bare.slice(0, 20).forEach((p) => md.push(`- ${p.finalUrl} (signals=${p.bareSignalCount})`));
  md.push(``);
  md.push(`## Duplicate titles`);
  Object.entries(titleDupes).slice(0, 20).forEach(([t, urls]) => {
    md.push(`- "${t}" — ${urls.length} pages`);
    urls.slice(0, 5).forEach((u) => md.push(`  - ${u}`));
  });
  md.push(``);
  md.push(`## Duplicate H1s`);
  Object.entries(h1Dupes).slice(0, 20).forEach(([t, urls]) => {
    md.push(`- "${t}" — ${urls.length} pages`);
    urls.slice(0, 5).forEach((u) => md.push(`  - ${u}`));
  });
  md.push(``);
  md.push(`## Outbound domains discovered`);
  Array.from(allOutboundDomains).sort().forEach((d) => md.push(`- ${d}`));
  md.push(``);
  md.push(`## Prioritized actions`);
  const actions = [];
  if (noOutbound.length) actions.push(`Add visible outbound/affiliate CTAs to ${noOutbound.length} pages — direct monetization gap.`);
  if (noRec.length) actions.push(`Add a clear recommendation/winner block to ${noRec.length} commercial pages.`);
  if (bare.length) actions.push(`Strengthen ${bare.length} visually bare pages with content, sections, or comparisons.`);
  if (issueCountsByType.missing_canonical) actions.push(`Add canonical tags to ${issueCountsByType.missing_canonical} pages.`);
  if (issueCountsByType.duplicate_title) actions.push(`Resolve ${issueCountsByType.duplicate_title} duplicate titles.`);
  if (issueCountsByType.navigation_error) actions.push(`Investigate ${issueCountsByType.navigation_error} navigation errors / broken pages.`);
  if (!actions.length) actions.push(`No critical actions detected. Spot-check the bare/no-CTA lists above.`);
  actions.forEach((a) => md.push(`- ${a}`));
  md.push(``);

  writeFileSync(join(REPORTS_DIR, "summary.md"), md.join("\n"), "utf8");

  console.log(`\nDone.`);
  console.log(`  pages: ${pages.length}, issues: ${issues.length}`);
  console.log(`  reports: ${REPORTS_DIR}`);
  console.log(`  screenshots: ${FULL_DIR} and ${FOLD_DIR}`);
})().catch((err) => {
  console.error("Site audit fatal error:", err);
  process.exit(1);
});
