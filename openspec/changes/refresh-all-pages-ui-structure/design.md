## Context

See proposal.md for motivation and specs/application-ui-structure/spec.md for the behavior contract. The authenticated app currently shares a desktop sidebar, a mobile bottom navigation bar, and a top bar, while route content is rendered by separate overview, transactions, reports, categories, and settings components. The same global stylesheet contains both theme tokens and responsive layout rules, so structural changes must avoid altering theme values.

## Goals / Non-Goals

**Goals:**
- Give authenticated and account pages a consistent visual hierarchy while keeping route-specific content intact.
- Use the reference's compact, summary-first organization and grouped activity as layout guidance, mapped only to data and actions the app already supports.
- Keep phone layouts readable and usable, and retain a clear desktop layout.

**Non-Goals:**
- Change color tokens, theme preference behavior, financial calculations, database queries, routes, or validation.
- Add balance data that the app does not currently calculate or add payment/transfer workflows shown only in the reference.
- Replace the existing UI framework, introduce dependencies, or redesign the app's visual identity through new colors.

## Decisions

- Treat the shared shell and global stylesheet as the layout control points, and keep each route's existing domain component responsible for its own content. This allows shared navigation and page spacing to become consistent without moving database or workflow logic; replacing route components wholesale was rejected because it increases the risk of dropping existing actions.
- Map reference patterns to current information: show existing daily expense totals and activity on overview, keep transaction filters and history together, group report controls and analysis, and keep category, settings, and auth forms clearly separated. Do not copy the reference's account balance or payment action where the application has no corresponding data or behavior.
- Reuse existing CSS variables and light/dark theme behavior. Structural work may adjust layout, spacing, sizing, and content grouping, but must not modify palette declarations; a token-level diff is a direct review check for this constraint.
- The live OpenSpec inventory reports the focused home, navigation, transaction, authentication, and theme changes as complete. Treat those behaviors as the baseline; this change owns cross-page organization and uncovered route layout rather than reopening those completed concerns. This avoids duplicate implementation while allowing remaining pages to share the same hierarchy.
- Validate the resulting shared and route-specific layouts at a phone viewport below 640px and a desktop viewport. Include narrow table/card readability, currency wrapping, form text and target sizes, final-content clearance, and existing route actions in the review.

The route-to-content mapping is:
- Overview: daily totals by currency, expense/income quick-add actions, today's activity, and the existing link to all transactions.
- Transactions: currency summaries, quick-add, expandable filters, paginated history, row details/edit/delete, and CSV export.
- Reports: date-range controls, export, monthly comparison, category expenses, and monthly spending trend, including existing empty/error states.
- Categories: category creation and the existing editable/deletable category list.
- Settings: display name, default currency, and theme preference controls.
- Authentication: sign-in, sign-up, password recovery, and reset fields, feedback, and account-navigation links.

The hierarchy uses only these existing values and actions; it does not add an account balance or payment/transfer action from the reference.

## Risks / Trade-offs

- [Completed focused changes remain present as separate proposals] → Treat their implemented behavior as baseline and limit this change to shared structure and uncovered route layouts.
- [A denser reference-inspired layout hides route-specific information] → Keep every current route's data and actions in the page hierarchy and check empty, error, and populated states.
- [Shared layout changes regress one viewport or theme] → Verify phone and desktop layouts in both existing themes, and confirm the theme token declarations remain unchanged.

## Migration Plan

No data or dependency migration is needed. Apply layout changes incrementally through the shared shell and existing page components. Roll back by reverting the structural markup and responsive layout changes while leaving the existing theme tokens and domain behavior untouched.
