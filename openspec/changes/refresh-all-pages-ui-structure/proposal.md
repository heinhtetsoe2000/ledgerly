## Why

The current pages use different layout patterns and density, making the finance workspace feel less coherent than the compact, scannable mobile reference. A shared structural refresh will make key amounts, activity, and page actions easier to find across the application without changing its theme or financial behavior.

## What Changes

- Establish a consistent page hierarchy and responsive layout across overview, transactions, reports, categories, settings, and authentication screens, using the reference as structural guidance.
- Reorganize existing content into clear summary, activity, filter, and settings regions while retaining each route's current information and actions.
- Preserve the current light and dark color tokens, theme choices, data, routes, authentication, and transaction workflows; do not add a payment or transfer feature that is not present today.
- Build on the completed focused changes for home, mobile navigation, transactions, authentication, and theme; treat their behavior as baseline and avoid duplicating their scope.

## Capabilities

### New Capabilities

- `application-ui-structure`: Defines consistent, responsive information hierarchy and layout behavior across application and authentication pages while preserving existing theme and workflows.

### Modified Capabilities

None. The main OpenSpec inventory has no published capabilities.

## Impact

- Affects the shared app shell and styles, authenticated route layouts, and existing home, transaction, report, category, settings, and authentication components.
- No database, API, validation, dependency, color-token, theme-preference, or business-workflow changes are expected.
- Related changes already complete include `mobile-first-today-home`, `polish-home-dashboard`, `move-navigation-to-bottom`, `tune-transactions-mobile`, `tune-login-mobile`, and `update-app-color-theme`; their behavior is baseline, and this change explicitly preserves the current theme.
