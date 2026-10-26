## Purpose

Provides secure account access so each person can use the expense tracker with persistent sessions and private financial data.

## ADDED Requirements

### Requirement: Users can create and access accounts
The system MUST allow a person to register and sign in using an email address and password, and MUST provide a password reset flow.

#### Scenario: Successful registration
- **WHEN** a person submits valid registration details
- **THEN** the system creates an account and establishes or prompts for an authenticated session according to the authentication provider's confirmation requirements

#### Scenario: Sign in with valid credentials
- **WHEN** a registered person submits valid credentials
- **THEN** the system establishes an authenticated session that persists across page loads

#### Scenario: Password reset requested
- **WHEN** a person requests a password reset for an email address
- **THEN** the system initiates the provider's password reset flow without disclosing whether the address belongs to an account

### Requirement: Private routes require authentication
The system MUST restrict authenticated application routes and financial data operations to the signed-in user.

#### Scenario: Unauthenticated person opens a protected route
- **WHEN** a person without a valid session requests an authenticated application route
- **THEN** the system redirects the person to sign in and does not expose protected data

#### Scenario: User attempts to access another user's records
- **WHEN** an authenticated user requests records owned by another user
- **THEN** the system denies access to those records for reads and mutations

### Requirement: Users can end their sessions
The system MUST allow an authenticated user to sign out and MUST stop treating the session as authenticated after sign-out completes.

#### Scenario: Successful sign-out
- **WHEN** an authenticated user signs out
- **THEN** the system clears the active session and requires authentication before returning to protected routes