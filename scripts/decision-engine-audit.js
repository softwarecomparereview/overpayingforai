// scripts/decision-engine-audit.js
// Calculator + decision-engine harness for overpayingforai.com.
//
// Drives the live calculator/decision-engine pages with a configurable scenario
// matrix, captures input/output pairs and screenshots, and writes a structured
// review report.
//
// Usage:
//   node scripts/decision-engine-audit.js
//   node scripts/decision-engine-audit.js --maxScenarios=50 --headless=true
//   node scripts/decision-engine-audit.js --base=https://overpayingforai.com
//
// Outputs:
//   out/decision-audit/results.json
//   out/decision-audit/results.csv
//   out/decision-audit/summary.md
//   out/decision-audit/screenshots/<scenarioId>.png

import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import {
  parseArgs, asBool, asInt, ensureDir, writeJson, writeCsv,
  cleanText, nowIso,
} from "./lib/utils.js";

const require = createRequire(import.meta.url);
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
  return null;
}
const CHROMIUM_EXEC = resolveChromium();

const args = parseArgs(process.argv);
const BASE = args.base || "https://overpayingforai.com";
const HEADLESS = asBool(args.headless, true);
const TIMEOUT_MS = asInt(args.timeout, 30000);
const MAX_SCENARIOS = asInt(args.maxScenarios, 60);
const SHOTS = !asBool(args.noScreenshots, false);

const OUT_BASE = resolve(process.cwd(), "out", "decision-audit");
const SHOTS_DIR = join(OUT_BASE, "screenshots");
ensureDir(OUT_BASE);
ensureDir(SHOTS_DIR);

// ────────────────────────────────────────────────────────────────────
// SCENARIO MATRIX
// Edit / extend these dimensions to broaden coverage. The runner will
// build the cross-product, dedupe, and cap to MAX_SCENARIOS.
// ────────────────────────────────────────────────────────────────────
const DIMENSIONS = {
  useCase: [
    "writing", "coding", "research", "summarization", "chatbot",
    "image generation", "data analysis", "translation",
  ],
  budget: ["under $20", "$20-$50", "$50-$200", "no budget cap"],
  priority: ["cheapest", "best quality", "fastest", "balanced"],
  volume: ["light (a few/day)", "medium (hourly)", "heavy (continuous)"],
  team: ["solo", "startup", "team"],
};

function buildScenarios(limit) {
  const out = [];
  let id = 0;
  outer: for (const useCase of DIMENSIONS.useCase) {
    for (const budget of DIMENSIONS.budget) {
      for (const priority of DIMENSIONS.priority) {
        for (const volume of DIMENSIONS.volume) {
          for (const team of DIMENSIONS.team) {
            id++;
            out.push({
              id: `S${String(id).padStart(4, "0")}`,
              useCase, budget, priority, volume, team,
            });
            if (out.length >= limit) break outer;
          }
        }
      }
    }
  }
  return out;
}

// Token presets used to drive the API-pricing calculator (when present).
const TOKEN_PRESETS = [
  { label: "tiny",    inputTokens: 5000,    outputTokens: 1000 },
  { label: "light",   inputTokens: 50000,   outputTokens: 10000 },
  { label: "medium",  inputTokens: 500000,  outputTokens: 100000 },
  { label: "heavy",   inputTokens: 5000000, outputTokens: 1000000 },
];

console.log("Decision-engine audit starting");
console.log(`  base:         ${BASE}`);
console.log(`  headless:     ${HEADLESS}`);
console.log(`  timeout:      ${TIMEOUT_MS}ms`);
console.log(`  maxScenarios: ${MAX_SCENARIOS}`);
console.log(`  screenshots:  ${SHOTS}`);
console.log(`  output:       ${OUT_BASE}`);

