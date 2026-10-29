## Context

See proposal.md for motivation and specs/auth-screen-mobile/spec.md for the behavior contract. The authentication routes share `AuthForm` inside `.auth-layout`; global styles currently use a centered 420px panel with 34px padding, 42px-high inputs, and 13px input text. The existing narrow-screen override only changes panel padding. Component tests cover auth flow behavior, while the browser workflow already checks sign-in overflow and keyboard order at 390px.

## Goals / Non-Goals

**Goals:**
- Use auth-scoped responsive styles so phone sizing does not affect dashboard or management forms.
- Keep the panel centered when space permits, while allowing normal page scrolling when content exceeds the viewport height.
- Make fields and actions readable and touch-operable on narrow screens without changing form semantics or auth logic.
- Retain the current desktop styling and shared layout across all auth routes.

**Non-Goals:**
- Change authentication routes, Supabase calls, validation, or form copy.
- Redesign the authentication brand or introduce a new UI dependency.

## Decisions

- Extend the existing auth styles and mobile breakpoint rather than adding component-specific style infrastructure. The layout already has a shared owner, and scoped rules avoid changing unrelated controls.
- At phone widths, use 16px or larger input text, at least 44px dimensions for interactive controls, and reduced outer/panel spacing that still respects the viewport width. Allow labels, messages, and links to wrap naturally.
- Keep the auth layout in normal document flow with a minimum viewport-height layout rather than a fixed-height or overflow-hidden panel. This keeps longer registration and feedback states reachable when the mobile keyboard or short viewport reduces available height.
- Preserve existing form markup and semantics. Extend the browser workflow's existing 390px auth checks with field and target dimensions, and verify a desktop viewport alongside current component tests. Browser tests use the repository's existing local Supabase prerequisite.

Alternatives considered: applying global input/button sizing would alter non-auth workflows; using a fixed-height centered panel risks clipping content on short screens; changing the component structure is unnecessary for a styling-only behavior change.

## Risks / Trade-offs

- Larger controls and narrower padding increase vertical page length -> Keep the page vertically scrollable and avoid fixed-height containers.
- Link text may wrap on very narrow screens -> Keep links as separate flow content with adequate line height and target height instead of forcing a single line.
- Desktop styling could shift due to shared rules -> Scope new sizing to the existing mobile breakpoint and verify a desktop viewport.

## Migration Plan

No migration or deployment sequence is required. Rollback consists of reverting the auth-specific responsive styles and their viewport assertions; authentication behavior is unchanged.