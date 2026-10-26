## Context

The workspace currently contains OpenSpec configuration but no application source, dependencies, or database migrations. This is a greenfield build. The required user-visible behavior is defined in the six capability specs; this document records architecture and implementation decisions.

## Goals / Non-Goals

**Goals:**
- Establish a secure, maintainable web application with one source of truth for authorization and monetary data.
- Keep feature ownership clear while supporting shared authentication, database clients, validation, currency formatting, and date handling.
- Make summaries and exports correct for users whose transactions use different currencies.

**Non-Goals:**
- Currency conversion, budgets, recurring transactions, multiple wallets, receipt storage, imports, and shared household access.
- A generic repository layer or client-side financial data cache before the product demonstrates a need for either.

## Decisions

1. **Use Next.js App Router with TypeScript and Supabase SSR.** Start with the current stable versions of Next.js, React, TypeScript, and Tailwind CSS v4, then configure shadcn/ui and Lucide React. Use server-rendered application pages for initial data retrieval and cookie-aware Supabase server clients; reserve client components for interactive forms, filters, dialogs, theme controls, and charts. Centralize browser/server client setup. Server Actions are appropriate for straightforward mutations; use route handlers where a downloadable response such as CSV is more suitable. This matches the requested stack and keeps session handling aligned across rendering and mutations. A separate API service would add deployment and authorization surfaces without an MVP need.

2. **Make PostgreSQL migrations and RLS the security boundary.** Create profiles, categories, and transactions with UUID identifiers, owner foreign keys, timestamps, database constraints, and indexes for owner/date and common filter columns. Enable RLS and create separate policies for each operation, scoped with `auth.uid()`. Never expose a service-role credential to the browser. Use a composite owner/category relationship so a transaction cannot reference another user's category; validate category type in server-side schemas and enforce it at the database boundary as well. Seed profiles and default categories idempotently when an account is created, using a narrowly scoped database function/trigger, so initialization is consistent and retries do not duplicate defaults. Generate TypeScript database types from the migrated schema.

3. **Represent monetary data as exact decimal values with explicit currency.** Store positive transaction amounts as PostgreSQL `numeric(14,2)`, and store a currency code on every transaction. Do not pass monetary values through JavaScript floating-point arithmetic for sums; compute aggregates with PostgreSQL numeric operations or an exact-decimal representation, always grouped by currency. A default currency only prefills new transactions. It does not alter existing rows. Use a PostgreSQL `date` for `occurred_on`, and define selected date ranges as inclusive calendar dates so reporting does not depend on browser timezone offsets.

4. **Organize code by feature and keep shared utilities small.** Use route groups for authentication and the signed-in application, with routes for dashboard, transactions, categories, reports, and settings. Keep database queries and validation close to each feature; centralize only Supabase clients, generated database types, date/currency helpers, and shared UI components. Use React Hook Form with Zod for interactive forms and validate again at the server mutation boundary. Use Recharts for charts, grouped by currency, and use a CSV response for the exact current filters/date range. Escape CSV fields and neutralize spreadsheet formula-leading values.

5. **Build the MVP as a responsive authenticated workspace.** Use an accessible shared shell with desktop side navigation, compact top actions, and a mobile-friendly navigation pattern. Keep transaction entry usable on small screens, offer filters in a sheet/drawer on mobile, and provide loading, error, empty, and destructive-confirmation states. Use reusable UI primitives from shadcn/ui rather than introducing a separate component system. Support light and dark theme preferences.

6. **Test behavior at the boundaries that carry the most risk.** Unit-test exact currency summaries, date ranges, CSV escaping, and validation. Test forms and list/filter behavior with component tests. Add database tests for constraints and RLS using separate user identities, including attempts to read, mutate, or associate another user's records. Add end-to-end coverage for sign-in, transaction create/edit/delete, dashboard/report review, and export. Verify mobile layouts and keyboard accessibility before release.

## Risks / Trade-offs

- [RLS policy or privileged account-initialization function is too broad] → Keep policies operation-specific, scope the initialization function to the new auth user, fix its search path, and test with at least two independent users.
- [Currency values are accidentally combined or rounded in the UI] → Group every aggregate by currency, use exact decimal arithmetic, and add multi-currency tests for dashboard, reports, and export.
- [Database/client validation diverges] → Define shared Zod schemas and validate again at mutation boundaries; retain database constraints for invariants that must hold for every caller.
- [Category deletion conflicts with transaction history] → Restrict deletion to unused categories and surface a clear message when a category remains assigned.
- [CSV values are interpreted as spreadsheet formulas] → Quote and escape CSV fields and neutralize formula-leading cell content before generating the download.
- [Greenfield setup adds too many dependencies before workflows are proven] → Install only libraries needed by the MVP routes and forms, and avoid optional table or state-management dependencies until requirements justify them.

## Migration Plan

1. Initialize the application and environment configuration, then add version-controlled Supabase migrations and generated database types.
2. Apply migrations to a development Supabase project and verify signup initialization, RLS behavior, constraints, and indexes before building dependent screens.
3. Implement authenticated features and deploy with environment-specific publishable Supabase configuration; keep secret keys server-only.
4. For rollback, redeploy the previous frontend version. Treat schema changes as additive until the release is accepted; do not drop or rewrite user data as part of application rollback. Any later destructive migration requires a separate reviewed migration plan and backup.

## Open Questions

- The production Supabase project, deployment project, and environment values must be provisioned by the owner. Development should use documented placeholders and must never commit credentials.
- The product plan does not specify a pagination size or supported currency catalog. Choose accessible defaults during implementation without changing the behavior contract: pagination must be usable, and currency codes must be stored and displayed as supplied/selected.