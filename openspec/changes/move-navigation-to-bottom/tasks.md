## 1. Mobile Navigation Layout

- [x] 1.1 Pin the mobile navigation to the viewport bottom at the existing mobile breakpoint, include the bottom safe-area inset, and preserve the desktop sidebar; verify mobile and desktop placement at phone and desktop viewport widths.
- [x] 1.2 Reserve enough bottom space in mobile page content for the fixed navigation and safe area; verify the final page content can scroll fully above the bar.

## 2. Regression Coverage

- [x] 2.1 Extend the mobile finance Playwright workflow to check fixed navigation placement, all five 44px navigation targets, final-content clearance, and unchanged desktop sidebar behavior; verify with `npm run test:e2e -- --grep "mobile finance workflows"`.