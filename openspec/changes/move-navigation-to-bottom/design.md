## Context

See proposal.md for motivation and specs/app-navigation/spec.md for required behavior. The shared app shell currently renders a mobile navigation strip above the page content, and CSS hides the sidebar below 761px.

## Goals / Non-Goals

**Goals:**
- Keep mobile navigation visible at the viewport bottom during page scrolling.
- Keep navigation controls clear of device safe areas and page content.
- Preserve the existing desktop sidebar and mobile navigation destinations.

**Non-Goals:**
- Change navigation labels, destinations, or visual identity.
- Redesign desktop navigation or add a new navigation library.

## Decisions

- Keep the existing mobile navigation markup and make its wrapper fixed to the viewport bottom only at the existing mobile breakpoint. This preserves the shared route-aware links and avoids changing desktop layout; moving the nav into a new shell region would add markup without changing behavior.
- Apply the bottom safe-area inset to the fixed navigation wrapper so its background reaches the device edge while controls remain above the unsafe area. Reserve equivalent space at the end of mobile page content so the fixed bar cannot cover the final row or action.
- Retain the current 44px mobile link targets, icon-only presentation, and accessible link names. Changing the nav's contents is outside this placement change.

## Risks / Trade-offs

- [Fixed navigation overlaps short pages or the final content] → Reserve bottom content space for the navigation height and safe-area inset, and verify scrolling to the last content on a phone-sized viewport.
- [The fixed bar obscures controls or dialogs that use the viewport bottom] → Check the existing mobile transaction dialog and page workflows at short and standard phone heights.

## Migration Plan

No data migration or dependency change is required. Rollback by reverting the mobile positioning and content-spacing styles; the existing desktop sidebar remains unaffected.