## Why

Users need a secure, low-friction way to record income and expenses and understand their financial activity. This change establishes the first usable release, from account setup through transaction tracking, monthly insight, and export.

## What Changes

- Establish a responsive Next.js application foundation using TypeScript, Tailwind CSS, reusable accessible UI components, and Supabase.
- Add email/password registration, sign-in, password reset, persistent sessions, protected routes, sign-out, and user-scoped database security.
- Add income and expense creation, editing, deletion, filtering, searching, pagination, and CSV export.
- Add user-owned category management and sensible default categories.
- Provide dashboard summaries, recent transactions, category breakdowns, and spending trends, plus date-range reports.
- Add profile, default-currency, and theme preferences.
- Store currency on each transaction; do not automatically convert or combine totals across currencies.
- Defer budgets, recurring transactions, multiple accounts, currency conversion, receipt storage, imports, and shared expenses.

## Capabilities

### New Capabilities
- `user-auth`: Account registration, sign-in, password reset, session handling, protected routes, and sign-out.
- `transaction-management`: Create, read, update, delete, filter, search, paginate, and export income and expense transactions.
- `category-management`: Manage user-owned income and expense categories and provide defaults.
- `financial-dashboard`: Show selected-period income, expenses, net balance, recent activity, category breakdown, and trends without mixing currencies.
- `financial-reports`: Show date-range totals, monthly comparisons, category breakdowns, spending trends, and CSV exports without mixing currencies.
- `user-settings`: Manage display name, default currency, and theme preference.

### Modified Capabilities

None. The project has no existing capability specs.

## Impact

- New Next.js App Router application and shared UI foundation; the workspace currently contains no application source or package configuration.
- Supabase Auth, PostgreSQL schema and migrations, RLS policies, generated database types, and server/client access configuration.
- New routes for authentication, dashboard, transactions, categories, reports, and settings.
- Supporting validation, currency/date formatting, charts, and CSV export dependencies.
- Tests for monetary calculations, validation, critical user flows, and cross-user database authorization.