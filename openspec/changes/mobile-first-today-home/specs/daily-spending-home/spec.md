## Purpose

Gives users a mobile-first home for checking today's expenses, reviewing today's transactions, and recording a transaction without leaving the home workflow.

## ADDED Requirements

### Requirement: Home emphasizes today's expenses
The system MUST prominently show today's expense total and MUST keep amounts in different currencies separate without conversion or combination. Today's date MUST follow the application's UTC calendar-date convention.

#### Scenario: Show today's expenses in multiple currencies
- **WHEN** the user has expenses dated today in more than one currency
- **THEN** the home prominently shows a separate expense total for each currency and does not display a combined total

#### Scenario: No expenses recorded today
- **WHEN** the user has no expenses dated today
- **THEN** the home shows a clear zero or empty state for today's expenses instead of a stale amount

### Requirement: Home lists only today's transactions
The system MUST show only the signed-in user's transactions whose transaction date is today in the dedicated today list. The list MUST include both income and expenses and MUST provide a clear empty state when there are no transactions today.

#### Scenario: Show today's transactions only
- **WHEN** the user has transactions dated today and on other dates
- **THEN** the today list shows all of the user's transactions dated today, including income and expenses, and excludes transactions from every other date

#### Scenario: No transactions recorded today
- **WHEN** the user has no transactions dated today
- **THEN** the today list shows a clear empty state

### Requirement: Home supports quick transaction entry
The system MUST provide a prominent home action that opens transaction entry with today's date preselected. A successfully saved transaction dated today MUST appear in the today list and update the applicable expense total.

#### Scenario: Open quick transaction entry
- **WHEN** the user activates the home quick-add action
- **THEN** transaction entry opens with today's date preselected and uses the existing transaction validation and category options

#### Scenario: Save a transaction from quick entry
- **WHEN** the user successfully saves a transaction dated today from quick entry
- **THEN** the home reflects the new transaction and updates today's expense total if the transaction is an expense

### Requirement: Home is designed mobile-first
The home MUST prioritize today's expense amount, quick-add action, and today's transaction list on small screens. These controls and content MUST remain readable, operable by touch and keyboard, and usable without horizontal page scrolling; wider layouts MUST adapt without hiding the same content.

#### Scenario: Use the home on a narrow mobile viewport
- **WHEN** the user views the home on a 360 CSS-pixel-wide viewport
- **THEN** today's amount, quick-add action, and today's list are visible in a single-column flow without horizontal page scrolling or clipped content

#### Scenario: Use the home on a wider viewport
- **WHEN** the user views the home on a wider screen
- **THEN** the layout uses the available space while keeping today's amount, quick-add action, and today's list prominent, and monthly insights are available through Financial Analysis rather than on the home