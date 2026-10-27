## 1. Mobile Filters and Forms

- [x] 1.1 Tune the filter layout and controls below 640px while preserving labels and query parameters; verify all filters fit at 360px and the existing search/filter workflow still returns the expected transactions.
- [x] 1.2 Stack paired create/edit fields on phones, use at least 16px control text and 44px touch targets, and preserve the desktop layout; verify those dimensions at 360px and run `npm test -- src/components/management-components.test.tsx`.

## 2. Transaction History and Verification

- [x] 2.1 Refine history cards for narrow widths so description, type, category/date metadata, and signed currency amounts remain understandable without horizontal scrolling; verify long descriptions and amounts at 360px while keeping currency values on one line.
- [x] 2.2 Verify details and pagination controls remain touch-operable on phones and the wider layout remains intact; run `npm run test:e2e -- --grep "mobile finance workflows"` and `npm run typecheck`.