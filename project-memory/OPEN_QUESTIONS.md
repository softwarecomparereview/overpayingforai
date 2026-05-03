# Open Questions — OverpayingForAI

**Last updated:** 2026-05-03

---

| # | Question | Context | Priority | Status |
|---|----------|---------|----------|--------|
| Q001 | What is causing the homepage hero mobile overflow (body 404px > 390px)? | Audit shows only homepage fails mobile overflow check. Likely a hero section element with fixed width or min-width. | High | Open |
| Q002 | Should the admin key be rotated or upgraded to proper auth? | Current key is static localStorage value. Fine for solo maintainer but increases in risk as more people access the admin panel. | Medium | Open |
| Q003 | Should `pricing-history.json` have a max entry limit? | File is append-only. Dedupe prevents exact duplicates but could still grow large over months. | Low | Open |
| Q004 | Should `manual_no_update` in the admin UI call a real API endpoint instead of simulating client-side? | Current implementation is a client-side simulation using existing digest data. Real mode requires OPENAI_API_KEY. | Medium | Open |
| Q005 | Should ALERT_CANDIDATE items trigger email/Slack notifications? | High-impact pricing changes (price cuts, plan removals) may need immediate attention. | Medium | Open |
| Q006 | Should the AI Pricing Tracker have an RSS feed? | Potential for SEO and user acquisition via RSS subscribers. | Low | Open |
| Q007 | How should conflicting signals from multiple sources be handled? | If two sources report different pricing for the same tool, the pipeline has no deduplication for cross-source conflicts — only exact key duplicates. | High | Open |
| Q008 | Should bundle splitting be done now or deferred? | Vite warns about >500kb bundle. Admin pages are the largest contributors. Dynamic imports would fix this. | Low | Open |
