## Purpose

Enables users to review financial activity over chosen dates and compare spending patterns while preserving transaction currency boundaries.

## ADDED Requirements

### Requirement: Reports summarize a selected date range
The system MUST allow a user to select a date range and review transaction totals and monthly income-versus-expense comparisons for that range.

#### Scenario: Generate report for a date range
- **WHEN** a user selects a valid date range
- **THEN** the system reports that user's matching activity and period comparisons

#### Scenario: Report range has no activity
- **WHEN** a user selects a date range with no transactions
- **THEN** the system presents an empty report state and does not display stale results from another range

### Requirement: Reports show category and spending trends
The system MUST provide a category breakdown and a spending trend for the selected date range.

#### Scenario: View report visualizations
- **WHEN** a user generates a report for a range containing expenses
- **THEN** the system shows category and time-based expense summaries for that user's matching expenses

### Requirement: Report totals preserve currency boundaries
The system MUST NOT convert or sum amounts with different currency codes into a single total. Report totals, comparisons, and visualizations MUST identify currency and keep values separated by currency.

#### Scenario: Report contains multiple currencies
- **WHEN** matching transactions include more than one currency
- **THEN** report summaries and comparisons remain separated by currency and no combined monetary total is shown

### Requirement: Users can export report data
The system MUST allow a user to export the transactions matching the selected report date range as CSV, preserving each row's currency code.

#### Scenario: Export a report
- **WHEN** a user exports report data
- **THEN** the CSV contains only the user's transactions within the selected range and does not convert amounts