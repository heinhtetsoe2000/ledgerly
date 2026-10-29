## Context

The shared stylesheet defines the app palette as CSS custom properties, with a light palette on `:root` and a dark palette on `.dark`. The current primary surfaces are tinted rather than white or black, and several supporting colors are mode-specific. Theme selection is already an app behavior and should continue to work unchanged.

## Goals / Non-Goals

**Goals:**
- Use white as the primary surface in light mode and black as the primary surface in dark mode.
- Select secondary and accent colors that complement each primary surface while keeping text, borders, and interactive states legible.
- Keep palette roles semantic and consistent across the app's shared components.

**Non-Goals:**
- Change how users select or persist the current theme mode.
- Change page layouts, product behavior, or transaction workflows.
- Introduce a new theme dependency or per-page palette.

## Decisions

- Keep the existing CSS-variable theme architecture. Update its semantic color tokens rather than introducing a second palette mechanism.
- Treat the primary color as the foundational app surface: white in light mode and black in dark mode. Use contrasting foreground colors and coordinated secondary surfaces so hierarchy remains clear.
- Choose secondary and accent values as supporting colors, not substitutes for the requested primary colors. Ensure accent actions remain distinguishable from ordinary secondary surfaces in both modes.
- Audit shared UI for hard-coded colors that would conflict with the new palette and replace only those that belong to the app theme.

Alternatives considered: changing only the primary surface while leaving the existing colors unchanged could reduce contrast or make accents feel disconnected. Replacing the theme system would add unnecessary complexity because the app already uses mode-scoped CSS variables.

## Risks / Trade-offs

- [White and black surfaces can flatten hierarchy] -> Use restrained secondary surface and border tokens to separate page regions and controls.
- [Accent colors may lose contrast against a changed surface] -> Check text and control contrast in both modes and adjust accent foreground/background pairs as needed.
- [Hard-coded colors may bypass the shared palette] -> Audit shared components and verify representative pages in both modes.

## Migration Plan

No data migration or deployment sequencing is required. Rollback consists of restoring the prior values for the shared theme tokens and any directly affected hard-coded theme colors.