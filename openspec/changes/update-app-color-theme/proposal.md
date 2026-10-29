## Why

The current light and dark palettes use tinted green backgrounds and coral accents. A white primary color in light mode and black primary color in dark mode will give the app a clearer, more neutral foundation while retaining visual distinction through coordinated secondary and accent colors.

## What Changes

- Set the app's primary theme surface to white in light mode and black in dark mode.
- Rework secondary, foreground, border, and accent colors for each mode so content remains readable and actions remain visually distinct.
- Apply the palette consistently across shared app surfaces and controls while preserving the existing light/dark mode behavior.

## Capabilities

### New Capabilities
- `app-color-theme`: Defines the app's primary, secondary, and accent color behavior in light and dark modes.

### Modified Capabilities
None. The main OpenSpec inventory has no published capabilities; this change adds a color-theme capability spec.

## Impact

- Affects shared theme tokens in `src/app/globals.css` and UI that consumes those tokens.
- No changes to data, routes, authentication, or transaction behavior are expected.