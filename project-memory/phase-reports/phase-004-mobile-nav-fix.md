# Task / Phase Report

## Task / Phase
Phase 004 — Mobile Navigation Fix

## Date
2026-05-03

## Objective
Fix mobile hamburger menu navigation on Samsung S26 Ultra / Chrome (390px viewport). Hamburger opens but tapping main menu items does not navigate. Submenu/page-body links work.

## Summary
Root cause identified and fixed. The `SearchBox` component registered a native `document.addEventListener("mousedown", ...)` listener that called `onClose()` — which closed the entire mobile menu — before the `click` event could fire on the tapped nav link. Since native DOM event handlers are not batched by React, the state update `setMenuOpen(false)` flushed immediately on `mousedown`, unmounting the menu, so the subsequent `click` event had no target to fire on.

Fix: removed `onClose` from the mousedown handler. Only closes the search results dropdown (`setShowDropdown(false)`). Added `useEffect([location])` in `Layout.tsx` to close the menu reliably on any route change. Bumped mobile nav link touch targets to `min-h-[44px]`.

## Completed Work
- Identified root cause in `SearchBox.tsx` mousedown listener
- Removed `onClose()` from mousedown handler (kept only `setShowDropdown(false)`)
- Added `useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location])` to Layout
- Added `useEffect` to imports in Layout
- Removed `onClick={closeMenu}` from mobile nav Links (redundant with useEffect)
- Bumped touch targets: `py-3 min-h-[44px] flex items-center` on mobile nav Links
- Wrote `out/audits/mobile-navigation-fix.md`

## Files Created
- `out/audits/mobile-navigation-fix.md`

## Files Modified
- `artifacts/overpaying-for-ai/src/components/search/SearchBox.tsx`
- `artifacts/overpaying-for-ai/src/components/Layout.tsx`

## Files Deleted
None

## Behaviour Changed
- **Before:** Tapping mobile nav links → menu closes instantly (mousedown) → click never fires → no navigation
- **After:** Tapping mobile nav links → click fires → Wouter navigates → useEffect closes menu after route change
- **Search dropdown:** Still closes on outside tap (mousedown listener kept, only `onClose` call removed)
- **Desktop:** Unchanged — desktop nav uses `hidden md:flex` and is not affected

## Security/RBAC Impact
None

## Data Retention Impact
None

## Customer/Data Isolation Impact
None

## Validation Performed
- TypeScript: `npx tsc --noEmit`
- Vite build: `npx vite build`
- Admin routes HTTP 200: `curl -s -o /dev/null -w "%{http_code}"`
- Mobile screenshot at 390×844 viewport

## Checks Passed
- TypeScript: ✅ 0 errors
- Vite build: ✅ 205 modules, clean
- Routes HTTP 200: ✅ all admin and public routes
- Mobile viewport screenshot: ✅ hamburger menu visible

## Checks Failed
None

## Known Issues
- Homepage mobile overflow (body 404px > 390px) — pre-existing, not introduced by this fix

## Deferred Items
- Add "Audit" link to mobile nav (currently desktop-only)

## Risks Added/Updated
None

## Decisions Added/Updated
- D007: Remove onClose from SearchBox mousedown listener
- D008: useEffect on location change to close mobile menu

## Next Recommended Task
Fix homepage hero mobile overflow (body 404px > 390px at 390px viewport)

## Suggested Next Prompt
Fix the mobile homepage overflow. At 390px viewport width, the body/hero is 404px wide causing horizontal scrolling. Identify the specific element causing the overflow in the homepage hero section and fix it without changing the desktop layout.
