## Context

See proposal.md for motivation and specs/daily-spending-home/spec.md for the behavior contract. The authenticated home is a server-rendered route in `src/app/(app)/page.tsx`; it currently queries transactions for a selected month and derives monthly summaries. Transaction creation already has a validated form on `/transactions`, defaults its date to the current UTC date, and revalidates `/` after a successful save. The shared shell and responsive styles are in `src/components/app-shell.tsx` and `src/app/globals.css`.

## Goals / Non-Goals

**Goals:**
- Extend the existing home query and presentation without introducing a client-side data cache or duplicate transaction validation.
- Keep the daily view independent from the selected month used by existing monthly analytics.
- Make the first layout decisions for narrow screens, then enhance the same content for wider screens.

**Non-Goals:**
- Change transaction data, database schema, currency conversion, or the current UTC date convention.
- Replace the monthly summaries, category breakdown, spending trend, or transaction management route.
- Add a second transaction-entry form or a new UI dependency.

## Decisions

1. **Fetch today's records on the existing server-rendered home route.** Derive the UTC calendar date once per request and query the signed-in user's transactions with `occurred_on` equal to that date. Keep this query separate from the month-scoped query so changing the month selector cannot change the daily amount or today's list. RLS remains the ownership boundary. Reuse existing currency/date formatters and aggregate expense rows by currency; do not create a cross-currency total. A separate client fetch was considered but would add loading and synchronization states without a need for client-side filtering.

2. **Link quick-add directly to the existing transaction form.** Render a prominent home action targeting `/transactions#new-transaction-title`. The existing form already defaults to today and uses the established validation, categories, and save action; successful saves already revalidate the home route. Reimplementing the form in a dialog or on the home would duplicate validation and create another mutation surface.

3. **Put daily content first in document order and style from the mobile layout upward.** Place the prominent expense total and quick-add action before the today-only list, followed by the existing monthly analytics. Use a single-column base layout with content-sized controls and no horizontal page overflow, then add wider-screen layout enhancements at existing breakpoints. Keep headings, list semantics, focus behavior, and touch-sized actions accessible.

4. **Keep query failures distinct from empty data.** Render an availability message if the daily query fails rather than showing a zero total or empty list that could imply no activity. Preserve the current monthly dashboard error behavior independently.

## Risks / Trade-offs

- [The UTC date differs from a user's local calendar date] → Match the existing transaction default and dashboard date convention; changing to user-configured timezones requires a separate product decision.
- [The extra daily query adds dashboard database work] → Select only fields needed for the total and list, filter by exact date, and avoid loading history for the daily section.
- [The quick-add link leaves the home route] → Reuse the established transaction form and its success revalidation; the user can return to a refreshed home without duplicating transaction behavior.
- [Adding daily content pushes monthly summaries lower on small screens] → Keep the daily amount, action, and list first as required, while retaining monthly analytics below in the same page flow.

## Migration Plan

No data migration is needed. Deploy the updated home route and styles together. Roll back by restoring the previous route and styles; transaction data and existing transaction workflows are unaffected.