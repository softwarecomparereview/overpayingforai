import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/runner/workspace/qa/node_modules/playwright");

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const BASE = process.env.BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const CHROMIUM_PATH = process.env.CHROMIUM_PATH || "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium";

const compareSlugs = JSON.parse(readFileSync("artifacts/overpaying-for-ai/src/data/comparisons.json")).map(x => x.slug);
const bestSlugs = JSON.parse(readFileSync("artifacts/overpaying-for-ai/src/data/best-of.json")).map(x => x.slug);
const guideSlugs = JSON.parse(readFileSync("artifacts/overpaying-for-ai/src/data/guides.json")).map(x => x.slug);
const aiTypeSlugs = JSON.parse(readFileSync("artifacts/overpaying-for-ai/src/data/aiTypes.json")).map(x => x.slug || x.id);

const ROUTES = [
  "/",
  "/ai-types",
  ...aiTypeSlugs.map(s => `/ai-types/${s}`),
  "/calculator",
  "/decision-engine",
  "/compare",
  ...compareSlugs.map(s => `/compare/${s}`),
  "/best",
  ...bestSlugs.map(s => `/best/${s}`),
  "/guides",
  ...guideSlugs.map(s => `/guides/${s}`),
  "/resources",
  "/changelog",
  "/pricing-changelog",
  "/terms",
  "/media-kit",
];

const COMMERCIAL_PATHS = new Set([
  "/", "/calculator", "/decision-engine", "/compare", "/best", "/ai-types", "/resources",
  ...compareSlugs.map(s => `/compare/${s}`),
  ...bestSlugs.map(s => `/best/${s}`),
  ...aiTypeSlugs.map(s => `/ai-types/${s}`),
  ...guideSlugs.map(s => `/guides/${s}`),
  "/guides",
]);

const runId = process.env.RUN_ID || new Date().toISOString().replace(/[:.]/g, "-").replace(/T/, "_").slice(0, 19);
const RUN_DIR = join("out/audits", runId);
const SITE_DIR = join(RUN_DIR, "site");
const DEC_DIR = join(RUN_DIR, "decision");
mkdirSync(join(SITE_DIR, "reports"), { recursive: true });
mkdirSync(DEC_DIR, { recursive: true });

const issues = [];
const pages = [];

