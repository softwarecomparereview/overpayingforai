# Roadmap — OverpayingForAI

**Last updated:** 2026-05-03

---

## Completed

| Item | Commit |
|------|--------|
| MVP: calculator, compare, pricing, alternatives, worth-it, best-of, guides, AI types, decision engine, models, resources | abe99f3 |
| AI Pricing Tracker + Pricing History pages | abe99f3 |
| Global FreshnessIndicator on all pricing pages | faae5f9 |
| Admin: pricing-intelligence-review + control pages | faae5f9 |
| Pipeline: freshnessTimestamp + run log | faae5f9 |
| Pipeline: 4 run modes (full/dry_run/manual_no_update/reprocess) | 979fbd8 |
| GitHub Actions workflow with mode dispatch input | 979fbd8 |
| Admin: manual-no-update result panel + ChatGPT export | 979fbd8 |
| Admin: "How autopilot works" collapsible explainer | 979fbd8 |
| Mobile hamburger nav fix (SearchBox mousedown race) | 9a0ba32 |
| Project memory system | current |

---

## Near-Term (Next 1–3 sessions)

| Priority | Item | Notes |
|----------|------|-------|
| P0 | Fix homepage hero mobile overflow | Body 404px > 390px at 390px viewport. Pre-existing. Isolated to hero. |
| P0 | Set `OPENAI_API_KEY` in GitHub Actions | Required for live pipeline runs |
| P1 | Dismiss/archive for review page | Makes review queue manageable |
| P1 | Run pipeline `manual_no_update` end-to-end | Validate real source classification |
| P2 | Code splitting | Bundle >500kb; split admin pages at minimum |
| P2 | Add "Audit" link to mobile nav | Currently desktop-only |

---

## Medium-Term

| Priority | Item | Notes |
|----------|------|-------|
| P1 | Pipeline `full` mode → commit data to repo | Automate end-to-end via GHA |
| P1 | Pricing page for more vendors (Mistral, xAI, Cohere) | Expand coverage |
| P2 | Unit tests | Testing currently disabled in Replit env |
| P2 | Admin session expiry | LocalStorage key has no TTL |
| P3 | Email digest for ALERT_CANDIDATE items | Notify maintainer of critical changes |
| P3 | RSS/API endpoint for pricing changes | Public data API |

---

## Long-Term / Aspirational

| Item | Notes |
|------|-------|
| Server-side rendering (SSR) | SEO improvement — currently fully CSR |
| User accounts | Save calculator results, set alerts |
| Pricing change alerts (email/webhook) | User-facing notifications |
| More languages | Currently EN + ZH |
| API pricing data as JSON endpoint | Programmatic access |
