## Why

The Transactions page is usable on small screens but its compact control typography, paired form fields, and small details targets make repeated mobile entry and review less comfortable. A focused responsive pass will improve readability and touch use while preserving the existing transaction and filtering workflows.

## What Changes

- Tune the create/edit form and filter controls for phone widths, including readable control text, comfortable touch targets, and a single-column arrangement where paired fields become cramped.
- Refine transaction-history cards for narrow screens so descriptions, category/date metadata, type, and signed currency amounts remain understandable without horizontal page scrolling.
- Preserve existing filter parameters, pagination, CSV export, transaction editing, and deletion behavior.

## Capabilities

### New Capabilities
- `transactions-page-mobile`: Define responsive, touch-friendly behavior for creating, filtering, and reviewing transactions on narrow screens.

### Modified Capabilities
None. The main OpenSpec inventory has no published capabilities.

## Impact

- Affects the Transactions route, shared transaction manager, responsive styles, and related component and browser tests.
- No changes to database schema, APIs, transaction validation, or filter semantics are expected.