/**
 * Returns the base URL for all admin API calls.
 *
 * Dev (Vite):   "/admin-api"  — Vite proxies this to localhost:8080
 * Production:   The value of VITE_API_SERVER_URL env var, e.g.
 *               "https://api-server-yourusername.replit.app"
 *
 * To configure for production, set VITE_API_SERVER_URL in your Cloudflare
 * Pages environment variables to your deployed Replit API server URL.
 */
export function getAdminApiBase(): string {
  const override = import.meta.env.VITE_API_SERVER_URL;
  if (override) return override.replace(/\/$/, "");
  return "/admin-api";
}
