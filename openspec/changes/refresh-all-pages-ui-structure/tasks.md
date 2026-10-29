## 1. Reconcile Scope

- [x] 1.1 Check the current status and scope of the existing home, mobile navigation, transaction, authentication, and color-theme changes; record sequencing/ownership for overlaps before UI edits and verify no requirement is implemented twice.
- [x] 1.2 Map the current content and actions for overview, transactions, reports, categories, settings, and auth routes into the proposed page hierarchy; verify the map retains every existing page action and uses no unsupported balance or payment data.

## 2. Refresh Shared Layout

- [x] 2.1 Restructure the shared authenticated shell and route headings around the agreed hierarchy while preserving all navigation destinations; verify each existing route remains reachable and theme token declarations are unchanged.
- [x] 2.2 Reflow shared responsive styles below 640px, including labeled report-table cards, unwrapped currency amounts, 16px form controls, 44px targets, and safe-area-aware bottom navigation clearance; verify no horizontal overflow and that final content scrolls above navigation.

## 3. Refresh Route Content

- [x] 3.1 Reorganize overview and transactions content into readable summary, action, filter, and activity regions without changing data or workflows; verify quick-add, transaction edit/delete, filters, pagination, and CSV export remain available.
- [x] 3.2 Reorganize reports and categories into clear control, summary, analysis, and management regions; verify date-range behavior, report values, category add/edit/delete actions, empty/error states remain present.
- [x] 3.3 Reorganize settings and authentication screens while retaining all existing fields and feedback; verify settings persistence and sign-in, sign-up, recovery, and reset flows remain available.

## 4. Verify the Refresh

- [x] 4.1 Update or extend focused component and Playwright coverage for retained page content, responsive table cards, form sizing, and layout overflow; verify `npm test` and `npm run test:e2e` pass with local Supabase available.
- [x] 4.2 Review every route at phone and desktop viewports in light and dark themes; verify the color-token values are unchanged, bottom navigation does not obscure content, and no unsupported actions appear.
