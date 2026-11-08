# Automated Tests

Tests verify MIRROR behavior and the boundaries between components.

- unit/: isolated business-rule tests.
- integration/: database, repository, Telegram adapter, and Worker tests.
- fixtures/: deterministic synthetic test data.
- helpers/: test-only factories, builders, and utilities.

Never use production bot tokens, production databases, or real user records in tests.

Every business invariant in docs/DATA_MODEL.md must gain automated coverage as the related feature is implemented.

**Status:** Test structure is prepared; no test suite is active yet.
