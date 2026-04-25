import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/runner/workspace/qa/node_modules/playwright");
import fs from "fs";

const BASE_URL = "http://localhost:80";
const CHROMIUM_PATH = "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium";
const OUT_DIR = "out/audits/latest";
const DESKTOP_DIR = `${OUT_DIR}/screenshots/desktop`;
const MOBILE_DIR = `${OUT_DIR}/screenshots/mobile`;
const BATCH = 20; // restart browser every N routes (same pattern as qa/full-audit.mjs)

const URLS = [
  "/", "/calculator", "/best", "/compare",
  "/compare/chatgpt-vs-claude", "/compare/chatgpt-vs-gemini", "/compare/claude-vs-gemini",
  "/compare/claude-vs-gpt-cost", "/compare/gpt-4o-vs-gpt-4o-mini-cost", "/compare/deepseek-vs-gpt4o-cost",
  "/pricing/chatgpt-pricing", "/pricing/claude-pricing", "/pricing/gemini-pricing",
  "/worth-it/is-chatgpt-plus-worth-it", "/alternatives/best-chatgpt-alternatives",
  "/ai-types", "/ai-types/coding-ai", "/ai-types/writing-ai",
  "/guides", "/guides/how-to-reduce-ai-cost", "/guides/token-cost-explained",
  "/decision-engine", "/models", "/resources",
  "/contact", "/about", "/affiliate-disclosure", "/privacy-policy", "/terms", "/media-kit", "/changelog",
];

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

function slug(url) {
  return url === "/" ? "home" : url.replace(/\//g, "_").replace(/^_/, "");
}

async function runPass(label, viewport, screenshotDir) {
  const results = [];
  let i = 0;
  while (i < URLS.length) {
    const batch = URLS.slice(i, i + BATCH);
    const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, args: ["--no-sandbox"] });
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();

    for (const url of batch) {
      const result = {
        url, viewport: `${viewport.width}x${viewport.height}`,
        pass: true, issues: [], h1: null, title: null,
        hasFooter: false, hasContactInNav: false, horizontalOverflow: false, consoleErrors: [],
      };
      const jsErrors = [];
      const onConsole = (msg) => { if (msg.type() === "error") jsErrors.push(msg.text()); };
      page.on("console", onConsole);

      try {
        const res = await page.goto(`${BASE_URL}${url}`, { waitUntil: "domcontentloaded", timeout: 12000 });
        await page.waitForTimeout(350);

        if (res?.status() >= 400) { result.pass = false; result.issues.push(`HTTP ${res.status()}`); }

        result.h1 = await page.$eval("h1", el => el.textContent.trim()).catch(() => null);
        if (!result.h1) { result.issues.push("Missing H1"); result.pass = false; }

        result.title = await page.title();
        if (!result.title?.trim()) { result.issues.push("Missing title"); result.pass = false; }

        result.hasFooter = !!(await page.$("footer"));
        if (!result.hasFooter) { result.issues.push("No footer"); result.pass = false; }

        result.hasContactInNav = await page.$$eval(
          "header a",
          links => links.some(a => a.getAttribute("href")?.includes("/contact"))
        ).catch(() => false);
        if (!result.hasContactInNav) result.issues.push("Contact not in nav");

        if (viewport.width <= 430) {
          const bw = await page.evaluate(() => document.body.scrollWidth);
          if (bw > viewport.width + 5) {
            result.horizontalOverflow = true;
            result.issues.push(`Overflow: body ${bw}px > ${viewport.width}px`);
            result.pass = false;
          }
        }

        const bodyLen = await page.evaluate(() => document.body.innerText.trim().length);
        if (bodyLen < 50) { result.pass = false; result.issues.push("Blank/empty page"); }

        result.consoleErrors = jsErrors.slice(0, 3);

        await page.screenshot({ path: `${screenshotDir}/${slug(url)}.jpg`, type: "jpeg", quality: 72, fullPage: false });
      } catch (e) {
        result.pass = false;
        result.issues.push(e.message?.slice(0, 80));
      }

      page.removeListener("console", onConsole);
      process.stdout.write(`  [${label}] ${url.padEnd(48)} ${result.pass ? "PASS" : "FAIL — " + result.issues.join(", ")}\n`);
      results.push(result);
    }

    await browser.close();
    i += BATCH;
  }
  return results;
}

