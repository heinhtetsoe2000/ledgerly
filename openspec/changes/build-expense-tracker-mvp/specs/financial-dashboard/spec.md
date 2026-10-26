## Purpose

Gives users a timely overview of their financial activity for a selected month, with understandable totals and visual summaries.

## ADDED Requirements

### Requirement: Dashboard summarizes a selected period
The system MUST show income, expenses, and net balance for the selected month, along with recent transactions, and MUST provide a way to select another month.

#### Scenario: Show a month with activity
- **WHEN** a user opens the dashboard for a month containing transactions
- **THEN** the system shows the period's income, expenses, net balance, and recent transactions for that user

#### Scenario: Show an empty month
- **WHEN** a user opens the dashboard for a month with no transactions
- **THEN** the system shows zero or empty summaries and a clear empty state without implying that data is still loading

### Requirement: Dashboard visualizes expenses and trends
The system MUST provide an expense breakdown by category and a spending trend by day or month for the selected period.

#### Scenario: Show category and trend summaries
- **WHEN** a user has expense activity in the selected period
- **THEN** the system presents category and time-based spending summaries based only on that user's transactions

#### Scenario: Show chart empty state
- **WHEN** there are no expenses in the selected period
- **THEN** the system shows an empty state for expense visualizations rather than misleading chart values

### Requirement: Dashboard totals preserve currency boundaries
The system MUST NOT convert or sum transaction amounts with different currency codes into a single total. Summaries and visualizations MUST identify currency and keep values separated by currency.

#### Scenario: Period includes multiple currencies
- **WHEN** a selected period contains transactions in more than one currency
- **THEN** the dashboard presents separate totals and applicable category or trend series for each currency without a combined monetary total

#### Scenario: Period contains one currency
- **WHEN** all transactions contributing to a summary share one currency code
- **THEN** the dashboard displays the summary with that currency clearly identified