## Context

See proposal.md for motivation and specs/transactions-page-mobile/spec.md for the behavior contract. The Transactions route renders search/type/category/date filters, a create form, and transaction history. The history is already composed of semantic article cards rather than a wide table. Current mobile overrides keep paired filter and form fields in two columns; control text is smaller than the phone target, and the details summary is compact.

## Goals / Non-Goals

**Goals:**
- Use the existing responsive stylesheet and components to make filters, forms, history, and actions work within narrow viewports.
- Keep full transaction meaning available while preserving one-line signed currency amounts.
- Preserve the desktop layout and existing route, query parameters, export, and mutation behavior.

**Non-Goals:**
- Replace the existing transaction history cards with a table or introduce a new UI framework.
- Change filter semantics, pagination, data queries, validation, or transaction persistence.

## Decisions

- Keep the existing card history. Adjust only narrow-screen sizing and wrapping so descriptions and metadata remain legible, with monetary values kept together and details still accessible.
- Scope the 16px control text, 44px minimum controls, and single-column paired form rows to the Transactions filters and forms at phone widths. Avoid raising typography across unrelated auth, settings, and category screens.
- Use the existing 640px mobile boundary for these requirements, while preserving the wider-screen two-column form and filter layouts.
- Verify with the existing mobile transaction workflow plus targeted assertions for 360px and desktop widths; keep filter and transaction data behavior covered by existing checks.

Alternatives considered: replacing cards with a table would add responsive complexity without improving this route, which already uses cards. Changing global field styles would affect unrelated workflows and is unnecessary for the requested scope.

## Risks / Trade-offs

- [Larger phone controls and stacked fields increase page length] -> Keep the existing compact card structure and rely on normal page scrolling rather than compressing text below the readable target.
- [Long descriptions can compete with the amount for horizontal space] -> Let descriptions wrap or truncate only where the full value remains available in transaction details, while keeping the signed amount unbroken.

## Migration Plan

No data migration or deployment sequence is required. Rollback consists of reverting the responsive styles and their focused browser assertions.