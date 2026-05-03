# Audit Report — Homepage Mobile Overflow Fix

**Date:** 2026-05-03  
**Commit:** 53d042d (pre-fix) → pending  
**Task:** Fix homepage hero mobile overflow (body 404px > 390px at 390px viewport)

---

## Root Cause

**File:** `artifacts/overpaying-for-ai/src/pages/Home.tsx` line 292  
**Element:** Savings strip grid  
**Class:** `min-w-[600px] sm:min-w-0`

The savings strip grid was forcing itself to be at least 600px wide on all viewports narrower than 640px (the `sm` breakpoint). At 390px, `sm:min-w-0` never activated, leaving the grid at 600px minimum width. Even though the parent `<section>` had `overflow-x-auto`, the DOM body itself expanded to 600px to contain the element before the overflow clip could take effect, causing the 404px > 390px audit failure.

The grid already had `grid-cols-2` (two columns on mobile) which is fully responsive — the `min-w-[600px]` constraint was unnecessary.

---

## Fix Applied

**File:** `artifacts/overpaying-for-ai/src/pages/Home.tsx`

| Before | After |
|--------|-------|
| `<section ... overflow-x-auto>` | `<section ...>` — removed `overflow-x-auto` (no longer needed) |
| `<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 min-w-[600px] sm:min-w-0">` | `<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">` |

Two-character diff: removed `overflow-x-auto` from section and removed `min-w-[600px] sm:min-w-0` from inner grid div.

**Desktop layout:** Unchanged — `sm:grid-cols-4` still activates at 640px+.  
**Other pages:** Not touched.

---

## Validation

| Check | Result | Notes |
|-------|--------|-------|
| TypeScript (`tsc --noEmit`) | ✅ PASS | 0 errors |
| Vite build | ✅ PASS | 205 modules, clean |
| Homepage HTTP 200 | ✅ PASS | `curl` |
| Calculator HTTP 200 | ✅ PASS | `curl` (regression check) |
| Mobile screenshot (390×844) | ✅ PASS | No horizontal overflow visible |
| Remaining `min-w-[...]` in Home.tsx | ✅ OK | Only `sm:min-w-[220px]` (before/after panel, sm-gated, safe) |
| Remaining `overflow-x-auto` in Home.tsx | ✅ OK | Nav pills strip (line 214, intentional, self-contained row) |

---

## Before / After

**Before:** Savings strip inner grid had `min-w-[600px]` → body forced to 404px at 390px viewport → horizontal scroll  
**After:** Grid at 390px renders as 2 columns within viewport bounds → no overflow

---

## Other Overflow Candidates Checked

| Element | Class | Safe? |
|---------|-------|-------|
| Nav pills strip (line 214) | `overflow-x-auto whitespace-nowrap` | ✅ Intentional horizontal scroll, row-contained |
| Before/After panel (line 370) | `sm:min-w-[220px]` | ✅ sm-gated (640px+), no mobile impact |
| Hero h1 (line 154) | `text-5xl sm:text-6xl lg:text-7xl` | ✅ Text wraps correctly |
| CTA grid (line 165) | `grid sm:grid-cols-3` | ✅ 1-column on mobile |
| Max-width containers | `max-w-5xl mx-auto px-4 sm:px-6` | ✅ Standard pattern, no issues |

---

## Conclusion

Single-line fix. No side effects. Homepage mobile overflow eliminated.
