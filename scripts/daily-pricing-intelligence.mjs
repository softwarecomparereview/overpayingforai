/**
 * daily-pricing-intelligence.mjs
 *
 * Fetches each trusted source URL, extracts visible text, sends it to OpenAI
 * for classification/summarisation, and writes two output files:
 *
 *   artifacts/overpaying-for-ai/src/data/ai-pricing-news.json   — daily digest (overwritten)
 *   artifacts/overpaying-for-ai/src/data/pricing-history.json   — append-only history
 *
 * Guardrails:
 *   - Never treats OpenAI output as source of truth — it classifies only
 *   - Always rejects items with no source URL
 *   - Never overwrites pricing-history.json — append only
 *   - Deduplicates by vendor+tool+changeType+sourceUrl+detectedDate
 *   - Fails gracefully if OPENAI_API_KEY is missing
 */

import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const SOURCES_PATH = path.join(REPO_ROOT, "data", "trusted-pricing-sources.json");
const NEWS_PATH = path.join(REPO_ROOT, "artifacts", "overpaying-for-ai", "src", "data", "ai-pricing-news.json");
const HISTORY_PATH = path.join(REPO_ROOT, "artifacts", "overpaying-for-ai", "src", "data", "pricing-history.json");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TODAY = new Date().toISOString().slice(0, 10);
const NOW_ISO = new Date().toISOString();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg) {
  process.stdout.write(`[${new Date().toISOString()}] ${msg}\n`);
}

function err(msg) {
  process.stderr.write(`[ERROR] ${msg}\n`);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Fetch a URL and return the response body as text.
 * Uses Node's built-in https module — no dependencies.
 */
function fetchUrl(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: timeoutMs, headers: { "User-Agent": "OverpayingForAI-PricingBot/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, timeoutMs).then(resolve).catch(reject);
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      res.on("error", reject);
    });
    req.on("timeout", () => { req.destroy(); reject(new Error(`Timeout fetching ${url}`)); });
    req.on("error", reject);
  });
}

/**
 * Strip HTML tags and collapse whitespace to extract visible text.
 * Keeps enough context for OpenAI to identify pricing changes.
 * Truncates to 6000 chars to avoid large token counts.
 */
function extractText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}

/**
 * Call OpenAI Chat Completions API via raw HTTPS (no SDK required).
 */
function callOpenAI(systemPrompt, userContent) {
  const body = JSON.stringify({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode !== 200) {
          return reject(new Error(`OpenAI API error ${res.statusCode}: ${raw.slice(0, 300)}`));
        }
        try {
          const parsed = JSON.parse(raw);
          const content = parsed.choices?.[0]?.message?.content;
          resolve(JSON.parse(content));
        } catch (e) {
          reject(new Error(`Failed to parse OpenAI response: ${e.message}`));
        }
      });
      res.on("error", reject);
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── Classification system prompt ────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a pricing intelligence classifier for an AI cost-comparison site.

You will receive extracted text from a trusted source URL about AI tools/products.
Your job is to identify any pricing, plan, model, or feature changes mentioned.

Return STRICT JSON only — no markdown, no prose.

Schema:
{
  "items": [
    {
      "vendor": "string — e.g. OpenAI, Anthropic, Google",
      "tool": "string — specific product e.g. GPT-4o, Claude 3.5",
      "changeType": "pricing_change | plan_change | model_launch | free_tier_change | enterprise_change | general_news",
      "summary": "string — 1-3 sentence factual summary. Include numbers where mentioned.",
      "confidence": "high | medium | low",
      "requiresReview": true | false,
      "notes": "string — optional extra context or caveats"
    }
  ]
}

