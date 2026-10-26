## 1. Application Foundation

- [x] 1.1 Initialize the current stable Next.js App Router, React, TypeScript, and Tailwind CSS v4 project with scripts for linting, type checking, tests, and production builds; verify dependency installation and all baseline checks pass.
- [x] 1.2 Configure shadcn/ui, Lucide React, shared layout primitives, route groups, and responsive light/dark theme foundations; verify the application builds and its shell works at desktop and mobile widths.
- [x] 1.3 Add centralized Supabase browser/server clients, cookie-aware SSR configuration, and documented environment placeholders; verify the application reports missing configuration safely and no secret credential is exposed to client bundles.
- [x] 1.4 Add shared Zod validation, date-range, exact-decimal currency, and formatting utilities; verify unit tests cover positive amount/type validation, inclusive calendar dates, and currency-separated exact totals.

## 2. Database and Authorization

- [x] 2.1 Add version-controlled migrations for profiles, categories, and transactions with UUID ownership, timestamps, positive `numeric(14,2)` amounts, transaction-type constraints, currency codes, date columns, indexes, and same-owner category relationships; verify a clean local database migration succeeds and rejects invalid rows.
- [x] 2.2 Add operation-specific RLS policies scoped to the authenticated user and enforce category/transaction type consistency; verify database tests with two users deny cross-user reads, inserts, updates, deletes, and category assignments.
- [x] 2.3 Add idempotent account initialization for profile and default income/expense categories, and generate TypeScript database types from the schema; verify a new account receives the required defaults once and generated types match the migrated schema.

## 3. Authentication and Settings

- [x] 3.1 Implement registration, sign-in, password reset, persistent SSR sessions, sign-out, and protected route handling; verify the auth flow end-to-end, including unauthenticated redirects and session persistence.
- [x] 3.2 Implement profile display-name, default-currency, and theme preferences with server-side authorization; verify settings persist across sessions and changing the default currency leaves existing transaction values unchanged.

## 4. Categories and Transactions

- [x] 4.3 Implement transaction history with date, category, and type filters, description search, and pagination; verify combined filters return only matching records for the signed-in user across multiple pages.

## 5. Dashboard and Reports

- [x] 5.1 Implement selected-month dashboard summaries, month selection, recent transactions, category breakdown, and spending trend; verify empty/loading/error states and that every aggregate and visualization remains separated by currency.
- [x] 5.2 Implement date-range reports with monthly income/expense comparisons, category breakdown, spending trends, and inclusive date boundaries; verify report tests cover empty ranges and multiple currencies without combined totals.
- [x] 5.3 Implement report CSV export using the selected date range and user scope; verify exported rows match the report query and retain original per-transaction amounts and currency codes.

## 6. Release Verification

- [x] 6.1 Add component and end-to-end coverage for authentication, transaction creation/edit/deletion, category workflows, dashboard/report review, filters, and exports; verify the full automated test suite passes.
- [x] 6.2 Verify keyboard accessibility, contrast, confirmation/error/empty states, and mobile layouts for authentication, navigation, transaction entry, filters, charts, and settings; record passing desktop and mobile browser checks.
- [ ] 6.3 Configure development and production environment variables without committing credentials, apply migrations to the development Supabase project, and deploy the frontend; verify production auth, RLS-protected data access, and critical transaction flows using the configured project.