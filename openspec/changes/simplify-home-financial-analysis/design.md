## Context

See proposal.md for motivation and specs for the user-facing contract. The overview currently combines today activity with selected-month summaries and visualizations. The reports route already provides date-range comparisons, category totals, spending trends, and CSV export. The transaction form and save action are currently hosted by the Transactions workflow; a successful save already revalidates `/` and `/transactions`.

## Goals / Non-Goals

**Goals:**
- Keep home data focused on today's activity while making the existing analysis available through a clearly named destination.
- Reuse the current transaction validation, save behavior, category options, and account currency default in quick-add.
- Preserve existing `/reports` links and date-range query behavior.

**Non-Goals:**
- Changing transaction data, database schema, report calculations, currencies, or CSV format.
- Removing the full transaction history and management page.
- Adding a separate analysis implementation alongside the existing reports experience.

## Decisions

- Use a native modal dialog for home quick-add and reuse the existing transaction form and save action. The project has no dialog component or dialog dependency; the native dialog provides modal focus behavior without adding a package. Keep the dialog dismissible by keyboard and return focus to its trigger. On successful save, close the dialog and rely on the existing home revalidation to refresh today's activity; keep validation errors in the open form. The alternative is routing to Transactions or duplicating the form, which either violates the requested flow or risks divergent validation.
- Keep the analysis page at `/reports` and change its primary-navigation label and page headings to Financial Analysis. This preserves saved links and existing query-string filters while avoiding a new route that duplicates report behavior. The alternative is a route migration with redirects and link updates, which is not needed for the requested separation.
- Remove the selected-month dashboard sections from the home and use the existing date-range reports experience for broader analysis. The home currently fetches both today and selected-month transactions; after removal, its data work should be limited to what the today view and quick-add need. The alternative of retaining monthly summaries on wider layouts conflicts with the confirmed today-only scope.
- Reconcile the in-flight `mobile-first-today-home` and `build-expense-tracker-mvp` spec artifacts with the today-only home contract before implementation, so their requirements do not continue to require monthly insights on the home.

## Risks / Trade-offs

- [The dialog may be awkward on small screens or with assistive technology] -> Use native modal semantics, a visible close control, keyboard dismissal, focus restoration, and a viewport-fitted layout; verify mobile and keyboard flows.
- [Moving monthly data off home could make it harder to discover] -> Add Financial Analysis to primary navigation and use that name consistently in page headings.
- [The existing reports URL is less descriptive than its new label] -> Keep the URL intentionally for compatibility and make the destination name clear in navigation and page content.
- [In-flight OpenSpec changes retain contradictory home requirements] -> Reconcile their specs as part of implementation before treating the change set as complete.

## Migration Plan

No data migration is needed. Change the home composition and quick-add entry point, relabel the existing reports destination, and retain `/reports` and its query parameters. Rollback can restore the prior home sections and navigation/page labels without changing stored data or URLs.