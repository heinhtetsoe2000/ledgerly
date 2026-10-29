## 1. Responsive Authentication Layout

- [x] 1.1 Update auth-scoped mobile layout, field typography, and interactive target sizing below 640px while keeping the panel vertically scrollable; verify the layout remains within 360px and 390px viewports.

## 2. Regression Coverage

- [x] 2.1 Extend the auth browser workflow to check sign-in, registration, and password recovery at phone width for horizontal overflow, 16px input text, and 44px interactive targets, then verify the desktop layout at 640px or wider with `npm run test:e2e -- --grep "authentication screens"` (requires local Supabase).
- [x] 2.2 Run `npm run test -- src/components/auth-form.test.tsx` and confirm existing authentication validation, feedback, and navigation tests still pass.