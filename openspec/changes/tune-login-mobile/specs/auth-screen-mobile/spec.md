## Purpose

Makes sign-in and related account-access screens readable and comfortable to use on phones while preserving existing authentication behavior and desktop presentation.

## ADDED Requirements

### Requirement: Authentication screens fit phone viewports
At viewport widths below 640 CSS pixels, authentication screens MUST fit within the viewport without horizontal page scrolling. Content MUST remain visible when the page is taller than the viewport and MUST be reachable by normal vertical scrolling.

#### Scenario: Open an authentication screen on a phone
- **WHEN** a user opens sign-in, registration, or password recovery at a viewport width below 640 CSS pixels
- **THEN** the panel and its content fit the available width without horizontal page scrolling, and all content remains reachable by vertical scrolling

### Requirement: Authentication controls are readable and touch-friendly
At viewport widths below 640 CSS pixels, text-entry controls MUST use a font size of at least 16 CSS pixels, and every interactive control MUST provide a touch target at least 44 CSS pixels in both dimensions. Labels, validation feedback, and status messages MUST remain legible and must not overlap adjacent content.

#### Scenario: Enter account details on a phone
- **WHEN** a user enters credentials or account details on an authentication screen below 640 CSS pixels
- **THEN** fields use at least 16 CSS-pixel text, retain visible labels, and controls and navigation actions are operable with touch targets at least 44 by 44 CSS pixels

#### Scenario: Read authentication feedback on a phone
- **WHEN** validation, error, or success feedback is shown below 640 CSS pixels
- **THEN** the complete message remains readable within the viewport and does not overlap fields or actions

### Requirement: Authentication behavior remains consistent across screen sizes
Responsive presentation MUST preserve existing authentication routes, credential validation, submission feedback, and navigation behavior. At viewport widths of 640 CSS pixels or greater, the existing desktop presentation MUST remain usable.

#### Scenario: Submit authentication details at any viewport width
- **WHEN** a user submits registration, sign-in, or password recovery details at any viewport width
- **THEN** the same validation, authentication, feedback, and navigation outcomes apply as before the responsive changes