(async () => {
  const launchOptions = {
    headless: HEADLESS,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  };
  if (CHROMIUM_EXEC) {
    launchOptions.executablePath = CHROMIUM_EXEC;
    console.log(`  chromium:     ${CHROMIUM_EXEC}`);
  }
  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    userAgent: "Mozilla/5.0 (compatible; OverpayingForAI-DecisionAudit/1.0)",
    ignoreHTTPSErrors: true,
  });

  const results = [];

  // ── Phase A: Calculator (token-input cost calculator) ─────────────
  const calcPage = await context.newPage();
  let calcInputs = null;
  try {
    await calcPage.goto(`${BASE}/calculator`, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
    try { await calcPage.waitForLoadState("networkidle", { timeout: TIMEOUT_MS }); } catch {}
    calcInputs = await discoverCalcInputs(calcPage);
    console.log(`  calculator inputs discovered: ${JSON.stringify(calcInputs)}`);
  } catch (err) {
    console.warn(`  could not load /calculator: ${err?.message || err}`);
  }

  if (calcInputs && calcInputs.inputSelector && calcInputs.outputSelector) {
    for (const preset of TOKEN_PRESETS) {
      const id = `CALC-${preset.label}`;
      console.log(`[calc] ${id} input=${preset.inputTokens} output=${preset.outputTokens}`);
      const r = await runCalcScenario({
        page: calcPage, id, preset, inputs: calcInputs, base: BASE,
        screenshotsDir: SHOTS_DIR, timeoutMs: TIMEOUT_MS,
      });
      results.push(r);
    }
  } else {
    results.push({
      scenarioId: "CALC-discovery",
      surface: "calculator",
      inputs: {},
      ok: false,
      error: "Could not discover calculator input fields",
      domNote: calcInputs ? JSON.stringify(calcInputs) : "no inputs found",
    });
  }
  try { await calcPage.close(); } catch {}

  // ── Phase B: Decision Engine (use-case driven) ────────────────────
  const scenarios = buildScenarios(MAX_SCENARIOS);
  console.log(`  decision-engine scenarios: ${scenarios.length}`);

  for (const sc of scenarios) {
    const page = await context.newPage();
    console.log(`[dec ${sc.id}] ${sc.useCase} / ${sc.budget} / ${sc.priority} / ${sc.volume} / ${sc.team}`);
    const r = await runDecisionScenario({
      page, scenario: sc, base: BASE,
      screenshotsDir: SHOTS_DIR, timeoutMs: TIMEOUT_MS,
    });
    results.push(r);
    try { await page.close(); } catch {}
  }

  await context.close();
  await browser.close();

  // ── Aggregation ──────────────────────────────────────────────────
  const ok = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  const recCounts = new Map();
  for (const r of ok) {
    const key = (r.recommendedTool || "(none)").trim().toLowerCase();
    recCounts.set(key, (recCounts.get(key) || 0) + 1);
  }
  const sameRec = Array.from(recCounts.entries()).filter(([, n]) => n > 1);
  const noExplanation = ok.filter((r) => !r.explanation || r.explanation.length < 30);
  const noPricing = ok.filter((r) => !r.pricingText);
  const noAlternatives = ok.filter((r) => !r.alternatives || r.alternatives.length === 0);
  const generic = ok.filter((r) => /generic|general|any|various/i.test(r.resultText || ""));

  // ── Outputs ──────────────────────────────────────────────────────
  writeJson(join(OUT_BASE, "results.json"), {
    startedAt: nowIso(),
    base: BASE,
    totalScenarios: results.length,
    successful: ok.length,
    failed: failed.length,
    uniqueRecommendations: recCounts.size,
    results,
  });

  const flat = results.map((r) => ({
    scenarioId: r.scenarioId,
    surface: r.surface,
    ok: r.ok,
    useCase: r.inputs?.useCase || "",
    budget: r.inputs?.budget || "",
    priority: r.inputs?.priority || "",
    volume: r.inputs?.volume || "",
    team: r.inputs?.team || "",
    inputTokens: r.inputs?.inputTokens || "",
    outputTokens: r.inputs?.outputTokens || "",
    recommendedTool: r.recommendedTool || "",
    alternatives: (r.alternatives || []).join(" | "),
    pricingText: r.pricingText || "",
    confidenceText: r.confidenceText || "",
    freshnessText: r.freshnessText || "",
    explanation: r.explanation || "",
    resultText: (r.resultText || "").slice(0, 1500),
    screenshot: r.screenshot || "",
    error: r.error || "",
  }));
  writeCsv(join(OUT_BASE, "results.csv"), flat);

  const md = [];
  md.push(`# Decision Engine Audit Summary`);
  md.push(``);
  md.push(`- Base: ${BASE}`);
  md.push(`- Total scenarios: **${results.length}**`);
  md.push(`- Successful: **${ok.length}**`);
  md.push(`- Failed: **${failed.length}**`);
  md.push(`- Unique recommendations: **${recCounts.size}**`);
  md.push(``);
  md.push(`## Recommendation distribution`);
  Array.from(recCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([rec, n]) => md.push(`- ${rec || "(empty)"}: ${n}`));
  md.push(``);
  md.push(`## Recommendations shared across multiple scenarios`);
  if (sameRec.length === 0) md.push(`- (none — every scenario got a unique pick)`);
  sameRec.sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([rec, n]) =>
    md.push(`- "${rec}" used in ${n} scenarios`)
  );
  md.push(``);
  md.push(`## Scenarios with weak/missing explanation (first 25)`);
  noExplanation.slice(0, 25).forEach((r) =>
    md.push(`- ${r.scenarioId}: ${[r.inputs?.useCase, r.inputs?.priority].filter(Boolean).join(" / ")} → "${r.recommendedTool || ""}"`)
  );
  md.push(``);
  md.push(`## Scenarios with no pricing context (first 25)`);
  noPricing.slice(0, 25).forEach((r) =>
    md.push(`- ${r.scenarioId}: → "${r.recommendedTool || ""}"`)
  );
  md.push(``);
  md.push(`## Scenarios with no alternatives shown (first 25)`);
  noAlternatives.slice(0, 25).forEach((r) =>
    md.push(`- ${r.scenarioId}: → "${r.recommendedTool || ""}"`)
  );
  md.push(``);
  md.push(`## Generic-sounding outputs (first 25)`);
  generic.slice(0, 25).forEach((r) =>
    md.push(`- ${r.scenarioId}: "${(r.resultText || "").slice(0, 140)}"`)
  );
  md.push(``);
  md.push(`## Failures (first 25)`);
  failed.slice(0, 25).forEach((r) =>
    md.push(`- ${r.scenarioId} (${r.surface}): ${r.error || "unknown error"}`)
  );
  md.push(``);
  md.push(`## Trust-risk summary`);
  const risks = [];
  if (sameRec.some(([, n]) => n >= 5)) {
    const worst = sameRec.sort((a, b) => b[1] - a[1])[0];
    risks.push(`Recommendation "${worst[0]}" was returned in ${worst[1]} different scenarios — high risk of "everything points to one tool" perception.`);
  }
  if (noExplanation.length / Math.max(1, ok.length) > 0.25) {
    risks.push(`${noExplanation.length} of ${ok.length} successful scenarios returned little or no explanation — credibility risk.`);
  }
  if (noPricing.length / Math.max(1, ok.length) > 0.25) {
    risks.push(`${noPricing.length} of ${ok.length} successful scenarios had no pricing context shown — trust + clarity gap.`);
  }
  if (noAlternatives.length / Math.max(1, ok.length) > 0.5) {
    risks.push(`${noAlternatives.length} of ${ok.length} scenarios showed no alternatives — looks one-sided / promotional.`);
  }
  if (failed.length > results.length * 0.1) {
    risks.push(`${failed.length} of ${results.length} scenarios failed — flow stability risk.`);
  }
  if (!risks.length) risks.push(`No major trust risks detected at this run size. Re-run after content/data changes.`);
  risks.forEach((r) => md.push(`- ${r}`));
  md.push(``);

  writeFileSync(join(OUT_BASE, "summary.md"), md.join("\n"), "utf8");

  console.log(`\nDone.`);
  console.log(`  scenarios: ${results.length} (ok=${ok.length}, fail=${failed.length})`);
  console.log(`  output:    ${OUT_BASE}`);
})().catch((err) => {
  console.error("Decision-engine audit fatal error:", err);
  process.exit(1);
});

