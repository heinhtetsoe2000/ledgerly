## 1. Home Copy and Expense Totals

- [x] 1.1 Remove the generic Home eyebrow and descriptive tagline while retaining the page title, section headings, and useful states; verify the rendered Home content reflects those copy boundaries.
- [x] 1.2 Center each currency label and amount, and prevent long amounts from wrapping on narrow screens; verify multiple currencies and a long amount at a 360 CSS-pixel viewport without horizontal overflow.

## 2. Mobile Quick-Add Dialog

- [x] 2.1 Replace the full-screen mobile dialog sizing with bounded viewport-relative dimensions and keep the heading and close action outside the scrollable form region; verify on a short phone viewport that the dialog has visible margins and the form scrolls independently.
- [x] 2.2 Verify the dialog remains usable at a desktop viewport and preserves its existing open, close, backdrop, and focus-restoration behavior; run `npm test -- src/components/management-components.test.tsx`.