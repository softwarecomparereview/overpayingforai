/**
 * audit-task-fit-model-guidance.mjs
 *
 * Crawls all URLs in public/sitemap.xml against the local dev server and
 * analyses each page for "choose the right model for the task" guidance.
 *
 * Output:
 *   out/audits/task-fit-model-guidance-audit.md
 *   out/audits/task-fit-model-guidance-audit.json
 *
 * Usage:
 *   npm run audit:task-fit-model-guidance
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── Config ──────────────────────────────────────────────────────────────────

const CANONICAL = "https://overpayingforai.com";
const BASE_URL = process.env.AUDIT_BASE_URL || "http://localhost:18972";
const SITEMAP_PATH = path.join(ROOT, "public", "sitemap.xml");
const OUT_DIR = path.join(ROOT, "out", "audits");
const TODAY = new Date().toISOString().slice(0, 10);
const TIMEOUT_MS = 15_000;

// ─── Signal sets ─────────────────────────────────────────────────────────────

const TASK_FIT_SIGNALS = [
  "right model",
  "task-fit",
  "task fit",
  "model routing",
  "route.*model",
  "choose.*model",
  "pick.*model",
  "match.*model",
  "model.*task",
  "task.*model",
  "not.*expensive",
  "cheaper.*model",
  "cheaper.*alternative",
  "cheaper.*option",
  "overpay",
  "overpaying",
  "cheaper.*equivalent",
  "cost.*quality",
  "quality.*cost",
  "good enough",
  "simpler.*task",
  "simple.*task",
  "escalate",
  "two.tier",
  "two tier",
  "tier.*routing",
  "model.*strategy",
];

const COST_SIGNALS = [
  "cost",
  "price",
  "pricing",
  "token",
  "per month",
  "/month",
  "\\$",
  "cheaper",
  "save",
  "savings",
  "budget",
];

const CTA_SIGNALS = [
  "calculate",
  "calculator",
  "compare",
  "find out",
  "get started",
  "try",
  "see cost",
  "check cost",
  "decision engine",
  "open the calculator",
];

const CALCULATOR_LINK_PATTERNS = ["/calculator", "/compare", "/decision-engine"];

// Pages that SHOULD have task-fit guidance based on their type/slug
const HIGH_PRIORITY_PATTERNS = [
  { pattern: /\/compare\//, label: "comparison" },
  { pattern: /\/pricing\//, label: "pricing" },
  { pattern: /\/ai-types\/coding/, label: "coding-ai-type" },
  { pattern: /\/best\/.*cod/, label: "coding-best-of" },
  { pattern: /\/best\/.*develop/, label: "developer-best-of" },
  { pattern: /\/calculator/, label: "calculator" },
  { pattern: /\/compare\/.*api|api.*compare/, label: "api-cost" },
  { pattern: /\/compare\/.*model|model.*compare/, label: "model-cost" },
  { pattern: /\/worth-it\//, label: "worth-it" },
  { pattern: /\/alternatives\//, label: "alternatives" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseSitemap(xmlPath) {
  const xml = fs.readFileSync(xmlPath, "utf8");
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1].trim());
}

function getPageType(pathname) {
  if (pathname === "/" || pathname === "") return "home";
  const seg = pathname.split("/").filter(Boolean)[0];
  const typeMap = {
    pricing: "pricing",
    compare: "compare",
    best: "best",
    calculator: "calculator",
    alternatives: "alternatives",
    "worth-it": "worth-it",
    guides: "guide",
    "ai-types": "ai-type",
    decision: "decision",
    models: "models",
    insights: "insights",
    audit: "audit",
    about: "static",
    contact: "static",
    "affiliate-disclosure": "static",
    "privacy-policy": "static",
  };
  return typeMap[seg] ?? "other";
}

function detectSignals(textContent, signals) {
  const lower = textContent.toLowerCase();
  const hits = [];
  for (const sig of signals) {
    const re = new RegExp(sig, "i");
    if (re.test(lower)) hits.push(sig);
  }
  return hits;
}

function scoreTaskFitGuidance(textContent, hasCtaToCalcOrCompare) {
  const taskFitHits = detectSignals(textContent, TASK_FIT_SIGNALS);
  const costHits = detectSignals(textContent, COST_SIGNALS);
  const score =
    taskFitHits.length * 3 +
    costHits.length * 1 +
    (hasCtaToCalcOrCompare ? 5 : 0);
  return { score, taskFitHits, costHits };
}

function isHighPriorityPage(pathname) {
  for (const { pattern, label } of HIGH_PRIORITY_PATTERNS) {
    if (pattern.test(pathname)) return label;
  }
  return null;
}

// ─── Main crawl ──────────────────────────────────────────────────────────────

async function crawlPage(page, url) {
  const localUrl = url.replace(CANONICAL, BASE_URL);
  const pathname = new URL(url).pathname;

  let status = 200;
  let errorMsg = null;
  let title = "";
  let h1 = "";
  let textContent = "";
  let ctaLinks = [];
  let linksToCalcOrCompare = false;
  let hasCta = false;
  let taskFitHits = [];
  let costHits = [];
  let score = 0;

  try {
    const response = await page.goto(localUrl, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUT_MS,
    });
    status = response?.status() ?? 0;

    // Wait a moment for React to render
    await page.waitForTimeout(800);

    title = await page.title().catch(() => "");

    h1 = await page
      .$eval("h1", (el) => el.textContent?.trim() ?? "")
      .catch(() => "");

    textContent = await page
      .$eval("body", (el) => el.innerText ?? "")
      .catch(() => "");

    // Check for CTAs
    const ctaTexts = await page
      .$$eval("a, button", (els) =>
        els.map((el) => el.textContent?.trim().toLowerCase() ?? "")
      )
      .catch(() => []);

    hasCta = ctaTexts.some((t) =>
      CTA_SIGNALS.some((sig) => t.includes(sig))
    );

    // Check links to calculator or compare pages
    const allHrefs = await page
      .$$eval("a[href]", (els) => els.map((el) => el.getAttribute("href") ?? ""))
      .catch(() => []);

    linksToCalcOrCompare = allHrefs.some((href) =>
      CALCULATOR_LINK_PATTERNS.some((p) => href.includes(p))
    );

    const signals = scoreTaskFitGuidance(textContent, linksToCalcOrCompare);
    score = signals.score;
    taskFitHits = signals.taskFitHits;
    costHits = signals.costHits;
  } catch (err) {
    errorMsg = String(err).slice(0, 120);
    status = 0;
  }

  const pageType = getPageType(new URL(url).pathname);
  const priority = isHighPriorityPage(pathname);
  const aligned = score >= 12;
  const missingGuidance = priority !== null && !aligned;

  return {
    url,
    localUrl,
    pathname,
    pageType,
    status,
    errorMsg,
    title,
    h1,
    hasCta,
    linksToCalcOrCompare,
    taskFitHits,
    costHitsCount: costHits.length,
    score,
    highPriorityLabel: priority,
    aligned,
    missingGuidance,
  };
}

// ─── Report generators ───────────────────────────────────────────────────────

function buildRecommendedCopy() {
  return {
    compare: {
      heading: "Choose the right model for the task, not the most expensive",
      body: `Most users default to the flagship model for every job — but frontier models cost 10–50× more than mid-tier alternatives with comparable quality on simple tasks. Before committing to a subscription or API, use the calculator below to see what your actual monthly bill looks like across models.`,
      cta: "Calculate your real cost →",
      ctaHref: "/calculator",
    },
    pricing: {
      heading: "Is this model right for your tasks?",
      body: `Before paying for the highest tier, check whether a cheaper model handles your specific workload. For routine tasks like summarisation, classification, and drafting, GPT-4o mini, Claude Haiku, or Gemini Flash cost 10–100× less with minimal quality difference.`,
      cta: "Compare models for your use case →",
      ctaHref: "/decision-engine",
    },
    calculator: {
      heading: "Routing matters as much as choosing a model",
      body: `If you route all tasks to one model, you're paying frontier prices for tasks that don't need frontier quality. A two-tier strategy — budget model for simple tasks, premium model for complex reasoning — typically cuts API spend by 60–80%.`,
      cta: "See routing guide →",
      ctaHref: "/guides/how-to-reduce-ai-cost",
    },
    "coding-ai-type": {
      heading: "Not every coding task needs the best model",
      body: `Code completion, docstring generation, and simple refactors work well with Claude Haiku or GPT-4o mini. Save Sonnet or GPT-4o for complex multi-file refactors and architectural reasoning. Cursor Pro's model routing already does this automatically.`,
      cta: "Best AI for coding on a budget →",
      ctaHref: "/best/best-ai-for-coding-on-a-budget",
    },
    "worth-it": {
      heading: "The right model depends on what you're actually doing",
      body: `Subscriptions make sense when you use AI heavily every day. If your usage is moderate, pay-per-token API access costs $2–5/month instead of $20. Use the calculator to see which side of the line you're on.`,
      cta: "Calculate my real cost →",
      ctaHref: "/calculator",
    },
    alternatives: {
      heading: "The cheapest alternative that fits your tasks is the best one",
      body: `Switching models saves money only if the cheaper model handles your workload well. Use our decision engine to match your specific tasks to the right model — not just the cheapest one available.`,
      cta: "Find the right model for your tasks →",
      ctaHref: "/decision-engine",
    },
    default: {
      heading: "Use the right model for the task",
      body: `Frontier models cost 10–100× more than cheaper alternatives. For most tasks — drafting, summarising, classifying — a mid-tier model is indistinguishable in quality at a fraction of the price.`,
      cta: "Find your cheapest viable setup →",
      ctaHref: "/calculator",
    },
  };
}

function buildInternalLinks(results) {
  const missing = results.filter((r) => r.missingGuidance);
  const links = new Set();
  for (const r of missing) {
    if (r.pageType === "pricing" || r.pageType === "compare") {
      links.add("Add link to /calculator from " + r.pathname);
      links.add("Add link to /decision-engine from " + r.pathname);
    }
    if (r.pageType === "best") {
      links.add("Add link to /calculator from " + r.pathname);
    }
    if (r.pageType === "ai-type") {
      links.add("Add link to relevant /compare/* from " + r.pathname);
    }
  }
  return [...links].slice(0, 20);
}

function generateMarkdown(results, copyBlocks) {
  const total = results.length;
  const errors = results.filter((r) => r.status === 0 || r.status >= 400);
  const aligned = results.filter((r) => r.aligned);
  const missing = results.filter((r) => r.missingGuidance);
  const highPriority = missing
    .filter((r) => ["compare", "pricing", "calculator"].includes(r.highPriorityLabel ?? ""))
    .sort((a, b) => (b.highPriorityLabel?.length ?? 0) - (a.highPriorityLabel?.length ?? 0));

  const internalLinks = buildInternalLinks(results);

  const lines = [];

  lines.push(`# Task-Fit Model Guidance Audit`);
  lines.push(`\n_Generated: ${TODAY}_\n`);

  // Executive summary
  lines.push(`## Executive Summary\n`);
  lines.push(`This audit checked **${total} pages** crawled from \`public/sitemap.xml\` against the local dev server.`);
  lines.push(`\nThe goal: identify pages that should carry "choose the right model for the task, not the most expensive model" guidance but currently don't.\n`);
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Pages crawled | ${total} |`);
  lines.push(`| Pages with errors (timeout / 4xx) | ${errors.length} |`);
  lines.push(`| Pages already aligned | ${aligned.length} |`);
  lines.push(`| High-priority pages missing task-fit guidance | ${missing.length} |`);
  lines.push(`| Highest-priority changes needed | ${highPriority.length} |`);

  // Pages crawled
  lines.push(`\n## Pages Crawled (${total})\n`);
  lines.push(`| Path | Type | Status | Score | Aligned |`);
  lines.push(`|------|------|--------|-------|---------|`);
  for (const r of results) {
    const status = r.status === 0 ? "ERR" : String(r.status);
    const aligned = r.aligned ? "✓" : r.highPriorityLabel ? "✗ needs work" : "—";
    lines.push(`| ${r.pathname} | ${r.pageType} | ${status} | ${r.score} | ${aligned} |`);
  }

  // Already aligned
  lines.push(`\n## Pages Already Aligned (${aligned.length})\n`);
  if (aligned.length === 0) {
    lines.push(`_No pages met the full alignment threshold (score ≥ 12)._\n`);
  } else {
    lines.push(`These pages already reference task-fit model choice, cost signals, and link to the calculator or compare pages.\n`);
    for (const r of aligned) {
      lines.push(`- **${r.pathname}** (${r.pageType}) — score ${r.score}, signals: ${r.taskFitHits.slice(0, 3).join(", ")}`);
    }
  }

  // Missing guidance
  lines.push(`\n## Pages Missing Task-Fit Guidance (${missing.length})\n`);
  if (missing.length === 0) {
    lines.push(`_All high-priority pages are aligned._\n`);
  } else {
    lines.push(`These pages are in a high-priority category but lack clear task-fit model guidance.\n`);
    lines.push(`| Path | Type | Score | Missing signals |`);
    lines.push(`|------|------|-------|-----------------|`);
    for (const r of missing) {
      const missing_sigs = r.taskFitHits.length === 0 ? "no task-fit signals" : `only ${r.taskFitHits.length} signals`;
      lines.push(`| ${r.pathname} | ${r.highPriorityLabel ?? r.pageType} | ${r.score} | ${missing_sigs} |`);
    }
  }

  // Recommended copy blocks
  lines.push(`\n## Recommended Copy Blocks by Page Type\n`);
  lines.push(`These blocks should be inserted near the top of the relevant page section, above the main content or below the H1.\n`);
  for (const [type, copy] of Object.entries(copyBlocks)) {
    if (type === "default") continue;
    lines.push(`### ${type}\n`);
    lines.push(`**Heading:** ${copy.heading}\n`);
    lines.push(`**Body:** ${copy.body}\n`);
    lines.push(`**CTA:** [${copy.cta}](${copy.ctaHref})\n`);
  }

  // Highest-priority changes
  lines.push(`\n## Highest-Priority Changes\n`);
  lines.push(`These are the pages where adding task-fit guidance would have the highest commercial impact (comparison and pricing pages drive the most purchase intent).\n`);
  const topChanges = missing
    .sort((a, b) => {
      const order = { compare: 0, pricing: 1, calculator: 2, "worth-it": 3, alternatives: 4 };
      return (order[a.highPriorityLabel ?? ""] ?? 99) - (order[b.highPriorityLabel ?? ""] ?? 99);
    })
    .slice(0, 15);
  let rank = 1;
  for (const r of topChanges) {
    const copy = copyBlocks[r.highPriorityLabel ?? ""] ?? copyBlocks.default;
    lines.push(`### ${rank}. \`${r.pathname}\` (${r.highPriorityLabel ?? r.pageType})\n`);
    lines.push(`- **Current score:** ${r.score} / recommended ≥ 12`);
    lines.push(`- **H1:** ${r.h1 || "(none detected)"}`);
    lines.push(`- **Has CTA:** ${r.hasCta ? "yes" : "no"}`);
    lines.push(`- **Links to calculator/compare:** ${r.linksToCalcOrCompare ? "yes" : "no"}`);
    lines.push(`- **Suggested block:** "${copy.heading}"`);
    lines.push(`- **Suggested CTA:** [${copy.cta}](${copy.ctaHref})\n`);
    rank++;
  }

  // Internal links
  lines.push(`\n## Suggested Internal Links\n`);
  if (internalLinks.length === 0) {
    lines.push(`_No high-priority internal link gaps identified._\n`);
  } else {
    for (const link of internalLinks) {
      lines.push(`- ${link}`);
    }
  }

  // Risks / notes
  lines.push(`\n## Risks / Notes\n`);
  lines.push(`- **Scoring threshold:** Alignment score ≥ 12 was used as the pass threshold. Adjust in \`scripts/audit-task-fit-model-guidance.mjs\` if needed.`);
  lines.push(`- **Crawl environment:** This audit ran against the local dev server (\`${BASE_URL}\`). Some pages may render differently on production.`);
  lines.push(`- **Dynamic content:** React pages were given 800ms to hydrate. Pages with long load times may have been scored on partial content.`);
  lines.push(`- **Error pages:** ${errors.length} page(s) returned an error or timed out — check the JSON output for details.`);
  lines.push(`- **Scope:** This is a read-only audit. No UI changes were made.`);
  if (errors.length > 0) {
    lines.push(`\n### Error pages\n`);
    for (const r of errors) {
      lines.push(`- \`${r.pathname}\` — status ${r.status}${r.errorMsg ? ": " + r.errorMsg : ""}`);
    }
  }

  lines.push(`\n---\n_OverpayingForAI task-fit audit · ${TODAY}_`);

  return lines.join("\n");
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍  Task-fit model guidance audit\n");
  console.log(`   Base URL : ${BASE_URL}`);
  console.log(`   Sitemap  : ${SITEMAP_PATH}`);
  console.log(`   Output   : ${OUT_DIR}\n`);

  // Parse sitemap
  const canonicalUrls = parseSitemap(SITEMAP_PATH);
  console.log(`   Found ${canonicalUrls.length} URLs in sitemap\n`);

  // Launch browser — use system Chromium if the Playwright bundle is missing libs
  const SYSTEM_CHROMIUM = "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium";
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    || (fs.existsSync(SYSTEM_CHROMIUM) ? SYSTEM_CHROMIUM : undefined);

  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const context = await browser.newContext({
    userAgent: "OverpayingForAI-Audit/1.0 (task-fit-model-guidance)",
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  const results = [];
  let idx = 0;
  for (const url of canonicalUrls) {
    idx++;
    const pathname = new URL(url).pathname;
    process.stdout.write(`   [${String(idx).padStart(2, "0")}/${canonicalUrls.length}] ${pathname.padEnd(50)} `);
    const result = await crawlPage(page, url);
    const icon = result.status === 0
      ? "⚠️ ERR"
      : result.missingGuidance
      ? "✗ needs work"
      : result.aligned
      ? "✓ aligned"
      : "—";
    console.log(`score:${result.score} ${icon}`);
    results.push(result);
  }

  await browser.close();

  // Build report
  const copyBlocks = buildRecommendedCopy();
  const markdown = generateMarkdown(results, copyBlocks);

  // Write outputs
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const mdPath = path.join(OUT_DIR, "task-fit-model-guidance-audit.md");
  const jsonPath = path.join(OUT_DIR, "task-fit-model-guidance-audit.json");

  fs.writeFileSync(mdPath, markdown, "utf8");
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        meta: {
          generatedAt: new Date().toISOString(),
          baseUrl: BASE_URL,
          sitemapPath: SITEMAP_PATH,
          totalPages: results.length,
          alignedPages: results.filter((r) => r.aligned).length,
          missingGuidancePages: results.filter((r) => r.missingGuidance).length,
          errorPages: results.filter((r) => r.status === 0 || r.status >= 400).length,
        },
        copyBlocks,
        results,
      },
      null,
      2
    ),
    "utf8"
  );

  // Summary
  const aligned = results.filter((r) => r.aligned);
  const missing = results.filter((r) => r.missingGuidance);
  const errors = results.filter((r) => r.status === 0 || r.status >= 400);

  console.log(`\n${"─".repeat(60)}`);
  console.log(`   Pages crawled         : ${results.length}`);
  console.log(`   Already aligned       : ${aligned.length}`);
  console.log(`   Missing guidance      : ${missing.length}`);
  console.log(`   Errors                : ${errors.length}`);
  console.log(`\n   📄 ${mdPath}`);
  console.log(`   📄 ${jsonPath}`);
  console.log(`${"─".repeat(60)}\n`);
}

main().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
