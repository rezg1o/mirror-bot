# Application Source

All production TypeScript code belongs under src/.

- config/: validated runtime configuration.
- platform/: Telegram transport and external platform adapters.
- modules/: MIRROR features and business rules.
- infrastructure/: database and operational integrations.
- shared/: small reusable technical primitives.

Keep the Worker entry point thin. It should wire the app and delegate work to the correct boundary.

**Status:** Application source is not implemented yet.
