# Application Source

All production TypeScript code belongs under this directory.

- config/: validated runtime bindings and environment rules.
- platform/: Telegram transport and external platform adapters.
- modules/: MIRROR product capabilities and business rules.
- infrastructure/: database and operational integrations.
- shared/: small reusable technical primitives.

The Worker entry point must remain thin. It delegates request handling to the application layer; it must not contain feature workflows or SQL.

The initial HTTP foundation is implemented. Telegram update handling and product modules remain planned.

See the README in each subdirectory before adding files.
