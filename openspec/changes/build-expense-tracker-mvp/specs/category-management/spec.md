## Purpose

Allows users to organize income and expenses with categories that are private to their account and consistent with transaction type.

## ADDED Requirements

### Requirement: Users receive default categories
The system MUST provide sensible default categories for income and expenses to an account, including Food, Transportation, Shopping, Housing, Bills, Health, Entertainment, and Other for expenses, and Salary, Freelance, Business, Gifts, and Other for income.

#### Scenario: New account receives defaults
- **WHEN** a user's account is initialized for transaction tracking
- **THEN** the system makes the default income and expense categories available to that user without creating duplicate defaults

### Requirement: Users can manage their own categories
The system MUST allow an authenticated user to create and edit their own categories, including name, type, icon, and color, and MUST allow deletion of unused categories.

#### Scenario: Create or edit a category
- **WHEN** a user submits valid category details for an income or expense category
- **THEN** the system saves the category under that user and makes it available for matching transactions

#### Scenario: Delete an unused category
- **WHEN** a user deletes a category that is not assigned to any transaction
- **THEN** the system removes that category from the user's available categories

#### Scenario: Prevent deletion of an in-use category
- **WHEN** a user attempts to delete a category assigned to one or more transactions
- **THEN** the system rejects the deletion and preserves the category and transactions

### Requirement: Categories are private and type-safe
The system MUST prevent users from reading or modifying another user's categories and MUST prevent assigning a category to a transaction owned by another user or with a different transaction type.

#### Scenario: Attempt to use another user's category
- **WHEN** a user attempts to view, edit, delete, or assign another user's category
- **THEN** the system denies the operation without disclosing or changing the category

#### Scenario: Assign a category with a mismatched type
- **WHEN** a user assigns an income category to an expense or an expense category to income
- **THEN** the system rejects the assignment