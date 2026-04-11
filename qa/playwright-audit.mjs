import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("./node_modules/playwright");

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const BASE = "http://localhost:5173";

const ROUTES = [
  "/",
  "/ai-types",
  "/ai-types/llm-api",
  "/ai-types/coding-ai",
  "/ai-types/writing-ai",
  "/ai-types/chatbot",
  "/ai-types/image-ai",
  "/calculator",
  "/decision-engine",
  "/compare",
  "/compare/claude-vs-gpt-cost",
  "/compare/chatgpt-vs-claude",
  "/compare/claude-vs-gemini",
  "/compare/gpt4o-vs-claude3-opus",
  "/best",
  "/best/best-cheap-llm-api",
  "/best/best-ai-for-coding",
  "/best/best-ai-writing-tools",
  "/guides",
  "/guides/how-to-reduce-openai-api-costs",
  "/guides/token-optimization-guide",
  "/resources",
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const OUT_DIR = join(process.cwd(), "audit");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
const SS_DIR = join(OUT_DIR, "screenshots");
if (!existsSync(SS_DIR)) mkdirSync(SS_DIR, { recursive: true });

const CHROMIUM_PATH = process.env.CHROMIUM_PATH;

const issues = [];

async function auditPage(page, route, viewport) {
  const url = `${BASE}${route}`;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
  } catch {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
      await page.waitForTimeout(1500);
    } catch (e) {
      console.log(`  SKIP ${route} (${viewport.name}): ${e.message}`);
      return;
    }
  }

  // --- fake_affordance: div inside <a> with cursor-pointer ---
  const fakeAffordance = await page.$$eval(
    'a div[class*="cursor-pointer"], a div[style*="cursor: pointer"]',
    (els) => els.map((el) => ({
      tag: el.tagName,
      className: el.className.slice(0, 80),
      text: (el.innerText || "").slice(0, 60).trim(),
    }))
  );
  for (const el of fakeAffordance) {
    issues.push({ type: "fake_affordance", route, viewport: viewport.name, detail: el });
  }

  // --- missing_affiliate_link: picks with no anchor CTA ---
  const missingAff = await page.$$eval('[data-testid^="pick-"]', (els) =>
    els
      .filter((el) => !el.querySelector("a[href]"))
      .map((el) => ({
        testId: el.getAttribute("data-testid"),
        text: (el.innerText || "").slice(0, 80).trim(),
      }))
  );
  for (const el of missingAff) {
    issues.push({ type: "missing_affiliate_link", route, viewport: viewport.name, detail: el });
  }

  // Screenshot desktop only
  if (viewport.name === "desktop") {
    const fname = (route.replace(/\//g, "_").replace(/^_/, "") || "home") + ".jpg";
    try {
      await page.screenshot({ path: join(SS_DIR, fname), fullPage: false, type: "jpeg", quality: 70 });
    } catch (_) {}
  }
}

async function main() {
  const launchOptions = { args: ["--no-sandbox", "--disable-setuid-sandbox"] };
  if (CHROMIUM_PATH) launchOptions.executablePath = CHROMIUM_PATH;

  const browser = await chromium.launch(launchOptions);

  let done = 0;
  const total = ROUTES.length * VIEWPORTS.length;

  for (const route of ROUTES) {
    for (const viewport of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await ctx.newPage();
      await auditPage(page, route, viewport);
      await ctx.close();
      done++;
      process.stdout.write(`\r  ${done}/${total} done...`);
    }
  }

  await browser.close();
  console.log();

  const byType = {};
  for (const i of issues) {
    byType[i.type] = (byType[i.type] || 0) + 1;
  }

  const summary = {
    total: issues.length,
    byType,
    checkedRoutes: ROUTES.length,
    checkedAt: new Date().toISOString(),
  };

  writeFileSync(join(OUT_DIR, "report.json"), JSON.stringify(issues, null, 2));
  writeFileSync(join(OUT_DIR, "summary.json"), JSON.stringify(summary, null, 2));

  console.log("\n=== AUDIT COMPLETE ===");
  console.log(`Total issues: ${issues.length}`);
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`);
  }
  console.log(`\nFull report: audit/report.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
