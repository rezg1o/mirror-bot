# Automated Tests

Tests verify MIRROR behavior and the boundaries between components.

- unit/: isolated business-rule tests and Worker HTTP/configuration tests.
- integration/: database, repository, Telegram adapter, and Worker boundary tests.
- fixtures/: deterministic synthetic test data.
- helpers/: test-only factories, builders, and utilities.

Never use production bot tokens, production databases, or real user records in tests.

## Current coverage

- Worker liveness endpoint and response headers.
- Runtime readiness when required provider configuration is missing.
- Explicit not-implemented response for the Telegram webhook.
- Unknown route handling and unsupported HTTP methods.
- Valid and invalid runtime configuration, including malformed and insecure Supabase URLs.

Every business invariant in docs/DATA_MODEL.md must gain automated coverage as the related feature is implemented.

**Status:** Initial Worker and configuration tests pass in GitHub Actions. Feature-specific tests will be added with their implementations.