// ────────────────────────────────────────────────────────────────────
// Calculator helpers
// ────────────────────────────────────────────────────────────────────

async function discoverCalcInputs(page) {
  return page.evaluate(() => {
    function pickByLabel(re) {
      const labels = Array.from(document.querySelectorAll("label"));
      for (const l of labels) {
        const txt = (l.textContent || "").trim();
        if (re.test(txt)) {
          const id = l.getAttribute("for");
          if (id) {
            const el = document.getElementById(id);
            if (el) return cssPath(el);
          }
          const inside = l.querySelector("input, select, textarea");
          if (inside) return cssPath(inside);
        }
      }
      // fallback: any input with placeholder/name/aria-label match
      const candidates = Array.from(document.querySelectorAll("input, select, textarea"));
      for (const el of candidates) {
        const meta = [
          el.getAttribute("placeholder") || "",
          el.getAttribute("name") || "",
          el.getAttribute("aria-label") || "",
          el.getAttribute("id") || "",
        ].join(" ");
        if (re.test(meta)) return cssPath(el);
      }
      return null;
    }
    function cssPath(el) {
      if (!el) return null;
      if (el.id) return `#${CSS.escape(el.id)}`;
      const tag = el.tagName.toLowerCase();
      const cls = (el.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
      let sel = tag;
      if (cls.length) sel += "." + cls.map((c) => CSS.escape(c)).join(".");
      // add nth-of-type to disambiguate
      const parent = el.parentElement;
      if (parent) {
        const sibs = Array.from(parent.querySelectorAll(sel));
        const idx = sibs.indexOf(el);
        if (idx >= 0) sel += `:nth-of-type(${idx + 1})`;
      }
      return sel;
    }

    return {
      inputSelector: pickByLabel(/input.*tokens|prompt.*tokens|^input$/i)
        || pickByLabel(/tokens?/i),
      outputSelector: pickByLabel(/output.*tokens|completion.*tokens|^output$/i),
      modelSelector: pickByLabel(/model/i),
    };
  });
}

async function runCalcScenario({ page, id, preset, inputs, base, screenshotsDir, timeoutMs }) {
  const result = {
    scenarioId: id,
    surface: "calculator",
    inputs: {
      inputTokens: preset.inputTokens,
      outputTokens: preset.outputTokens,
      preset: preset.label,
    },
    ok: false,
    recommendedTool: "",
    alternatives: [],
    pricingText: "",
    confidenceText: "",
    freshnessText: "",
    explanation: "",
    resultText: "",
    screenshot: "",
    error: "",
  };

  try {
    await page.goto(`${base}/calculator`, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    try { await page.waitForLoadState("networkidle", { timeout: timeoutMs }); } catch {}

    if (inputs.inputSelector) {
      try {
        const el = await page.$(inputs.inputSelector);
        if (el) { await el.fill(""); await el.fill(String(preset.inputTokens)); }
      } catch (err) { result.error = `inputFillError: ${err?.message || err}`; }
    }
    if (inputs.outputSelector) {
      try {
        const el = await page.$(inputs.outputSelector);
        if (el) { await el.fill(""); await el.fill(String(preset.outputTokens)); }
      } catch (err) { result.error = (result.error || "") + ` outputFillError: ${err?.message || err}`; }
    }
    // Click any "calculate" / "compute" / "estimate" button if present
    await clickFirstByText(page, /calcul|compute|estimate|run|update/i);
    try { await page.waitForLoadState("networkidle", { timeout: 5000 }); } catch {}
    await page.waitForTimeout(400);

    const harvested = await harvestResultBlock(page);
    Object.assign(result, harvested);
    result.ok = !!(harvested.resultText || harvested.recommendedTool);

    if (SHOTS) {
      const shotPath = join(screenshotsDir, `${id}.png`);
      try { await page.screenshot({ path: shotPath, fullPage: true }); result.screenshot = shotPath; }
      catch (e) { result.screenshotError = String(e?.message || e); }
    }
  } catch (err) {
    result.ok = false;
    result.error = String(err?.message || err);
    if (SHOTS) {
      try {
        const shotPath = join(screenshotsDir, `${id}-FAIL.png`);
        await page.screenshot({ path: shotPath, fullPage: true });
        result.screenshot = shotPath;
      } catch {}
    }
  }
  return result;
}

// ────────────────────────────────────────────────────────────────────
// Decision Engine helpers (form-driven)
// ────────────────────────────────────────────────────────────────────

async function runDecisionScenario({ page, scenario, base, screenshotsDir, timeoutMs }) {
  const result = {
    scenarioId: scenario.id,
    surface: "decision-engine",
    inputs: { ...scenario },
    ok: false,
    recommendedTool: "",
    alternatives: [],
    pricingText: "",
    confidenceText: "",
    freshnessText: "",
    explanation: "",
    resultText: "",
    screenshot: "",
    error: "",
  };

  try {
    await page.goto(`${base}/decision-engine`, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    try { await page.waitForLoadState("networkidle", { timeout: timeoutMs }); } catch {}

    // Drive any visible select / radio / button group by trying to match
    // each scenario value against visible option labels.
    await tryPickOption(page, scenario.useCase);
    await tryPickOption(page, scenario.budget);
    await tryPickOption(page, scenario.priority);
    await tryPickOption(page, scenario.volume);
    await tryPickOption(page, scenario.team);
    await clickFirstByText(page, /recommend|find|show.*pick|get.*pick|submit|see.*result|continue|next/i);
    try { await page.waitForLoadState("networkidle", { timeout: 4000 }); } catch {}
    await page.waitForTimeout(500);

    const harvested = await harvestResultBlock(page);
    Object.assign(result, harvested);
    result.ok = !!(harvested.resultText || harvested.recommendedTool);

    if (SHOTS) {
      const shotPath = join(screenshotsDir, `${scenario.id}.png`);
      try { await page.screenshot({ path: shotPath, fullPage: true }); result.screenshot = shotPath; }
      catch (e) { result.screenshotError = String(e?.message || e); }
    }
  } catch (err) {
    result.ok = false;
    result.error = String(err?.message || err);
    if (SHOTS) {
      try {
        const shotPath = join(screenshotsDir, `${scenario.id}-FAIL.png`);
        await page.screenshot({ path: shotPath, fullPage: true });
        result.screenshot = shotPath;
      } catch {}
    }
    // Capture small DOM snippet on failure to aid debugging
    try {
      const html = await page.content();
      result.domNote = html.slice(0, 2000);
    } catch {}
  }
  return result;
}

/**
 * Click the first visible button/anchor whose text matches re.
 */
async function clickFirstByText(page, re) {
  return page.evaluate((reSrc) => {
    const re = new RegExp(reSrc, "i");
    const els = Array.from(document.querySelectorAll('button, a[href], [role="button"], input[type="submit"]'));
    for (const el of els) {
      const t = (el.innerText || el.textContent || el.value || "").trim();
      if (!t) continue;
      if (!re.test(t)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      el.scrollIntoView({ block: "center", behavior: "instant" });
      el.click();
      return t;
    }
    return null;
  }, re.source).catch(() => null);
}

/**
 * Try to click a visible option (button/radio/option) whose label matches the
 * supplied value. Tolerant: failures are silent.
 */
async function tryPickOption(page, value) {
  if (!value) return;
  return page.evaluate((val) => {
    const norm = (s) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
    const target = norm(val);
    if (!target) return false;

    // Buttons / role=button / pill chips (Tailwind)
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], [role="option"], a[href]'));
    for (const el of buttons) {
      const t = norm(el.innerText || el.textContent);
      if (!t) continue;
      if (t === target || t.includes(target) || target.includes(t)) {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        el.scrollIntoView({ block: "center", behavior: "instant" });
        el.click();
        return true;
      }
    }
    // Radio inputs by label
    const labels = Array.from(document.querySelectorAll("label"));
    for (const l of labels) {
      const t = norm(l.textContent);
      if (!t) continue;
      if (t === target || t.includes(target) || target.includes(t)) {
        l.click();
        return true;
      }
    }
    // Native select options
    const selects = Array.from(document.querySelectorAll("select"));
    for (const s of selects) {
      for (const opt of Array.from(s.options)) {
        const t = norm(opt.textContent);
        if (t === target || t.includes(target) || target.includes(t)) {
          s.value = opt.value;
          s.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        }
      }
    }
    return false;
  }, value).catch(() => false);
}

/**
 * Best-effort harvesting of a "result" or "recommendation" block on the page.
 * Looks for landmark sections, text patterns, then falls back to scanning the
 * largest visible block under the fold.
 */
async function harvestResultBlock(page) {
  return page.evaluate(() => {
    const RECO_RE = /\b(recommended|winner|best\s+(choice|pick|value)|our\s+pick|top\s+pick|verdict|result)\b/i;
    const PRICE_RE = /(\$\s?\d|\b\d+(\.\d+)?\s*(per\s+(month|user|token)|\/(mo|month|yr|year))|tokens?|credits?|pricing|cost)/i;
    const CONF_RE = /\bconfiden|certain|likely|probability\b/i;
    const FRESH_RE = /\bupdated|as of|refreshed|last\s+(checked|update|refreshed)\b/i;

    function txt(el) { return (el?.innerText || el?.textContent || "").trim(); }

    let block = null;
    // Prefer explicit landmarks
    const landmarks = document.querySelectorAll(
      '[data-result], [data-recommendation], [data-testid*="result" i], [data-testid*="recommend" i], section, article, aside, div'
    );
    let bestScore = 0;
    landmarks.forEach((el) => {
      const t = txt(el);
      if (!t || t.length < 60) return;
      let score = 0;
      if (RECO_RE.test(t)) score += 5;
      if (PRICE_RE.test(t)) score += 2;
      if (CONF_RE.test(t)) score += 1;
      if (FRESH_RE.test(t)) score += 1;
      score += Math.min(3, Math.floor(t.length / 500));
      if (score > bestScore) { bestScore = score; block = el; }
    });

    const resultText = block ? txt(block) : "";
    // Pull a likely "recommended tool" name: heading / strong inside block
    let recommendedTool = "";
    if (block) {
      const heading = block.querySelector("h1, h2, h3, strong, [data-recommended-name]");
      if (heading) recommendedTool = txt(heading).slice(0, 120);
    }
    if (!recommendedTool && resultText) {
      const m = resultText.match(/(?:recommended|winner|our pick|top pick|best choice)[:\-\u2014\s]+([A-Z][\w\.\-]+(?:\s+[A-Z0-9][\w\.\-]+){0,5})/);
      if (m) recommendedTool = m[1].trim();
    }
    // Alternatives: list items inside the block
    const altList = block ? Array.from(block.querySelectorAll("li, [data-alternative]")).slice(0, 8).map(txt).filter(Boolean) : [];

    const pricingMatch = (resultText || "").match(PRICE_RE);
    const confMatch = (resultText || "").match(/[^.]*\bconfiden[^.]*\./i);
    const freshMatch = (resultText || "").match(/[^.]*\b(updated|as of|refreshed|last\s+(checked|update|refreshed))[^.]*\./i);

    // Pull a short explanation: first sentence after the recommended-tool line
    let explanation = "";
    if (resultText) {
      const sentences = resultText.split(/(?<=[\.\!\?])\s+/).filter((s) => s.length > 30);
      explanation = sentences.slice(0, 2).join(" ").slice(0, 600);
    }

    return {
      resultText: resultText.slice(0, 4000),
      recommendedTool,
      alternatives: altList,
      pricingText: pricingMatch ? pricingMatch[0] : "",
      confidenceText: confMatch ? confMatch[0].trim() : "",
      freshnessText: freshMatch ? freshMatch[0].trim() : "",
      explanation,
    };
  }).then((r) => ({
    resultText: cleanText(r.resultText),
    recommendedTool: cleanText(r.recommendedTool),
    alternatives: (r.alternatives || []).map(cleanText),
    pricingText: cleanText(r.pricingText),
    confidenceText: cleanText(r.confidenceText),
    freshnessText: cleanText(r.freshnessText),
    explanation: cleanText(r.explanation),
  })).catch(() => ({
    resultText: "", recommendedTool: "", alternatives: [],
    pricingText: "", confidenceText: "", freshnessText: "", explanation: "",
  }));
}
