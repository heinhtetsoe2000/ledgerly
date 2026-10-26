## Purpose

Lets users record and maintain income and expenses with accurate amounts, useful history controls, and portable filtered exports.

## ADDED Requirements

### Requirement: Users can create and maintain transactions
The system MUST allow an authenticated user to create, view, edit, and delete their own income and expense transactions. A transaction MUST include its type, positive amount, currency code, description, and transaction date; category and notes are optional.

#### Scenario: Create a valid transaction
- **WHEN** a user submits a transaction with a supported type, positive amount, currency, description, and date
- **THEN** the system saves the transaction under that user and retains the supplied currency and date

#### Scenario: Reject an invalid amount or type
- **WHEN** a user submits a transaction with a non-positive amount or a type other than income or expense
- **THEN** the system rejects the transaction and explains the invalid input

#### Scenario: Edit or delete an owned transaction
- **WHEN** a user edits or confirms deletion of a transaction they own
- **THEN** the system updates or removes only that transaction

#### Scenario: Reject access to a transaction owned by another user
- **WHEN** a user attempts to view, edit, or delete a transaction owned by another user
- **THEN** the system denies the operation without changing or disclosing the transaction

### Requirement: Transactions can be filtered and paginated
The system MUST allow users to filter their transaction history by date range, category, and type, search by description, and navigate results in pages.

#### Scenario: Apply multiple history filters
- **WHEN** a user selects one or more filters and enters a description search
- **THEN** the system displays only that user's transactions matching all selected criteria

#### Scenario: Navigate transaction pages
- **WHEN** a filtered result set exceeds the page size and the user selects another page
- **THEN** the system shows the corresponding matching transactions without including records from another user

### Requirement: Users can export filtered transactions
The system MUST allow users to download their currently filtered transaction results as CSV, including the transaction date, type, amount, currency, description, category, and notes when present.

#### Scenario: Export matching transactions
- **WHEN** a user exports a filtered transaction history
- **THEN** the downloaded CSV contains the matching records and preserves each amount's currency code without converting amounts

#### Scenario: Export with no matching transactions
- **WHEN** a user exports a filter that matches no transactions
- **THEN** the system produces a valid empty-result CSV or clearly indicates that there is nothing to export