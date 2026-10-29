## Purpose

Defines a coherent, responsive information hierarchy for the finance workspace and its account screens. The visual refresh uses the supplied finance interface as structural inspiration while retaining the existing color theme, data, and user workflows.

## ADDED Requirements

### Requirement: Pages use a consistent, scannable hierarchy
The application SHALL present overview, transactions, reports, categories, settings, and authentication pages with clear page identity, logically grouped content, and primary actions placed near the content they affect. Each page SHALL retain the information and actions currently available on that route.

#### Scenario: User navigates between finance pages
- **WHEN** a user opens any authenticated page
- **THEN** the page identity, relevant summary or controls, and route-specific content are visually distinguishable and organized for scanning

#### Scenario: User opens an account screen
- **WHEN** a user opens sign-in, sign-up, password recovery, or password reset
- **THEN** the existing form fields, validation feedback, and account navigation remain available in a layout consistent with the shared visual hierarchy

### Requirement: Layout adapts to phone-sized viewports
The application SHALL reflow page content at narrow viewport widths without horizontal page scrolling or loss of data. At widths below 640 CSS pixels, wide data-table rows SHALL become readable cards that retain each value's label and meaning. Currency amounts SHALL remain on one line and scale down as needed; form controls SHALL use at least 16px text, and mobile interactive targets SHALL be at least 44px in each dimension. Fixed bottom navigation SHALL respect the device safe-area inset and leave enough scroll space for the final content.

#### Scenario: User reviews data on a phone
- **WHEN** a user opens a page containing wide tabular data at a viewport below 640 CSS pixels
- **THEN** each row is presented as a readable card with its values and labels intact, and no data is hidden

#### Scenario: User uses forms and navigation on a phone
- **WHEN** a user views or operates a form, action, or fixed bottom navigation at a phone-sized viewport
- **THEN** controls meet the specified text and target sizes, currency amounts do not wrap, and navigation does not cover the final page content

### Requirement: Existing theme remains unchanged
The application SHALL retain its current light and dark theme colors, theme preference behavior, and color-token values during the structural refresh.

#### Scenario: User switches the existing theme
- **WHEN** a user selects or follows the existing light, dark, or system theme preference
- **THEN** the application continues to use the current corresponding palette and preference behavior

### Requirement: Existing workflows and data remain unchanged
The structural refresh SHALL preserve the current route destinations, displayed data, transaction and category actions, report filters and exports, settings, and authentication behavior. It SHALL NOT imply or introduce payment, transfer, or other unsupported financial actions.

#### Scenario: User performs an existing route action
- **WHEN** a user adds or edits a transaction, filters or exports transactions, reviews a report, manages categories or settings, or completes an authentication flow
- **THEN** the existing action and its current data and validation behavior remain available

#### Scenario: Reference suggests an unsupported action
- **WHEN** the supplied reference shows an action that the current application does not support, such as person-to-person payment
- **THEN** the refreshed interface does not present that action as an available feature
