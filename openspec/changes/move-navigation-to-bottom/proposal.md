## Why

On phones, primary navigation currently takes space at the top of each page, above the content. Moving it to the bottom makes the main content easier to reach and follows a familiar mobile navigation pattern.

## What Changes

- Pin the existing primary navigation to the bottom of the viewport at mobile widths.
- Keep navigation available while page content scrolls, account for device safe-area insets, and prevent it from covering the final content.
- Preserve the desktop sidebar layout and the existing navigation destinations and active-page behavior.

## Capabilities

### New Capabilities
- `app-navigation`: Defines responsive primary navigation placement and behavior.

### Modified Capabilities

## Impact

- `src/components/app-shell.tsx`: Existing shared shell and mobile navigation wrapper.
- `src/app/globals.css`: Responsive navigation placement and mobile content clearance.
- No API, dependency, or data-model changes are expected.