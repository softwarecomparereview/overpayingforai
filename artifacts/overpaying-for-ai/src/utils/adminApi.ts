/**
 * Returns the base URL for all admin API calls.
 *
 * Dev (Vite):            "/admin-api"  — Vite proxies this to localhost:8080
 *                        and strips the prefix, so /admin-api/api/... → /api/...
 *
 * Production (Replit):   ""  — API server is on the same domain at /api,
 *                        so calls go directly to /api/admin/...
 *
 * Production (Cloudflare Pages):
 *                        VITE_API_SERVER_URL env var, e.g.
 *                        "https://overpaying-for-ai.yourname.replit.app"
 *                        Set this in Cloudflare Pages → Settings → Environment Variables.
 */
export function getAdminApiBase(): string {
  const override = import.meta.env.VITE_API_SERVER_URL;
  if (override) return override.replace(/\/$/, "");
  if (import.meta.env.DEV) return "/admin-api";
  return "";
}