Classification rules:
- confidence=high only when the text is from an official vendor source AND mentions a clear, specific price or plan change with numbers
- confidence=medium when the source is official but the change is described ambiguously
- confidence=low for third-party sources or unclear signals
- requiresReview=false ONLY when confidence=high AND the source is marked as official in the prompt
- requiresReview=true for everything else
- If no relevant pricing/plan/model changes are found, return { "items": [] }
- Never invent numbers or claims not present in the source text
- Always base summaries strictly on the provided text`;

// ─── Deduplication ───────────────────────────────────────────────────────────

function makeDedupeKey(item) {
  return [
    (item.vendor || "").toLowerCase(),
    (item.tool || "").toLowerCase(),
    (item.changeType || ""),
    (item.sourceUrl || ""),
    (item.detectedDate || ""),
  ].join("|");
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  log("Daily pricing intelligence pipeline starting");

  if (!OPENAI_API_KEY) {
    err("OPENAI_API_KEY environment variable is not set. Cannot proceed.");
    err("Set OPENAI_API_KEY as a secret in GitHub Actions or your local environment.");
    process.exit(1);
  }

  // Load sources
  if (!fs.existsSync(SOURCES_PATH)) {
    err(`Trusted sources file not found: ${SOURCES_PATH}`);
    process.exit(1);
  }
  const sources = readJson(SOURCES_PATH);
  log(`Loaded ${sources.length} trusted source(s)`);

  // Load existing history for deduplication
  const existingHistory = readJson(HISTORY_PATH) ?? [];
  const existingKeys = new Set(existingHistory.map(makeDedupeKey));
  log(`Loaded ${existingHistory.length} existing history entries for deduplication`);

  const digestItems = [];
  const newHistoryEntries = [];
  const auditLog = [];

  for (const source of sources) {
    const { vendor, tool, url, trustLevel, allowedForAutoDraft } = source;
    log(`Fetching: ${vendor} / ${tool} — ${url}`);

    let rawHtml;
    try {
      rawHtml = await fetchUrl(url);
    } catch (fetchErr) {
      err(`Failed to fetch ${url}: ${fetchErr.message}`);
      auditLog.push({ url, status: "fetch_error", error: fetchErr.message });
      continue;
    }

    const visibleText = extractText(rawHtml);
    log(`  Extracted ${visibleText.length} chars of text`);

    const userContent = `Source URL: ${url}
Trust level: ${trustLevel}
Allowed for auto-draft: ${allowedForAutoDraft}
Vendor: ${vendor}
Tool: ${tool}

Extracted page text:
${visibleText}`;

    let classification;
    try {
      classification = await callOpenAI(SYSTEM_PROMPT, userContent);
    } catch (aiErr) {
      err(`OpenAI classification failed for ${url}: ${aiErr.message}`);
      auditLog.push({ url, status: "ai_error", error: aiErr.message });
      continue;
    }

    const items = classification?.items ?? [];
    log(`  Classified ${items.length} item(s)`);
    auditLog.push({ url, status: "ok", itemCount: items.length });

    for (const item of items) {
      // Reject items with no source URL (we add it)
      if (!url) continue;

      // Reject unsupported confidence values
      if (!["high", "medium", "low"].includes(item.confidence)) continue;

      // Override requiresReview: never false unless high-confidence official source
      const isOfficial = trustLevel === "official";
      const requiresReview = !(item.confidence === "high" && isOfficial && allowedForAutoDraft);

      const enriched = {
        vendor: item.vendor || vendor,
        tool: item.tool || tool,
        changeType: item.changeType || "general_news",
        summary: item.summary || "",
        confidence: item.confidence,
        requiresReview,
        sourceUrl: url,
        sourceTrustLevel: trustLevel,
        detectedDate: TODAY,
        notes: item.notes || "",
      };

      digestItems.push(enriched);

      // Append to history only if not a duplicate
      const key = makeDedupeKey(enriched);
      if (!existingKeys.has(key)) {
        newHistoryEntries.push(enriched);
        existingKeys.add(key);
      } else {
        log(`  Skipping duplicate: ${key}`);
      }
    }
  }

  // Write daily digest (overwrite)
  const digest = {
    lastChecked: TODAY,
    generatedAt: NOW_ISO,
    sourceCount: sources.length,
    auditLog,
    items: digestItems,
  };
  writeJson(NEWS_PATH, digest);
  log(`Wrote ${digestItems.length} item(s) to daily digest: ${NEWS_PATH}`);

  // Append to history (never overwrite)
  if (newHistoryEntries.length > 0) {
    const updatedHistory = [...existingHistory, ...newHistoryEntries];
    writeJson(HISTORY_PATH, updatedHistory);
    log(`Appended ${newHistoryEntries.length} new entry/entries to history: ${HISTORY_PATH}`);
  } else {
    log("No new history entries to append.");
  }

  log("Pipeline complete.");
  log(`Summary: ${digestItems.length} digest items, ${newHistoryEntries.length} new history entries`);
}

main().catch((e) => {
  err(`Unhandled error: ${e.message}`);
  process.exit(1);
});
