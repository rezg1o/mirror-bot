# Infrastructure

Contains concrete integrations with external services and operational capabilities.

Current planned areas:
- database/: Supabase/PostgreSQL client and repository implementations.
- logging/: structured logs and sensitive-value redaction.
- rate-limit/: reusable request-frequency and abuse controls.

Feature modules should depend on narrow interfaces, not directly on provider SDKs.

**Status:** Planned; not implemented.
