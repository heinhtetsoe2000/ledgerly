## Purpose

Lets users maintain the account preferences that personalize transaction entry and the appearance of the expense tracker.

## ADDED Requirements

### Requirement: Users can manage profile and currency preferences
The system MUST allow a user to view and update their display name and default currency. The default currency MUST be used to prefill new transactions and MUST NOT change the currency of existing transactions.

#### Scenario: Update display name and default currency
- **WHEN** a user saves valid profile and currency preferences
- **THEN** the system stores those preferences for that user and uses the selected currency for future transaction defaults

#### Scenario: Change default currency with existing transactions
- **WHEN** a user changes their default currency
- **THEN** existing transactions retain their original currency codes and amounts

#### Scenario: Access another user's settings
- **WHEN** a user attempts to read or change another user's settings
- **THEN** the system denies the operation without disclosing or changing those settings

### Requirement: Users can choose a theme preference
The system MUST allow a user to select a supported theme preference and retain it across sessions.

#### Scenario: Save a theme preference
- **WHEN** a user selects and saves a supported theme
- **THEN** the system applies that theme and restores it on a later visit