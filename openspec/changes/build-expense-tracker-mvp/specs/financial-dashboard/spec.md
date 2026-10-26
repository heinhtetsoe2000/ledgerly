## Purpose

Keeps period summaries and spending visualizations available in Financial Analysis while the home focuses on today's activity.

## ADDED Requirements

### Requirement: Financial Analysis summarizes a selected period
The system MUST show income, expenses, and net balance by currency for the selected analysis period, with monthly comparisons and a way to select another date range. The home MUST NOT be required to show monthly summaries or recent transaction history; users can review transaction history on the Transactions page.

#### Scenario: Show an analysis period with activity
- **WHEN** a user opens Financial Analysis for a date range containing transactions
- **THEN** the system shows matching period summaries and monthly comparisons for that user, separated by currency

#### Scenario: Show an empty analysis period
- **WHEN** a user opens Financial Analysis for a date range with no transactions
- **THEN** the system shows a clear empty state without implying that data is still loading

### Requirement: Financial Analysis visualizes expenses and trends
The system MUST provide an expense breakdown by category and a spending trend by day or month for the selected analysis period, and MUST NOT require these visualizations on the home.

#### Scenario: Show category and trend summaries
- **WHEN** a user has expense activity in the selected analysis period
- **THEN** Financial Analysis presents category and time-based spending summaries based only on that user's transactions

#### Scenario: Show chart empty state
- **WHEN** there are no expenses in the selected analysis period
- **THEN** the system shows an empty state for expense visualizations rather than misleading chart values

### Requirement: Financial Analysis totals preserve currency boundaries
The system MUST NOT convert or sum transaction amounts with different currency codes into a single total. Analysis summaries and visualizations MUST identify currency and keep values separated by currency.

#### Scenario: Analysis period includes multiple currencies
- **WHEN** the selected analysis period contains transactions in more than one currency
- **THEN** Financial Analysis presents separate totals and applicable category or trend series for each currency without a combined monetary total

#### Scenario: Analysis period contains one currency
- **WHEN** all transactions contributing to a summary share one currency code
- **THEN** Financial Analysis displays the summary with that currency clearly identified