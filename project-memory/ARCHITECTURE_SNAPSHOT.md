# Architecture Snapshot — OverpayingForAI

**Last updated:** 2026-05-03  
**Commit:** 9a0ba32

---

## Monorepo Structure

```
/
├── artifacts/
│   ├── overpaying-for-ai/          # Main web app (React+Vite, port 18972)
│   │   ├── src/
│   │   │   ├── pages/              # Route components
│   │   │   │   ├── admin/          # Admin pages (behind AdminGuard)
│   │   │   │   └── *.tsx           # Public pages
│   │   │   ├── components/         # Shared components
│   │   │   │   ├── admin/          # AdminGuard, AdminNav
│   │   │   │   ├── search/         # SearchBox
│   │   │   │   ├── seo/            # PageSeo, SeoContentBlock, InternalLinks
│   │   │   │   ├── monetization/   # CTAs, affiliate links
│   │   │   │   ├── ui/             # shadcn/ui primitives
│   │   │   │   ├── FreshnessIndicator.tsx
│   │   │   │   └── Layout.tsx      # Global layout with mobile nav
│   │   │   ├── data/               # Static JSON data files
│   │   │   │   ├── ai-pricing-news.json        # Daily digest
│   │   │   │   ├── pricing-history.json        # Append-only history
│   │   │   │   ├── pipeline-run-log.json       # Pipeline run log
│   │   │   │   ├── trusted-pricing-sources.json # Source registry (frontend copy)
│   │   │   │   └── ai-models.json              # Model registry
│   │   │   ├── utils/
│   │   │   │   ├── pricingFreshness.ts  # Freshness thresholds + status
│   │   │   │   ├── analytics.ts         # GA4 event helpers
│   │   │   │   ├── ga4.ts               # trackGaEvent, trackPageView
│   │   │   │   └── siteSearch.ts        # Client-side search index
│   │   │   └── App.tsx             # Route definitions (Wouter Switch)
│   │   └── vite.config.ts
│   ├── api-server/                 # Express API (port 8080)
│   └── mockup-sandbox/             # Design canvas previews
├── scripts/
│   └── daily-pricing-intelligence.mjs  # Pipeline (4 modes)
├── data/
│   └── trusted-pricing-sources.json    # Canonical source registry
├── out/
│   ├── audits/                     # Audit reports (markdown)
│   └── manual-autopilot-preview.json  # Written by manual_no_update mode
├── .github/
│   └── workflows/
│       └── pricing-intelligence.yml   # GHA: scheduled + manual dispatch
└── project-memory/                 # This memory system
```

---

## Routing (Wouter)

All routes defined in `App.tsx`. Admin routes wrapped in `AdminGuard` which checks `localStorage["overpaying_admin"] === "refresh"`.

**Route groups:**
- Public: 33 routes (all HTTP 200 confirmed)
- Admin: 7 routes (all HTTP 200 confirmed, auth-gated)

---

## Data Flow

### Pricing data (static)
```
Pipeline script (--mode full)
  → fetches trusted sources
  → classifies with OpenAI gpt-4o-mini
  → writes ai-pricing-news.json (digest)
  → appends pricing-history.json (history)
  → appends pipeline-run-log.json (log)
  → (GHA full mode) git commits data files
```

### Manual inspection (no public changes)
```
Pipeline script (--mode manual_no_update)
  → fetches + classifies
  → writes out/manual-autopilot-preview.json
  → appends pipeline-run-log.json
  → GHA uploads preview as artifact
```

### Frontend data rendering
```
src/data/*.json (static imports)
  → page components (React)
  → FreshnessIndicator (date-based status)
  → GA4 analytics events
```

---

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Layout` | `components/Layout.tsx` | Global header, mobile nav, footer |
| `FreshnessIndicator` | `components/FreshnessIndicator.tsx` | Freshness badge (live/recent/stale) |
| `AdminGuard` | `components/admin/AdminGuard.tsx` | Auth gate for admin pages |
| `AdminNav` | `components/admin/AdminNav.tsx` | Admin page navigation |
| `SearchBox` | `components/search/SearchBox.tsx` | Site-wide client-side search |
| `PageSeo` | `components/seo/PageSeo.tsx` | Per-page SEO meta tags |

---

## Analytics Events

Defined in `utils/analytics.ts`. All fire via `trackGaEvent()` to GA4.

Key events:
- `pipeline_control_viewed`
- `pipeline_dry_run_triggered`
- `pipeline_manual_no_update_triggered`
- `pipeline_reprocess_triggered`
- `pipeline_review_approved`
- `pipeline_review_rejected`
- `pipeline_review_viewed`

---

## Mobile Nav Architecture (post-fix)

```
Layout.tsx
  ├── menuOpen state
  ├── useEffect([location]) → setMenuOpen(false)  ← closes on route change
  └── {menuOpen && (
        <div> mobile menu
          <SearchBox onClose={closeMenu} />  ← onClose called on Escape/result only
          {navLinks.map(<Link>)}             ← no onClick needed; useEffect handles close
        </div>
      )}

SearchBox.tsx
  ├── mousedown listener → setShowDropdown(false) only (no onClose call)
  ├── onClose called: Escape key + navigateTo()
  └── results dropdown: absolute positioned, z-[200]
```
