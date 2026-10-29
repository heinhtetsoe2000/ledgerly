## Purpose

Defines the responsive placement and availability of primary navigation so users can move between core areas comfortably on both phone and desktop layouts.

## ADDED Requirements

### Requirement: Primary navigation adapts to viewport size
The application MUST present primary navigation at the bottom of the viewport on mobile layouts and retain the sidebar navigation on desktop layouts. Mobile navigation MUST remain available while page content scrolls and preserve the existing destinations and current-page indication.

#### Scenario: Mobile navigation remains at the bottom while scrolling
- **WHEN** a user views an application page at a mobile viewport and scrolls its content
- **THEN** the primary navigation remains fixed at the bottom of the viewport with the current page indicated

#### Scenario: Desktop navigation remains in the sidebar
- **WHEN** a user views an application page at a desktop viewport
- **THEN** the primary navigation remains available in the application sidebar

### Requirement: Bottom navigation does not obscure page content
The application MUST account for device safe-area insets and reserve enough page space for users to scroll the final page content above the fixed mobile navigation.

#### Scenario: Final content can be viewed above mobile navigation
- **WHEN** a user scrolls to the end of a page on a mobile device
- **THEN** the final content can be brought fully into view above the bottom navigation

#### Scenario: Navigation clears the device safe area
- **WHEN** a device reports a bottom safe-area inset
- **THEN** the mobile navigation background and interactive controls extend or offset appropriately so controls remain above the unsafe area