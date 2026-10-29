## Purpose

Defines the app's shared color palette and how its primary, secondary, and accent colors adapt to light and dark modes.

## ADDED Requirements

### Requirement: Primary theme surface follows the selected mode
The app MUST use white as its primary theme surface in light mode and black as its primary theme surface in dark mode. The shared theme MUST provide foreground colors with sufficient contrast against those surfaces.

#### Scenario: View the app in light mode
- **WHEN** light mode is active
- **THEN** the app's primary theme surface is white and its content remains readable

#### Scenario: View the app in dark mode
- **WHEN** dark mode is active
- **THEN** the app's primary theme surface is black and its content remains readable

### Requirement: Supporting colors coordinate with the primary surface
The app MUST use secondary and accent colors that are visually compatible with the primary surface in each mode. Secondary surfaces MUST preserve visual hierarchy, and accent colors MUST distinguish interactive emphasis while keeping their content legible.

#### Scenario: Use secondary surfaces and accent controls in either mode
- **WHEN** a user views app surfaces and interactive controls in light or dark mode
- **THEN** secondary surfaces remain distinguishable from the primary surface and accent controls remain recognizable and readable

### Requirement: Theme mode behavior remains unchanged
The app MUST preserve its existing theme selection and mode-application behavior when the color palette changes.

#### Scenario: Change the active theme mode
- **WHEN** a user switches between light and dark mode
- **THEN** the corresponding primary, secondary, and accent palette is applied without changing the existing theme-selection behavior