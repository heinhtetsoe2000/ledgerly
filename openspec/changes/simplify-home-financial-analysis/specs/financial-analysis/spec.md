## Purpose

Gives users a dedicated place to review financial activity across a selected date range, understand spending patterns, and export matching transaction data.

## ADDED Requirements

### Requirement: Financial Analysis is available as a dedicated destination
The system MUST provide a Financial Analysis destination in primary navigation and identify the page as Financial Analysis. The existing `/reports` URL MUST continue to work for compatibility.

#### Scenario: Navigate to Financial Analysis
- **WHEN** the user selects Financial Analysis from primary navigation
- **THEN** the system opens the existing date-range analysis experience and identifies it as Financial Analysis

#### Scenario: Open the existing reports URL
- **WHEN** the user opens `/reports` directly or follows a saved `/reports` link
- **THEN** the system displays the Financial Analysis experience without requiring a different URL

### Requirement: Financial Analysis summarizes a selected date range
The system MUST allow a user to select an inclusive date range and review matching transaction totals and monthly income-versus-expense comparisons for that range.

#### Scenario: Generate analysis for a valid date range
- **WHEN** the user selects a valid date range
- **THEN** the system shows only that user's matching activity and monthly comparisons

#### Scenario: Reject an invalid date range
- **WHEN** the end date is earlier than the start date or either date is invalid
- **THEN** the system explains that a valid date range is required and does not display results for another range as if they matched

#### Scenario: Show an empty date range
- **WHEN** the selected date range has no transactions
- **THEN** the system presents a clear empty state and does not show stale results from another range

### Requirement: Financial Analysis shows category and time trends
The system MUST provide category spending breakdowns and a monthly spending trend for expenses in the selected date range. Empty expense sets MUST have a clear empty state.

#### Scenario: View analysis for expenses
- **WHEN** the selected date range contains expenses
- **THEN** the system shows category totals and monthly spending trends based on those expenses

#### Scenario: View analysis without expenses
- **WHEN** the selected date range contains no expenses
- **THEN** the system shows empty states for category and trend visualizations rather than misleading values

### Requirement: Financial Analysis preserves currency boundaries
The system MUST NOT convert or combine amounts with different currency codes into a single total. Totals, comparisons, category breakdowns, and trends MUST identify currency and keep values separated by currency.

#### Scenario: Analyze activity in multiple currencies
- **WHEN** matching transactions include more than one currency
- **THEN** every monetary summary and visualization keeps each currency separate and no combined monetary total is shown

### Requirement: Users can export analyzed transactions
The system MUST allow users to export transactions matching the selected date range as CSV, preserving each transaction's currency code and without converting amounts.

#### Scenario: Export analyzed transactions
- **WHEN** the user exports data from Financial Analysis
- **THEN** the CSV contains only the user's transactions in the selected date range and preserves each row's currency code