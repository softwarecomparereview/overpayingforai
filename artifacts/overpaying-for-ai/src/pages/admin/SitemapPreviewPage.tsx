import { useState } from "react";
import { LEAN_SITEMAP_ROUTES, CANONICAL_SITE_URL } from "@/seo/leanSitemap";

function generateXmlPreview(): string {
  const today = new Date().toISOString().split("T")[0];
  const urls = LEAN_SITEMAP_ROUTES.map(({ path, priority = "0.7", changefreq = "weekly" }) => {
    const loc = `${CANONICAL_SITE_URL}${path}`;
    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}

export function SitemapPreviewPage() {
  const [copied, setCopied] = useState(false);
  const xml = generateXmlPreview();

  const handleCopy = () => {
    navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
            Admin / Dev Tool
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">Lean Sitemap Preview</h1>
          <p className="text-sm text-white/50">
            Active lean route set — {LEAN_SITEMAP_ROUTES.length} URLs.
            Not linked publicly. This is for validation only.
          </p>
        </div>

        {/* Routes Table */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-3">
            Active Routes ({LEAN_SITEMAP_ROUTES.length})
          </h2>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 font-medium text-white/60">#</th>
                  <th className="text-left px-4 py-3 font-medium text-white/60">Path</th>
                  <th className="text-left px-4 py-3 font-medium text-white/60">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-white/60">Changefreq</th>
                  <th className="text-left px-4 py-3 font-medium text-white/60">Full URL</th>
                </tr>
              </thead>
              <tbody>
                {LEAN_SITEMAP_ROUTES.map((entry, i) => (
                  <tr key={entry.path} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-2.5 text-white/30 tabular-nums">{i + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-400 text-xs">{entry.path}</td>
                    <td className="px-4 py-2.5 text-white/60">{entry.priority ?? "0.7"}</td>
                    <td className="px-4 py-2.5 text-white/60">{entry.changefreq ?? "weekly"}</td>
                    <td className="px-4 py-2.5">
                      <a
                        href={`${CANONICAL_SITE_URL}${entry.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white/30 hover:text-white/70 transition-colors truncate block max-w-xs"
                      >
                        {CANONICAL_SITE_URL}{entry.path}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Validation Checks */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-3">
            Validation
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                label: "All paths start with /",
                pass: LEAN_SITEMAP_ROUTES.every((r) => r.path.startsWith("/")),
              },
              {
                label: "No duplicate paths",
                pass: new Set(LEAN_SITEMAP_ROUTES.map((r) => r.path)).size === LEAN_SITEMAP_ROUTES.length,
              },
              {
                label: "No www. in paths",
                pass: LEAN_SITEMAP_ROUTES.every((r) => !r.path.includes("www.")),
              },
              {
                label: "No full URLs in paths",
                pass: LEAN_SITEMAP_ROUTES.every((r) => !r.path.startsWith("http")),
              },
              {
                label: "Canonical domain is no-www",
                pass: !CANONICAL_SITE_URL.includes("www."),
              },
              {
                label: "Canonical domain is HTTPS",
                pass: CANONICAL_SITE_URL.startsWith("https://"),
              },
            ].map((check) => (
              <div
                key={check.label}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
                  check.pass
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}
              >
                <span className="text-lg shrink-0">{check.pass ? "✓" : "✗"}</span>
                <span>{check.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Generated XML */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
              Generated XML
            </h2>
            <button
              onClick={handleCopy}
              className="text-xs border border-white/20 text-white/60 hover:text-white hover:border-white/40 px-3 py-1.5 rounded transition-colors"
            >
              {copied ? "Copied!" : "Copy XML"}
            </button>
          </div>
          <textarea
            readOnly
            value={xml}
            className="w-full h-96 bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-white/70 resize-none focus:outline-none focus:border-white/20"
          />
        </section>
      </div>
    </div>
  );
}
