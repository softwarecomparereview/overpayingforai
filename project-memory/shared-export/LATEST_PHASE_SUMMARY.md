# Latest Phase Summary — OverpayingForAI

**Phase:** 004 — Mobile Navigation Fix  
**Date:** 2026-05-03  
**Commit:** 9a0ba32

---

## What was done

Fixed a critical mobile navigation bug where tapping items in the hamburger menu did not navigate anywhere.

**Root cause:** The `SearchBox` component had a native `document.addEventListener("mousedown", handler)` that called `onClose()` whenever the user tapped outside the search input. In the mobile menu context, `onClose = closeMenu = setMenuOpen(false)`. Because this was a native DOM event handler (not a React synthetic event), React flushed the state update immediately on `mousedown` — before `click` could fire on the tapped nav link. The menu unmounted, and the nav link click had nothing to land on.

**Fix:**
1. `SearchBox.tsx` — removed `onClose()` from the mousedown listener. Now only closes results dropdown (`setShowDropdown(false)`). `onClose` is still called on Escape and after result navigation.
2. `Layout.tsx` — added `useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location])` to close the menu cleanly after any route change.
3. Touch targets bumped to `min-h-[44px]` on mobile nav links.

**Desktop nav:** completely unchanged.

---

## Validation

| Check | Result |
|-------|--------|
| TypeScript | ✅ 0 errors |
| Vite build | ✅ 205 modules, clean |
| All routes HTTP 200 | ✅ |
| Mobile nav navigation | ✅ fixed |

---

## Open issue

Homepage mobile overflow (body 404px > 390px) — pre-existing, not caused by this fix. **This is the recommended next task.**
