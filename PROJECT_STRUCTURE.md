# MIRROR — Project Directory Guide

This is the practical map of the repository. Open this file when you need to know where a new file belongs.

> **Status:** Folder guides are being established. The application code, SQL migrations, tests, and deployment workflows will be added as they are implemented. A folder guide is not proof that the feature is working.

## Directory tree

~~~text
mirror-bot/
├── .github/
│   └── workflows/              # GitHub Actions: CI and release automation
├── docs/                       # Product and engineering documentation
│   └── adr/                    # Architecture Decision Records
├── src/                        # TypeScript application source
│   ├── config/                 # Runtime bindings and validation
│   ├── platform/
│   │   └── telegram/           # Webhook, Bot API, commands, keyboards
│   ├── modules/                # MIRROR features and business rules
│   │   ├── users/              # Profiles and onboarding
│   │   ├── experiments/        # Curated questions and options
│   │   ├── participation/      # Starting/completing one experience
│   │   ├── predictions/        # Crowd predictions and scoring
│   │   ├── challenges/         # One-to-one and group invitations
│   │   ├── results/            # Aggregate statistics
│   │   ├── progress/           # Progress and achievements
│   │   └── settings/           # Preferences and privacy
│   ├── infrastructure/         # Database and operational adapters
│   │   ├── database/
│   │   ├── logging/
│   │   └── rate-limit/
│   └── shared/                 # Reusable technical primitives
│       ├── errors/
│       ├── validation/
│       └── types/
├── supabase/                   # Database assets
│   ├── migrations/             # Ordered SQL schema changes
│   └── seed/                   # Safe development/test data
├── tests/                      # Automated tests
│   ├── unit/
│   ├── integration/
│   ├── fixtures/
│   └── helpers/
├── scripts/                    # Repeatable developer/maintainer scripts
├── .env.example                # Placeholder names only; no real secrets
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── vitest.config.ts
├── wrangler.toml
├── README.md
├── CONTRIBUTING.md
└── LICENSE
~~~

## The simple rule: where does a file go?

| Put it here | When it is about |
| --- | --- |
| src/platform/telegram/ | Telegram updates, commands, callback buttons, messages, Bot API calls |
| src/modules/ | What MIRROR does: user flows, experiment rules, challenges, results |
| src/infrastructure/ | How the app connects to PostgreSQL, logs safely, and applies rate limits |
| src/config/ | Reading and validating Worker settings and environment bindings |
| src/shared/ | Small reusable types, validation helpers, and application errors |
| supabase/migrations/ | Any database schema, index, permission, or SQL function change |
| supabase/seed/ | Repeatable sample experiments and test content |
| tests/ | Automated checks for application behavior |
| docs/ | Product requirements, technical explanations, decisions, and security policy |
| scripts/ | Repeatable development and maintenance commands |
| .github/workflows/ | Automated CI and deployment workflows |

## How a Telegram update travels through MIRROR

~~~text
Telegram user
     |
     v
Telegram Bot API
     |
     v
src/platform/telegram/
     |  Verify webhook, parse update, route action
     v
src/modules/
     |  Apply MIRROR business rules
     v
src/infrastructure/database/
     |  Read/write using repository operations
     v
Supabase PostgreSQL
     |
     v
src/platform/telegram/
        Send or edit the Telegram response
~~~

## Responsibility boundaries

- Telegram-specific types and API calls stay in platform/telegram.
- Product decisions stay in modules.
- Database access stays in infrastructure/database.
- SQL schema changes stay in supabase/migrations.
- Shared utilities must remain small and genuinely reusable.
- The database is the source of truth; Worker memory is not durable storage.

## Rules for every contributor

1. Validate untrusted input at the boundary where it enters.
2. Never put SQL queries inside Telegram handlers.
3. Never let business rules depend on Telegram Update objects.
4. Use database constraints and transactions for duplicate protection and critical state changes.
5. Never commit bot tokens, database keys, real .env files, or production data.
6. Add tests for successful, invalid, duplicate, and failure paths.
7. Do not create empty source files or fake command handlers.
8. Add a folder only when its responsibility is clear.
9. Update the relevant docs when behavior or data rules change.
10. Read docs/SECURITY.md before changing authentication, secrets, permissions, or user data.

## Recommended reading order

1. README.md — what MIRROR is.
2. docs/PROJECT_MAP.md — how the system fits together.
3. docs/PRODUCT_SPEC.md — how users experience the bot.
4. docs/ARCHITECTURE.md — how requests move through the code.
5. docs/DATA_MODEL.md — how information is stored.
6. docs/SECURITY.md — how the project protects users and credentials.

**Important:** This tree is the approved project layout. Directories are introduced with their first documented responsibility; implementation files are added only when the corresponding behavior is built and tested.
