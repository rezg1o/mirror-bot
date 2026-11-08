# Rate Limiting

Owns reusable request-frequency and abuse-control policies.

Responsibilities:
- Apply bounded per-user or per-action limits.
- Protect invitation lookup and repeated invalid actions.
- Return consistent rate-limit errors.
- Keep limits configurable and testable.

Do not rely only on Worker memory for rate limiting; requests may execute concurrently in separate instances.

**Status:** Planned; not implemented.
