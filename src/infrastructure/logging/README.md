# Logging Infrastructure

Owns structured application logging and sensitive-value redaction.

Safe log fields may include correlation ID, environment, handler name, duration, outcome, and safe error code.

Never log bot tokens, webhook secrets, database keys, full Telegram payloads, invitation tokens, or private answer content.

**Status:** Planned; not implemented.
