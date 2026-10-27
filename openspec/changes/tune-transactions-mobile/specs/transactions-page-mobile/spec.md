## Purpose

Makes transaction creation, filtering, and history review comfortable on narrow screens while preserving the existing transaction data and desktop workflows.

## ADDED Requirements

### Requirement: Transaction filters fit narrow screens
At viewport widths below 640 CSS pixels, the Transactions page MUST keep every filter and action within the viewport without horizontal page scrolling. Each filter MUST retain a visible label and remain usable by touch and keyboard.

#### Scenario: Filter transactions on a phone
- **WHEN** a user opens the Transactions page at a viewport width below 640 CSS pixels
- **THEN** search, type, category, date-range filters, and filter actions remain visible, labeled, and operable without horizontal page scrolling

### Requirement: Transaction forms are readable and touch-friendly on phones
At viewport widths below 640 CSS pixels, transaction create and edit forms MUST use a single-column layout for paired fields. Text-entry controls MUST use at least 16 CSS-pixel text, and interactive form controls MUST provide touch targets at least 44 CSS pixels in both dimensions.

#### Scenario: Create or edit a transaction on a phone
- **WHEN** a user opens a transaction form at a viewport width below 640 CSS pixels
- **THEN** paired fields stack vertically, text-entry controls use at least 16 CSS-pixel text, and form actions remain at least 44 by 44 CSS pixels

### Requirement: Transaction history remains understandable on phones
At viewport widths below 640 CSS pixels, each transaction MUST remain readable without horizontal page scrolling. Its description, type, category and date metadata, and signed amount with currency MUST retain their meaning, and the currency amount MUST remain on one line. Details and pagination actions MUST remain touch-operable.

#### Scenario: Review transaction history on a phone
- **WHEN** a user reviews transaction history at a viewport width below 640 CSS pixels
- **THEN** each transaction card presents its description, type, category/date metadata, and signed currency amount without clipping or horizontal page scrolling, with reachable details and pagination actions