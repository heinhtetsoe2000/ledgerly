## Why

The shared authentication screen only reduces panel padding on small screens, while its fields and actions remain compact. A focused mobile pass will make sign-in and related account flows easier to read and operate without changing authentication behavior.

## What Changes

- Define responsive behavior for the shared authentication screen below 640 CSS pixels, keeping content within the viewport and avoiding horizontal scrolling.
- Specify readable mobile form controls and touch-sized actions across sign-in, registration, and password recovery screens.
- Preserve existing authentication, validation, feedback, and navigation behavior, as well as the desktop layout.

## Capabilities

### New Capabilities
- `auth-screen-mobile`: Define responsive, readable, and touch-friendly behavior for authentication screens on phones.

### Modified Capabilities
None. The main OpenSpec inventory has no published capabilities.

## Impact

- Affects the shared `AuthForm`, authentication layout, responsive styles, and related component or browser tests.
- No changes to authentication APIs, Supabase behavior, routes, or credential validation are expected.