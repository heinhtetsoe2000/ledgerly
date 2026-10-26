## Why

The current home emphasizes monthly summaries and charts, so users cannot quickly see how much they have spent today or review only today's activity. A mobile-first home centered on today's spending and a quick transaction entry point makes the most common daily check-in and recording actions easier to reach.

## What Changes

- Add a visually prominent total of today's expenses, kept separate by currency.
- Show today's transactions only in a dedicated home list, with a clear empty state.
- Add a prominent quick-add transaction action from the home screen.
- Reorder and adapt the home for mobile-first use while preserving the existing monthly summaries and spending insights.
- Keep the definition of today consistent with the application's existing UTC calendar-date convention.

## Capabilities

### New Capabilities

- `daily-spending-home`: Provide a mobile-first home experience for reviewing today's expenses and transactions and quickly recording activity.

### Modified Capabilities

None. The current monthly dashboard behavior remains available and unchanged.

## Impact

- The authenticated home route and dashboard data query will need to provide today's expense totals and today's transaction rows alongside existing monthly insight data.
- Dashboard presentation and responsive styles will change; transaction creation remains part of the existing transaction-management flow.
- No database schema or external dependency changes are expected.