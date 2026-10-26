## Purpose

Provides a focused home view for checking today's spending and activity, with a quick transaction-entry flow that does not take users away from the home page.

## ADDED Requirements

### Requirement: Home focuses on today's activity
The system MUST show today's expense totals and today's transactions on the home page. Expense totals MUST remain separated by currency, and the page MUST NOT show monthly summaries, expense breakdowns, spending trends, or older transaction history.

#### Scenario: Show today's activity
- **WHEN** the user has transactions dated today and on other dates
- **THEN** the home shows today's expense totals by currency and today's transactions only, including both income and expenses

#### Scenario: No activity today
- **WHEN** the user has no transactions dated today
- **THEN** the home shows clear empty states for today's expenses and transactions without showing stale data

#### Scenario: Monthly insights are needed
- **WHEN** the user wants to review activity beyond today
- **THEN** the user can navigate to Financial Analysis without monthly summaries or visualizations being shown on the home page

### Requirement: Home quick-add opens transaction entry in a modal
The system MUST open transaction entry in a modal when the user activates the home quick-add action, without navigating away from the home page. The form MUST default to today's date and retain the existing transaction fields, category choices, currency default, and validation behavior.

#### Scenario: Open quick-add
- **WHEN** the user activates the home quick-add action
- **THEN** a modal transaction form opens over the home page with today's date preselected

#### Scenario: Dismiss quick-add
- **WHEN** the user dismisses the modal without saving
- **THEN** the modal closes and the home page remains available without changing transaction data

#### Scenario: Save a transaction dated today
- **WHEN** the user submits a valid transaction dated today from the modal
- **THEN** the transaction is saved and appears in today's activity, and today's expense total updates when the transaction is an expense

#### Scenario: Reject invalid transaction input
- **WHEN** the user submits invalid transaction data from the modal
- **THEN** the system keeps the entry flow available and presents the existing validation feedback without saving the transaction

#### Scenario: Operate the modal with a keyboard
- **WHEN** the user opens and uses quick-add with a keyboard
- **THEN** focus moves into the modal, remains within it while open, and returns to the quick-add action when the modal closes