# Decision Log — OverpayingForAI

**Last updated:** 2026-05-03

---

| # | Date | Decision | Reason | Alternatives Considered | Impact | Status |
|---|------|----------|--------|------------------------|--------|--------|
| D001 | 2026-04 | Use Wouter instead of React Router | Lighter weight, no nested layout complexity needed for this SPA | React Router v6 | Minor — Wouter Link uses `href` prop, not `to` | Active |
| D002 | 2026-04 | Static JSON files for pricing/model data | No DB dependency for content; easy to update via pipeline; git-tracked | PostgreSQL tables | Data lives in `src/data/`; pipeline writes JSON directly | Active |
| D003 | 2026-04 | localStorage AdminGuard for admin pages | Solo maintainer; no auth server needed; fast iteration | Proper auth (Clerk, Replit Auth) | Any user with the key can access admin — acceptable for internal tooling | Active |
| D004 | 2026-04 | Append-only pricing history | Prevents data loss from pipeline reruns or bugs | Overwrite on each run | History file grows indefinitely; dedupe key prevents bloat | Active |
| D005 | 2026-05 | FreshnessIndicator thresholds: ≤3d live, ≤14d recent, >14d stale | Aligns with typical vendor pricing update cadence; 3 days is within normal pipeline run frequency | 7d/30d thresholds | All pricing pages now show freshness state; may need adjustment as cadence changes | Active |
| D006 | 2026-05 | Pipeline modes: full / dry_run / manual_no_update / reprocess | Gives maintainer safe inspection before live runs; aligns with GitHub Actions workflow_dispatch | Single mode only | More complex script but much safer operations | Active |
| D007 | 2026-05 | Remove onClose from SearchBox mousedown listener | Calling onClose (a React state setter) in a native DOM mousedown event handler flushes state before click fires on sibling elements, unmounting the menu and breaking mobile navigation | Keep onClose in mousedown, fix with stopPropagation | Mobile nav now works correctly; search dropdown still closes on outside tap | Active |
| D008 | 2026-05 | useEffect on location change to close mobile menu | Reliable fallback regardless of how navigation occurs; works with Wouter's pushState model | onClick={closeMenu} on each Link | Menu always closes after navigation; no race conditions | Active |
| D009 | 2026-05 | Project memory in /project-memory/ within repo | Persistent, git-tracked, always available to agent; no external dependency | External doc service | Memory survives context resets; always in sync with code | Active |
