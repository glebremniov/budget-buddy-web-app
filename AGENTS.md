### Error Handling Conventions

#### Error Fallbacks
- Generic Message: All default error fallbacks must show a generic "Something went wrong" message and "An unexpected error occurred. Please try again later."
- Error Details: Provide a "Show details" toggle that reveals `error.message` and `error.stack` (if available) for troubleshooting.
- Consistency: Use consistent UI patterns for error boundaries and route-level error components.

### Accessibility (a11y) Conventions

#### Testing
- Tooling: Use `vitest-axe` and `@axe-core/react` for automated accessibility testing.
- Test Files: Create `.a11y.test.tsx` files for critical routes (e.g., login, dashboard, transactions).
- Execution: Run a11y tests using `pnpm test:a11y`.

#### Implementation
- Headings: Ensure heading levels are progressive (e.g., `h1` must be followed by `h2`, not `h3`).
- Interactive Elements: All icon-only buttons must include a descriptive `aria-label`.
- Semantics: Use semantic HTML elements wherever possible.