async function harvestPage(page, route) {
  const url = `${BASE}${route}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 8000 });
    await page.waitForSelector("h1, main, [data-testid]", { timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(200);
  } catch (e) {
    issues.push({ type: "page_load_failed", severity: "high", url: route, detail: e.message });
    return null;
  }

  const data = await page.evaluate(() => {
    const title = document.title || "";
    const desc = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    const canonicals = Array.from(document.querySelectorAll('link[rel="canonical"]')).map(l => l.getAttribute("href"));
    const h1s = Array.from(document.querySelectorAll("h1")).map(h => (h.textContent || "").trim()).filter(Boolean);
    const outboundCtas = Array.from(document.querySelectorAll("a[href]")).filter(a => {
      const href = a.getAttribute("href") || "";
      const isExternal = /^https?:\/\//.test(href) && !href.includes(location.host);
      const isLinkedIn = /linkedin\.com/.test(href);
      const isGitHub = /github\.com/.test(href);
      const isReplitDevBanner = /replit-dev-banner|docs\.replit\.com/.test(href);
      return isExternal && !isLinkedIn && !isGitHub && !isReplitDevBanner;
    }).map(a => ({
      href: a.getAttribute("href"),
      rel: a.getAttribute("rel") || "",
      text: ((a.textContent || "")).trim().slice(0, 80),
    }));
    const fakeAffordance = document.querySelectorAll('a div[class*="cursor-pointer"]').length;
    return { title, desc, canonicals, h1s, outboundCtas, fakeAffordance };
  });

  pages.push({ route, ...data });
  return data;
}

// HTTP fetch fallback — much faster than headless browser. SPA renders client-side
// so we still need playwright for first-render data, but we can pre-warm.
async function fetchHtml(route) {
  const res = await fetch(`${BASE}${route}`, { headers: { "user-agent": "Mozilla/5.0 audit-bot" } });
  return await res.text();
}

function detectPageIssues() {
  const titleMap = {};
  const descMap = {};
  const h1Map = {};
  for (const p of pages) {
    (titleMap[p.title] ||= []).push(p.route);
    if (p.desc) (descMap[p.desc] ||= []).push(p.route);
    for (const h of p.h1s) (h1Map[h] ||= []).push(p.route);
  }

  for (const p of pages) {
    if (!p.title || /^overpaying for ai$/i.test(p.title.trim())) {
      issues.push({ type: "duplicate_title", severity: "low", url: p.route, detail: p.title });
    } else if (titleMap[p.title].length > 1) {
      issues.push({ type: "duplicate_title", severity: "low", url: p.route, detail: p.title });
    }
    if (!p.desc) {
      issues.push({ type: "missing_meta_description", severity: "medium", url: p.route, detail: "" });
    }
    if (!p.canonicals || p.canonicals.length === 0) {
      issues.push({ type: "missing_canonical", severity: "medium", url: p.route, detail: "" });
    } else if (p.canonicals.length > 1) {
      issues.push({ type: "duplicate_canonical", severity: "medium", url: p.route, detail: p.canonicals.join(" | ") });
    }
    if (p.h1s.length === 0) {
      issues.push({ type: "missing_h1", severity: "medium", url: p.route, detail: "" });
    } else if (p.h1s.length === 1 && h1Map[p.h1s[0]].length > 1) {
      issues.push({ type: "duplicate_h1", severity: "low", url: p.route, detail: p.h1s[0] });
    }
    if (p.fakeAffordance > 0) {
      issues.push({ type: "fake_affordance", severity: "medium", url: p.route, detail: `${p.fakeAffordance} occurrence(s)` });
    }
    if (COMMERCIAL_PATHS.has(p.route)) {
      if (p.outboundCtas.length === 0) {
        issues.push({ type: "no_outbound_cta_on_commercial_page", severity: "high", url: p.route, detail: "" });
      } else {
        const sponsored = p.outboundCtas.filter(c => /sponsored/.test(c.rel));
        if (sponsored.length === 0) {
          issues.push({ type: "outbound_missing_rel_sponsored", severity: "low", url: p.route, detail: `${p.outboundCtas.length} outbound, 0 sponsored` });
        }
      }
    }
  }
}

async function auditCalculator(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const presets = [
    { input: 5000, output: 2500, label: "5K" },
    { input: 50000, output: 25000, label: "50K" },
    { input: 500000, output: 250000, label: "500K" },
    { input: 5000000, output: 2500000, label: "5M" },
  ];
  const results = [];
  for (const p of presets) {
    try {
      await page.goto(`${BASE}/calculator`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForSelector('[data-testid="input-tokens"]', { timeout: 8000 });
      await page.fill('[data-testid="input-tokens"]', String(p.input));
      await page.fill('[data-testid="output-tokens"]', String(p.output));
      await page.click('[data-testid="calculate-btn"]');
      await page.waitForTimeout(700);
      const data = await page.evaluate(() => {
        const totalCost = document.querySelector('[data-testid="total-cost"]')?.textContent?.trim() || "";
        const heading = document.querySelector('[data-testid="calc-h1"]')?.textContent?.trim() || "";
        const verdict = document.querySelector('[data-testid="calc-verdict"]')?.textContent?.trim() || "";
        const recommended = document.querySelector('[data-testid="calc-primary-recommendation"]')?.textContent?.trim() || "";
        return { totalCost, heading, verdict, recommended };
      });
      results.push({ preset: p.label, ...data });
    } catch (e) {
      results.push({ preset: p.label, error: e.message });
    }
  }
  await ctx.close();
  const totals = new Set(results.map(r => r.totalCost));
  const verdicts = new Set(results.map(r => r.verdict));
  const dynamic = totals.size >= 3;
  return { results, uniqueTotals: totals.size, uniqueVerdicts: verdicts.size, dynamic };
}

async function auditDecisionEngine(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const useCases = ["coding", "writing", "research", "automation", "chat"];
  const budgets = ["free", "under20", "under50", "premium"];
  const freqs = ["light", "medium", "heavy"];
  const quals = ["cheap", "balanced", "best"];
  const freeTier = [true, false];

  // Sample 30 scenarios evenly across the matrix (5*4*3*3*2 = 360 combos)
  const all = [];
  for (const u of useCases) for (const b of budgets) for (const f of freqs) for (const q of quals) for (const ft of freeTier) {
    all.push({ u, b, f, q, ft });
  }
  const N = 20;
  // Use a stride coprime to 360 so the sample spans every axis.
  // 360 = 2^3 * 3^2 * 5; stride 19 is coprime, so freeTier/quality/frequency
  // all rotate independently from useCase/budget. (The previous floor(360/N)=18
  // locked freeTier=true, quality=cheap, frequency=light across all 20 samples.)
  const stride = (all.length === 360 && N === 20) ? 19 : Math.floor(all.length / N);
  const limited = [];
  for (let k = 0; k < N; k++) limited.push(all[(k * stride) % all.length]);

  const results = [];
  for (const s of limited) {
    try {
      await page.goto(`${BASE}/decision-engine`, { waitUntil: "domcontentloaded", timeout: 12000 });
      await page.waitForTimeout(150);
      const sels = [
        `[data-testid="option-${s.u}"]`,
        `[data-testid="option-${s.b}"]`,
        `[data-testid="option-${s.f}"]`,
        `[data-testid="option-${s.q}"]`,
        `[data-testid="option-${s.ft}"]`,
      ];
      for (const sel of sels) {
        await page.waitForSelector(sel, { timeout: 5000 });
        await page.click(sel);
        await page.waitForTimeout(150);
      }
      await page.waitForSelector('[data-testid="decision-result"]', { timeout: 5000 });
      const data = await page.evaluate(() => ({
        recommendedName: document.querySelector('[data-testid="decision-recommended-name"]')?.textContent?.trim() || "",
        recommendedProvider: document.querySelector('[data-testid="decision-recommended-provider"]')?.textContent?.trim() || "",
        cost: document.querySelector('[data-testid="decision-recommended-cost"]')?.textContent?.trim() || "",
        rationale: (document.querySelector('[data-testid="decision-rationale"]')?.textContent || "").trim().slice(0, 100),
        strategy: (document.querySelector('[data-testid="decision-strategy"]')?.textContent || "").trim().slice(0, 80),
      }));
      results.push({ scenario: s, ...data, ok: true });
    } catch (e) {
      results.push({ scenario: s, error: e.message, ok: false });
    }
  }
  await ctx.close();
  const recs = new Set(results.filter(r => r.ok).map(r => r.recommendedName).filter(Boolean));
  return { results, totalScenarios: limited.length, successful: results.filter(r => r.ok).length, uniqueRecommendations: recs.size, recommendations: [...recs] };
}

async function phaseSite() {
  // Restart browser every 25 routes to avoid memory exhaustion
  const CHUNK = 25;
  let n = 0;
  for (let i = 0; i < ROUTES.length; i += CHUNK) {
    const chunk = ROUTES.slice(i, i + CHUNK);
    const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, args: ["--no-sandbox"] });
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await ctx.newPage();
    for (const r of chunk) {
      await harvestPage(page, r);
      process.stdout.write(`\r  site ${++n}/${ROUTES.length}  `);
    }
    await ctx.close();
    await browser.close();
  }
  console.log();
  detectPageIssues();
  console.log(`Site issues: ${issues.length}`);
  writeFileSync(join(SITE_DIR, "reports", "issues.json"), JSON.stringify({ startedAt: new Date().toISOString(), finishedAt: new Date().toISOString(), issueCount: issues.length, issues }, null, 2));
  writeFileSync(join(SITE_DIR, "reports", "pages.json"), JSON.stringify(pages, null, 2));
}

async function phaseCalc() {
  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, args: ["--no-sandbox"] });
  const calc = await auditCalculator(browser);
  console.log(`  unique totals: ${calc.uniqueTotals}/4, dynamic=${calc.dynamic}`);
  await browser.close();
  writeFileSync(join(DEC_DIR, "calc.json"), JSON.stringify(calc, null, 2));
}

async function phaseDec() {
  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, args: ["--no-sandbox"] });
  const dec = await auditDecisionEngine(browser);
  console.log(`  unique recommendations: ${dec.uniqueRecommendations} across ${dec.successful}/${dec.totalScenarios}`);
  await browser.close();
  writeFileSync(join(DEC_DIR, "results.json"), JSON.stringify(dec, null, 2));
}

async function phaseSummary(targetRunDir) {
  const dir = targetRunDir || RUN_DIR;
  const sitePath = join(dir, "site/reports/issues.json");
  const calcPath = join(dir, "decision/calc.json");
  const decPath = join(dir, "decision/results.json");
  const siteData = JSON.parse(readFileSync(sitePath));
  const calc = JSON.parse(readFileSync(calcPath));
  const dec = JSON.parse(readFileSync(decPath));
  const allIssues = [...siteData.issues];
  if (!calc.dynamic) allIssues.push({ type: "calculator_static_output", severity: "high", url: "/calculator", detail: `Only ${calc.uniqueTotals} unique totals across 4 presets` });
  if (dec.uniqueRecommendations < 6) allIssues.push({ type: "decision_engine_low_diversity", severity: dec.uniqueRecommendations <= 2 ? "high" : "medium", url: "/decision-engine", detail: `Only ${dec.uniqueRecommendations} unique recommendations across ${dec.successful} scenarios` });

  const byType = {};
  for (const i of allIssues) byType[i.type] = (byType[i.type] || 0) + 1;
  const commit = execSync("git --no-optional-locks rev-parse HEAD").toString().trim();
  const branch = execSync("git --no-optional-locks branch --show-current").toString().trim() || "detached";
  const meta = {
    runId: dir.split("/").pop(), createdAt: new Date().toISOString(), branch, commit: commit.slice(0, 7), commitFull: commit,
    runDir: dir,
    pageCount: JSON.parse(readFileSync(join(dir, "site/reports/pages.json"))).length,
    issueCount: allIssues.length, byType,
    calculator: { uniqueTotals: calc.uniqueTotals, uniqueVerdicts: calc.uniqueVerdicts, dynamic: calc.dynamic },
    decision: { totalScenarios: dec.totalScenarios, successful: dec.successful, uniqueRecommendations: dec.uniqueRecommendations, recommendations: dec.recommendations },
  };
  writeFileSync(join(dir, "run-meta.json"), JSON.stringify(meta, null, 2));
  writeFileSync(join(dir, "site/reports/issues.json"), JSON.stringify({ ...siteData, issueCount: allIssues.length, issues: allIssues }, null, 2));
  console.log("=== SUMMARY ===");
  console.log(JSON.stringify({ byType, calc: meta.calculator, dec: meta.decision }, null, 2));
}

const phase = process.argv[2] || "all";
const overrideRunDir = process.env.RUN_DIR;
if (overrideRunDir) {
  // override paths so subsequent phases reuse the same run dir
  // (RUN_DIR/SITE_DIR/DEC_DIR are consts; instead we just write into overrideRunDir manually)
}

(async () => {
  console.log(`BASE=${BASE}  phase=${phase}  runDir=${RUN_DIR}`);
  try {
    if (phase === "site" || phase === "all") await phaseSite();
    if (phase === "calc" || phase === "all") await phaseCalc();
    if (phase === "dec" || phase === "all") await phaseDec();
    if (phase === "summary" || phase === "all") await phaseSummary(overrideRunDir);
  } catch (e) {
    console.error("PHASE FAILED:", e.message);
    process.exit(1);
  }
})();
