## Context

See proposal.md for motivation and specs/daily-spending-home/spec.md for the presentation contract. The overview route currently renders a generic eyebrow and description. Daily totals are rendered by the Home component, while the shared stylesheet expands the native quick-add dialog to the full viewport below the mobile breakpoint. The dialog already uses native modal behavior, a backdrop, and focus restoration.

## Goals / Non-Goals

**Goals:**
- Make the current Home content more direct without removing meaningful financial or transaction labels.
- Center totals without merging currencies or allowing long amounts to wrap on phones.
- Preserve a clearly bounded dialog on phones and keep its heading and close action available while form content scrolls.

**Non-Goals:**
- Change the Home data query, transaction creation, validation, or refresh behavior.
- Redesign navigation or the broader dashboard visual system.

## Decisions

- Remove only the generic eyebrow and explanatory page description. Keep the page title, Today sections, transaction labels, and empty/error messages because they communicate navigation or state.
- Apply total alignment and narrow-screen amount sizing to the existing total styles. Keep the existing per-currency summary data and avoid changing amount formatting.
- Retain the native dialog and its existing open, close, backdrop, and focus-restoration behavior. Remove the mobile full-viewport sizing override; use the existing bounded dialog dimensions with a viewport-relative maximum height.
- Keep the dialog heading outside the scrollable form region so the title and close action remain available while long form content scrolls inside the dialog.

Alternatives considered: keeping the full-screen mobile dialog would preserve the current mobile override but would not meet the requested contained-dialog behavior. Replacing the native dialog would add interaction and accessibility risk without being needed for this visual refinement.

## Risks / Trade-offs

- [Long currency amounts may still exceed a narrow total] -> Reduce the amount font size at the narrowest supported widths and verify representative long values without introducing horizontal scrolling.
- [A bounded dialog may have less visible form area on short phones] -> Constrain the dialog to the dynamic viewport and scroll the form region while keeping its heading and close action visible.

## Migration Plan

No data or deployment migration is required. Rollback consists of restoring the previous Home copy and responsive styles; transaction behavior remains unchanged.