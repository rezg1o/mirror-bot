# Integration Tests

Test behavior across real application boundaries.

Examples:
- Repository operations against a disposable PostgreSQL database.
- Database constraints and transaction behavior.
- Telegram adapter request/response handling with mocked HTTP.
- Worker webhook validation and duplicate update handling.

Never point integration tests at production data or credentials.
