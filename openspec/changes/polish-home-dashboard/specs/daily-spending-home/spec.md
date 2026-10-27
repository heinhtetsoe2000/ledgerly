## Purpose

Provides a focused Home view for checking today's expenses and transactions. Its presentation keeps essential financial context clear while minimizing redundant copy and preserving a usable quick-entry flow on phones.

## ADDED Requirements

### Requirement: Home uses concise, functional copy
The Home page MUST omit generic introductory eyebrow and descriptive tagline copy. It MUST retain the page title, section headings, transaction labels, and useful empty or error states.

#### Scenario: Open the Home page
- **WHEN** a user opens the Home page
- **THEN** the page shows its title and relevant section labels without a generic eyebrow or descriptive tagline

### Requirement: Daily expense totals are centered and readable
The Home page MUST center each daily expense total's currency label and amount. It MUST keep totals separated by currency, and each amount MUST remain on one line at narrow viewport widths.

#### Scenario: View daily expenses in multiple currencies on a phone
- **WHEN** today's expenses include more than one currency and the Home page is viewed at a narrow viewport width
- **THEN** each currency total is centered independently, remains distinct from other currencies, and its amount does not wrap across lines

### Requirement: Home quick-add dialog remains contained on phones
The transaction-entry dialog MUST remain visually bounded within the viewport on narrow screens rather than expanding to fill the screen. If its form exceeds the available height, the dialog content MUST scroll without hiding the dialog's title or close action.

#### Scenario: Open quick-add on a narrow phone viewport
- **WHEN** a user opens transaction entry from Home on a phone
- **THEN** the dialog remains distinguishable from the backdrop with visible space around it, and its form can be reached by scrolling within the dialog when needed