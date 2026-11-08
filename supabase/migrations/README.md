# Database Migrations

Every schema, constraint, index, permission, or SQL function change must be represented by a new ordered SQL migration.

Rules:
- Never rewrite a migration already applied to a shared environment.
- Keep migrations deterministic and reviewable.
- Test from an empty database and from the previous schema version.
- Document recovery steps for changes that are not safely reversible.
- Never include credentials or production user data.

**Status:** No migrations have been created yet.
