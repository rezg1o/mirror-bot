# Users Module

Owns the MIRROR profile linked to a Telegram numeric user ID.

Responsibilities:
- Find or create a profile during onboarding.
- Handle new and returning users.
- Manage an optional user-selected display name.
- Enforce the minimum-data profile policy.

Does not own webhook parsing, database client setup, or notification delivery.

**Status:** Planned; not implemented.