async function testScrollToTop() {
  let scrollWorking = true, detail = "";
  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, args: ["--no-sandbox"] });
  try {
    const ctx = await browser.newContext({ viewport: DESKTOP_VIEWPORT });
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/about`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(200);
    await page.click("footer a[href='/privacy-policy']");
    await page.waitForTimeout(700);
    const scrollY = await page.evaluate(() => window.scrollY);
    scrollWorking = scrollY <= 50;
    detail = `scrollY after footer nav = ${scrollY}px (expected ≤ 50)`;
    await ctx.close();
  } catch (e) {
    scrollWorking = false;
    detail = e.message?.slice(0, 100);
  }
  await browser.close();
  return { scrollWorking, detail };
}

async function run() {
  console.log("Starting Playwright site audit...\n");

  console.log("Scroll-to-top test...");
  const scrollResult = await testScrollToTop();
  console.log(`  ${scrollResult.scrollWorking ? "PASS" : "FAIL"} — ${scrollResult.detail}\n`);

  console.log(`Desktop (${URLS.length} pages, 1440×900):`);
  const dr = await runPass("desktop", DESKTOP_VIEWPORT, DESKTOP_DIR);

  console.log(`\nMobile  (${URLS.length} pages, 390×844):`);
  const mr = await runPass("mobile", MOBILE_VIEWPORT, MOBILE_DIR);

  const dPass = dr.filter(r => r.pass).length;
  const mPass = mr.filter(r => r.pass).length;
  const allResults = [...dr, ...mr];
  const allIssues = allResults.flatMap(r => r.issues.map(i => ({ url: r.url, viewport: r.viewport, issue: i })));
  const freq = {};
  allIssues.forEach(({ issue }) => { freq[issue] = (freq[issue] || 0) + 1; });
  const topIssues = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const overflowPages = mr.filter(r => r.horizontalOverflow).map(r => r.url);
  const missingH1 = allResults.filter(r => !r.h1).map(r => `${r.viewport}:${r.url}`);
  const noContact = dr.filter(r => !r.hasContactInNav).map(r => r.url);
  const consoleErrPages = allResults.filter(r => r.consoleErrors.length > 0).map(r => `${r.viewport}:${r.url}`);
  const failedRoutes = dr.filter(r => !r.pass);

  const json = {
    runAt: new Date().toISOString(),
    totalPages: URLS.length,
    desktop: { pass: dPass, fail: dr.length - dPass, results: dr },
    mobile: { pass: mPass, fail: mr.length - mPass, results: mr },
    scrollToTop: scrollResult,
    allIssues,
  };
  fs.writeFileSync(`${OUT_DIR}/audit-results.json`, JSON.stringify(json, null, 2));

  const today = new Date().toISOString().slice(0, 10);
  const md = `# Site Audit Summary
**Date:** ${today}  
**Base URL:** ${BASE_URL}  
**Total pages tested:** ${URLS.length}  
**Viewports:** Desktop 1440×900 · Mobile 390×844

---

## Results Overview

| | Pass | Fail | Total |
|---|---|---|---|
| Desktop | ${dPass} | ${dr.length - dPass} | ${dr.length} |
| Mobile | ${mPass} | ${mr.length - mPass} | ${mr.length} |

---

## Scroll-to-Top (Task 4)

- **Result:** ${scrollResult.scrollWorking ? "PASS ✓" : "FAIL ✗"}
- **Detail:** ${scrollResult.detail}

---

## Header Nav — Contact Link

- Pages missing Contact in desktop nav: ${noContact.length === 0 ? "None ✓" : noContact.join(", ")}

---

## Footer Visibility

- Footer present on all desktop pages: ${dr.every(r => r.hasFooter) ? "YES ✓" : dr.filter(r => !r.hasFooter).map(r => r.url).join(", ")}

---

## Mobile Horizontal Overflow

- Pages with horizontal overflow: ${overflowPages.length === 0 ? "None ✓" : overflowPages.join(", ")}

---

## Missing H1

- ${missingH1.length === 0 ? "All pages have H1 ✓" : missingH1.join(", ")}

---

## Console Errors

- Pages with JS console errors: ${consoleErrPages.length === 0 ? "None ✓" : consoleErrPages.join(", ")}

---

## Failed Routes (Desktop)

${failedRoutes.length === 0 ? "No broken routes — all pages return valid content. ✓" : failedRoutes.map(r => `- **${r.url}** — ${r.issues.join(", ")}`).join("\n")}

---

## Top Issues by Frequency

${topIssues.length === 0 ? "No issues detected." : topIssues.map(([issue, count], i) => `${i + 1}. **${issue}** (${count}×)`).join("\n")}

---

## Files Changed (Tasks 1–5)

| Task | File | Change |
|------|------|--------|
| 1 | \`src/pages/PrivacyPolicy.tsx\` | New page — /privacy-policy with 8 sections |
| 1 | \`src/App.tsx\` | Import + route added for PrivacyPolicy |
| 2 | \`src/components/Layout.tsx\` | Footer order: Contact · About · Media Kit · Affiliate Disclosure · Privacy Policy · Terms |
| 3 | \`src/components/Layout.tsx\` | navLinks: Contact added (desktop + mobile hamburger) |
| 4 | \`src/App.tsx\` | ScrollToTop component — resets window scroll on every route change |
| 5 | \`public/sitemap.xml\` | /privacy-policy entry added (monthly, 0.4 priority) |

---

## Screenshots

- Desktop: \`${DESKTOP_DIR}/\` (${dr.length} JPGs)
- Mobile: \`${MOBILE_DIR}/\` (${mr.length} JPGs)
`;

  fs.writeFileSync(`${OUT_DIR}/audit-summary.md`, md);

  console.log(`\nAudit complete.`);
  console.log(`  Desktop : ${dPass}/${dr.length} pass`);
  console.log(`  Mobile  : ${mPass}/${mr.length} pass`);
  console.log(`  Scroll-to-top: ${scrollResult.scrollWorking ? "PASS" : "FAIL"}`);
  if (topIssues.length) {
    console.log("\n  Top issues:");
    topIssues.slice(0, 5).forEach(([issue, count]) => console.log(`    - ${issue} (${count}×)`));
  }
  console.log(`\n  Output: ${OUT_DIR}/`);
}

run().catch(e => { console.error(e); process.exit(1); });
