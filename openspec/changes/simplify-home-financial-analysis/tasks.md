## 1. Align the home scope

- [x] 1.1 Reconcile the home requirements in `mobile-first-today-home` and `build-expense-tracker-mvp` with the today-only home and Financial Analysis destination; verify their specs no longer require monthly insights on home.
- [x] 1.2 Remove month selection, monthly summaries, charts, and older transaction history from the home while retaining today's expense totals and today's transaction list; verify the home shows only today's data and clear empty states.

## 2. Add modal transaction entry

- [x] 2.1 Reuse the existing transaction form, category options, currency default, validation, and save action in the home quick-add modal; verify a successful save revalidates the home and a validation failure keeps feedback visible.
- [x] 2.2 Implement modal close, keyboard dismissal, focus entry/restoration, and narrow-screen layout; verify open, dismiss, and keyboard flows in UI tests at desktop and mobile sizes.

## 3. Establish Financial Analysis navigation

- [x] 3.1 Rename the reports navigation item and all report page headings to Financial Analysis while retaining `/reports` and its date-range query parameters; verify navigation and direct `/reports` links still render the analysis page.
- [x] 3.2 Add or update analysis tests for valid and invalid date ranges, empty results, currency-separated summaries, and CSV export; verify the focused report tests pass.

## 4. Verify the complete experience

- [x] 4.1 Verify the today-only home, modal transaction save, and Financial Analysis navigation together with `npm test`, `npm run typecheck`, and `npm run lint`.
- [x] 4.2 Run the relevant Playwright workflows and verify the modal is usable on a narrow viewport and `/reports` remains accessible by its existing URL.