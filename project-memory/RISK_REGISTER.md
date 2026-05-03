# Risk Register — OverpayingForAI

**Last updated:** 2026-05-03

---

| # | Risk | Impact | Likelihood | Mitigation | Owner | Status |
|---|------|--------|------------|------------|-------|--------|
| R001 | Static admin key leaked via browser devtools | High — admin panel exposed | Medium — key in localStorage, visible to anyone on the device | Use a strong, rotated key; consider proper auth for v2 | Maintainer | Active |
| R002 | OpenAI API costs spiral from frequent pipeline runs | Medium — unexpected bill | Low — pipeline is manual/scheduled only | Mode system (manual_no_update is free); review run log regularly; set GHA spending limits | Maintainer | Active |
| R003 | Pipeline fails silently — stale data not detected | Medium — outdated pricing shown to users | Medium — no alerting currently | FreshnessIndicator turns red after 14 days; run log in admin panel | Maintainer | Active |
| R004 | Pricing history grows indefinitely | Low — file size / build time impact | High — every run appends | Dedupe key prevents exact duplicates; monitor file size; add pruning if >1000 entries | Maintainer | Active |
| R005 | No unit tests — regressions caught manually only | High — silent breakage | Medium — active development | TypeScript + Vite build as compile-time safety net; Playwright audit catches route failures | Maintainer | Active |
| R006 | Homepage mobile overflow (404px > 390px) | Medium — poor mobile UX on homepage | High — confirmed in audit | Fix hero section width/overflow | Maintainer | Open |
| R007 | Bundle size >500kb — slow initial load on mobile | Medium — UX degradation | High — confirmed by Vite build warning | Code-split admin pages (dynamic import); deferred to planned tasks | Maintainer | Open |
| R008 | Fully CSR — no SSR/SSG — SEO may underperform | High — organic traffic dependency | Medium — depends on Google crawler JS capability | Accept for now; monitor search console; SSR is long-term roadmap | Maintainer | Accepted |
| R009 | OpenAI classification errors — wrong items published | High — incorrect pricing data on site | Low — guardrails: low-confidence always requires review, no auto-publish for high-impact changes | Review queue for all non-trivial items; ALERT_CANDIDATE route for price/plan changes | Maintainer | Active |
