### Error Handling Conventions

#### Error Fallbacks
- Generic Message: All default error fallbacks must show a generic "Something went wrong" message and "An unexpected error occurred. Please try again later."
- Error Details: Provide a "Show details" toggle that reveals `error.message` and `error.stack` (if available) for troubleshooting.
- Consistency: Use consistent UI patterns for error boundaries and route-level error components.
