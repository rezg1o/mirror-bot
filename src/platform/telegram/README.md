# Telegram Adapter

This is the only application folder that should understand Telegram Bot API payloads and Telegram-specific update types.

Owns:
- Webhook request handling and secret verification.
- Update validation and parsing.
- Command and callback routing.
- Inline keyboards and message formatting.
- Telegram Bot API requests and response handling.

Does not own:
- Product business rules.
- Database queries or SQL.
- Result calculations.
- User authorization decisions based only on callback data.

Every callback is untrusted input and must be checked against the authenticated sender and current database state.

Planned files: webhook.ts, client.ts, types.ts, update-parser.ts, command-router.ts, callback-router.ts, keyboards/, and messages/.
