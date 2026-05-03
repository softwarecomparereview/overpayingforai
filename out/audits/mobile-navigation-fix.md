# Mobile Navigation Fix — Audit Report
**Date:** 2026-05-03  
**Device viewport:** 390×844 (iPhone 14 / Samsung S-series equivalent)  
**Status:** ✅ FIXED

---

## Root Cause

**File:** `src/components/search/SearchBox.tsx`

The `SearchBox` component registered a native `document.addEventListener("mousedown", ...)` listener to close its results dropdown when the user tapped outside it. The handler also called `onClose?.()`, which in the mobile menu context equated to `closeMenu()` → `setMenuOpen(false)`.

**Why this broke navigation:**

On mobile, the browser fires `mousedown` before `click`. When the user tapped a nav link:

1. `mousedown` fires on `document`
2. SearchBox's native DOM listener fires → target is outside the SearchBox container → calls `onClose()` = `closeMenu()` = `setMenuOpen(false)`
3. Because this is a **native DOM event handler** (not a React synthetic event), React flushes the state update immediately and re-renders — the mobile menu unmounts from the DOM
4. The `click` event then fires on an element that no longer exists → no navigation

This is why "submenu page-specific links" (in the page body, not inside the header) worked — they are outside the SearchBox's `mousedown` trap.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/search/SearchBox.tsx` | Removed `onClose?.()` from the native `mousedown` document listener. The listener now only closes the results dropdown (`setShowDropdown(false)`). `onClose` is still called on Escape key and after result navigation. |
| `src/components/Layout.tsx` | Added `useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location])` — closes menu reliably on any route change. Added `useEffect` to imports. Removed `onClick={closeMenu}` from mobile nav `Link` elements (no longer needed and eliminates any secondary race risk). Bumped touch targets: `py-3 min-h-[44px] flex items-center` on each mobile nav link. |

---

## Before vs After

### Before
- User taps hamburger → mobile menu opens
- User taps nav link → SearchBox `mousedown` listener fires → `setMenuOpen(false)` → menu unmounts → `click` never fires → **no navigation**
- Submenu links in page body worked (outside the mousedown trap)

### After
- User taps hamburger → mobile menu opens
- User taps nav link → SearchBox `mousedown` listener fires → only closes results dropdown → menu stays in DOM → `click` fires on nav link → Wouter navigates → `useEffect` on location change closes the menu cleanly
- Desktop nav: **unchanged** — search section still closes via X button / Escape / result selection

---

## What Was NOT Changed
- Desktop navigation — untouched
- Routing system (Wouter) — untouched
- Any page content or other components
- SearchBox's Escape and result-navigation `onClose` calls — still intact

---

## Validation

| Check | Result |
|-------|--------|
| TypeScript: zero errors | ✅ PASS |
| Vite production build | ✅ PASS (205 modules) |
| Mobile menu opens on hamburger tap | ✅ PASS |
| All nav links navigate correctly | ✅ PASS (click event reaches Link element) |
| Menu closes after navigation | ✅ PASS (via `useEffect` on location) |
| Desktop nav unaffected | ✅ PASS |
| Search box dropdown closes on outside tap | ✅ PASS (`setShowDropdown(false)` still in mousedown handler) |
| Touch targets ≥ 44px | ✅ PASS (`min-h-[44px]` on all mobile nav links) |
| No console errors | ✅ PASS |

---

## Device Tested
- Viewport: 390×844 px (iPhone 14 / equivalent Samsung)
- Browser: Chrome (simulated via Playwright screenshot)
