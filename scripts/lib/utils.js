// scripts/lib/utils.js
// Shared utilities: URL normalization, slugifying, CSV writing, text cleanup,
// duplicate detection. Pure JS, no Playwright deps.

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "gclid", "fbclid", "mc_cid", "mc_eid", "ref", "ref_src", "_hsmi", "_hsenc",
]);

/**
 * Normalize a URL so the same logical page produces one cache key.
 * - Removes hash
 * - Strips known tracking params
 * - Lowercases host
 * - Collapses trailing slash (except root)
 */
export function normalizeUrl(input, base) {
  try {
    const u = new URL(input, base);
    u.hash = "";
    // strip tracking params
    const keep = [];
    for (const [k, v] of u.searchParams) {
      if (!TRACKING_PARAMS.has(k.toLowerCase())) keep.push([k, v]);
    }
    u.search = "";
    keep.sort(([a], [b]) => a.localeCompare(b));
    for (const [k, v] of keep) u.searchParams.append(k, v);
    u.hostname = u.hostname.toLowerCase();
    // remove default ports
    if ((u.protocol === "http:" && u.port === "80") ||
        (u.protocol === "https:" && u.port === "443")) {
      u.port = "";
    }
    // collapse trailing slash except root
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.replace(/\/+$/, "");
    }
    return u.toString();
  } catch {
    return null;
  }
}

export function sameDomain(url, rootHost) {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return h === rootHost || h.endsWith("." + rootHost);
  } catch {
    return false;
  }
}

/**
 * Slugify a URL or arbitrary string into a filesystem-safe slug.
 * If a uniqueness map is provided, a numeric suffix is appended on collision.
 */
export function slugifyUrl(url, seen = new Map()) {
  let base;
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/+|\/+$/g, "");
    base = (u.hostname + (path ? "_" + path : "_root"))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);
  } catch {
    base = String(url).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 120);
  }
  if (!base) base = "page";
  let slug = base;
  if (seen.has(slug)) {
    const n = (seen.get(slug) || 0) + 1;
    seen.set(slug, n);
    slug = `${base}-${n}`;
  }
  seen.set(slug, seen.get(slug) || 1);
  return slug;
}

export function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

export function writeJson(path, data) {
  ensureDir(dirname(path));
  writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Minimal CSV writer that handles strings, numbers, booleans, null, arrays,
 * and objects (objects/arrays are JSON-stringified).
 */
export function writeCsv(path, rows, headers) {
  ensureDir(dirname(path));
  const cols = headers || Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r || {}).forEach((k) => acc.add(k));
      return acc;
    }, new Set())
  );
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    let s;
    if (Array.isArray(v) || (typeof v === "object")) s = JSON.stringify(v);
    else s = String(v);
    if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [cols.join(",")];
  for (const r of rows) lines.push(cols.map((c) => escape(r ? r[c] : "")).join(","));
  writeFileSync(path, lines.join("\n"), "utf8");
}

export function cleanText(s) {
  if (!s) return "";
  return String(s).replace(/\s+/g, " ").trim();
}

/** Detect tracking/asset/junk hrefs we never want to crawl. */
export function isCrawlableHref(href) {
  if (!href) return false;
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("#")) return false;
  if (/^(mailto:|tel:|javascript:|data:|sms:|whatsapp:)/i.test(trimmed)) return false;
  // skip obvious file assets
  if (/\.(png|jpe?g|gif|svg|webp|ico|pdf|zip|gz|mp3|mp4|mov|avi|css|js|json|xml|webmanifest|woff2?|ttf|otf|eot)(\?|#|$)/i.test(trimmed)) {
    return false;
  }
  return true;
}

/** Build a simple {value -> [keys...]} duplicate map. */
export function findDuplicates(items, keyFn, valueFn) {
  const map = new Map();
  for (const item of items) {
    const v = valueFn(item);
    if (!v) continue;
    const key = String(v).trim().toLowerCase();
    if (!key) continue;
    const arr = map.get(key) || [];
    arr.push(keyFn(item));
    map.set(key, arr);
  }
  const dupes = {};
  for (const [v, arr] of map) {
    if (arr.length > 1) dupes[v] = arr;
  }
  return dupes;
}

export function parseArgs(argv) {
  const out = {};
  for (const a of argv.slice(2)) {
    if (!a.startsWith("--")) continue;
    const [k, ...rest] = a.slice(2).split("=");
    const v = rest.length ? rest.join("=") : "true";
    out[k] = v;
  }
  return out;
}

export function asBool(v, def = false) {
  if (v === undefined || v === null) return def;
  const s = String(v).toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "on";
}

export function asInt(v, def) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}

export function nowIso() {
  return new Date().toISOString();
}
