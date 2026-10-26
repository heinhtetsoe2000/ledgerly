## Why

The home page combines today's activity with monthly summaries, charts, and transaction history, making the immediate daily view harder to scan. Users should be able to record a transaction without leaving that view, while broader financial trends remain available on a dedicated Financial Analysis page.

## What Changes

- Reduce the home page to today's expense totals, today's transactions, and a quick-add action; move monthly summaries and visualizations off the home page.
- Open transaction entry in a modal from the home page, with today's date preselected and the existing validation, categories, currency default, and save behavior.
- Present the existing date-range reports experience as Financial Analysis in page headings and navigation, retaining the `/reports` URL and its filters and CSV export.
- Update the mobile-first home requirements so monthly insights are available through Financial Analysis rather than on the home page.

## Capabilities

### New Capabilities
- `daily-spending-home`: A focused today-only home with modal quick transaction entry.
- `financial-analysis`: A dedicated destination for date-range summaries, spending breakdowns, trends, and exports.

### Modified Capabilities

## Impact

- Affects the overview route and daily-spending home component, the shared transaction form workflow, and primary navigation and report page labels.
- Reuses the existing transaction save action and report queries; no database schema or API changes are expected.
- The in-flight `mobile-first-today-home` and `build-expense-tracker-mvp` changes currently specify monthly insights on the home page. This change replaces those home requirements with the today-only scope and moves those insights to Financial Analysis.