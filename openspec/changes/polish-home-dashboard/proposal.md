## Why

The Home page has redundant introductory copy, and its daily expense total and mobile quick-add dialog do not match the intended compact, scannable layout. Tightening these presentation details will make the daily view easier to read without changing its financial or transaction behavior.

## What Changes

- Remove the generic Home eyebrow and descriptive tagline while retaining the page title, section headings, transaction labels, and useful empty or error states.
- Center the currency label and amount in each daily expense total while keeping currencies separate and amounts readable on one line.
- Keep the transaction-entry dialog bounded within the viewport on narrow screens instead of expanding it to full-screen; allow its form content to scroll when needed.

## Capabilities

### New Capabilities
- `daily-spending-home`: Refine Home copy, daily total alignment, and mobile quick-add dialog presentation while preserving existing daily activity and transaction-entry behavior.

### Modified Capabilities
None. The main OpenSpec inventory has no published capabilities; this change adds presentation requirements to the existing planned `daily-spending-home` capability path.

## Impact

- Affects the overview route, daily spending component, Home transaction dialog styles, and related component tests.
- No data, API, validation, dependency, or transaction workflow changes are expected.