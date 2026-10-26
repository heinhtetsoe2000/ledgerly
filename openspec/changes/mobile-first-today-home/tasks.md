## 1. Daily Data and Entry

- [x] 1.1 Extend the home route to derive today's UTC date once and fetch only today's transaction rows separately from the selected-month query; verify tests prove the daily rows are independent of the month selector and exclude other dates.
- [x] 1.2 Derive today's expense totals by currency and represent no-expense and query-error states distinctly; verify tests cover multiple currencies, no expenses, and a failed daily query without producing a combined or stale amount.
- [x] 1.3 Add a prominent home quick-add action linking to the existing transaction form with its today default; verify the link targets the form and a saved today-dated transaction is reflected after returning to the revalidated home.

## 2. Mobile-First Home

- [x] 2.1 Render today's expense total before a today-only list containing both income and expense transactions, with a clear empty state; verify component or route tests cover mixed transaction types and an empty day.
- [x] 2.2 Update home styles from a single-column mobile base, keeping the amount, quick-add action, and list readable and operable while retaining monthly insights below; verify at 360 CSS pixels there is no horizontal overflow or clipped primary content and check a wider viewport still presents the same content.

## 3. Integration Verification

- [x] 3.1 Add or extend Playwright coverage for quick-add navigation and the mobile home layout, then verify it passes with `npm run test:e2e -- e2e/workflows.spec.ts`.
- [x] 3.2 Run `npm test`, `npm run lint`, and `npm run typecheck`; verify all dashboard tests and project checks pass.