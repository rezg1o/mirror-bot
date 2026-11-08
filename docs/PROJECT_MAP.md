# MIRROR — Project Map

> **Document status:** Engineering baseline  
> **Version:** 1.0  
> **Project status:** Engineering foundation in progress  
> **Audience:** Contributors, maintainers, reviewers, and coding agents

## 1. Start Here

This document is the entry point for understanding the entire MIRROR codebase. For a folder-by-folder guide to the actual repository layout, start with the [Project Directory Guide](../PROJECT_STRUCTURE.md). Read the engineering documents in this order:

1. [Product Specification](PRODUCT_SPEC.md) — what the bot does and how users experience it.
2. [Architecture](ARCHITECTURE.md) — how requests move through the system and where responsibilities belong.
3. [Data Model](DATA_MODEL.md) — database entities, relationships, constraints, and transactions.
4. [Security](SECURITY.md) — secrets, webhook validation, privacy, abuse prevention, and release requirements.
5. [Technology Decision](adr/0001-runtime-and-database.md) — why the initial runtime and database were selected.

**Important:** The repository now contains the initial Worker HTTP foundation, strict tooling configuration, and first Worker tests. Telegram update processing, database access, and product features remain unimplemented. The structure below describes the target design, not completed functionality.

## 2. Project Definition

MIRROR is an English-first, Telegram-native social entertainment bot. It presents curated multiple-choice questions, lets a participant answer and predict the most popular community answer, and displays transparent aggregate results when enough valid responses exist.

### Product goals

- Make social discovery quick, understandable, and shareable.
- Let users compare their perspective with an aggregated community response.
- Support one-to-one and group question challenges through shareable Telegram links.
- Keep the experience usable entirely inside a Telegram bot chat.
- Protect individual answers while publishing aggregate statistics.

### Non-goals for the first release

- No Telegram Mini App or website.
- No Telegram group-chat bot functionality; participants interact with MIRROR in their own private bot chats.
- No user-generated questions, comments, public text submissions, or media uploads.
- No payments, wagers, cash prizes, betting, or financial stakes.
- No dangerous dares, physical stunts, or real-world risk challenges.
- No psychological diagnosis, personality assessment, or claims about what an individual is like.
- No advertising or third-party tracking in the MVP.

A “group challenge” means a shared experience completed by several people through their private chats with MIRROR. It does **not** mean that the bot must be added to a Telegram group.

## 3. Product Rules at a Glance

| Area | First-release rule |
| --- | --- |
| Interface language | English only |
| Primary interface | Telegram private chat |
| Experience format | One curated multiple-choice question per experience |
| Answer options | 3–5 predefined options |
| Participation | One completed participation per user per experiment |
| Prediction | One crowd prediction per participation |
| Results | Shown after completion only when the sample threshold is met |
| Global result threshold | 20 eligible completed participations (initial default) |
| Challenge result threshold | 5 eligible completed challenge participants (initial default) |
| Challenge types | One-to-one and group |
| Challenge content | A link to an existing curated experiment |
| User-generated content | Out of scope for MVP |
| Notifications | Opt-in; off by default |
| Public identity | No public display of individual answers |
| Data deletion | User can request deletion of account-linked data |

Thresholds are product configuration, not hard-coded UI copy. They must be visible in the result logic and covered by tests. The initial values above should be reviewed before public launch.

## 4. System Overview

### High-level architecture

~~~mermaid
flowchart TD
    U["Telegram user<br/>Private chat"] --> TG["Telegram Bot API"]
    TG -->|"HTTPS webhook"| W["Cloudflare Worker"]
    W --> V["Webhook validation<br/>schema + idempotency"]
    V --> R["Update router"]
    R --> UC["Application use cases"]
    UC --> REPO["Repositories"]
    REPO --> DB["Supabase PostgreSQL"]
    UC --> API["Telegram API client"]
    API --> TG
    DB --> REPO
~~~

### Technology baseline

| Layer | Selected technology | Responsibility |
| --- | --- | --- |
| User interface | Telegram Bot API | Messages, commands, inline keyboards, callback queries, deep links |
| Runtime | Cloudflare Workers | HTTPS webhook endpoint and application execution |
| Language | TypeScript, strict mode | Application and domain implementation |
| Database | Supabase PostgreSQL | Durable records, constraints, queries, and transactions |
| Database access | Supabase server-side client / Data API | Worker-to-database communication |
| Validation | Zod or an equivalent runtime schema validator | Validate environment, webhook payloads, and input |
| Tests | Vitest | Unit and integration tests |
| Deployment configuration | Wrangler | Local development and Worker deployment |
| CI | GitHub Actions | Formatting, linting, type checking, tests, and build verification |

The Worker is the only application runtime in the MVP. The database is the source of truth. Telegram messages and callback payloads are transport inputs, not trusted application state.

## 5. Request Lifecycle

Every Telegram interaction follows the same controlled path:

1. Telegram sends an HTTPS POST request to the configured webhook.
2. The Worker verifies the webhook secret header.
3. The Worker parses and validates the update payload.
4. The update ID is registered idempotently so Telegram retries cannot create duplicate actions.
5. The Telegram adapter identifies the update type and routes it to a handler.
6. The handler invokes an application use case.
7. The use case validates business rules and calls the relevant repository.
8. Database transactions enforce uniqueness and state transitions.
9. The Telegram adapter sends or edits the response.
10. The update is marked as processed and the webhook returns a successful HTTP response.

The domain and application layers must not depend on Telegram-specific types. This keeps business rules testable without a Telegram connection.

### Example: completing an experience

~~~mermaid
sequenceDiagram
    participant User
    participant Telegram
    participant Worker
    participant UseCase as Experience Use Case
    participant DB as PostgreSQL

    User->>Telegram: Select an answer
    Telegram->>Worker: callback_query update
    Worker->>Worker: Verify secret, validate, deduplicate
    Worker->>UseCase: submitAnswer(user, experiment, option)
    UseCase->>DB: Save answer transactionally
    DB-->>UseCase: Answer accepted
    UseCase-->>Worker: Ask for crowd prediction
    Worker->>Telegram: Edit message with prediction options
    Telegram-->>User: Prediction prompt
    User->>Telegram: Select predicted option
    Telegram->>Worker: callback_query update
    Worker->>UseCase: submitPrediction(...)
    UseCase->>DB: Save prediction and complete participation
    DB-->>UseCase: Participation completed
    UseCase-->>Worker: Result availability
    Worker->>Telegram: Show result or sample-threshold message
~~~

## 6. Application Boundaries

Keep these responsibilities separate. Do not place all logic in the webhook handler.

| Component | Owns | Must not own |
| --- | --- | --- |
| Telegram adapter | Telegram update parsing, callback data, keyboards, API calls, message formatting | Database business rules |
| Command/callback router | Mapping incoming commands and callback actions to handlers | SQL or result calculations |
| Application use cases | User-facing workflows and orchestration | Telegram HTTP details |
| Domain rules | Eligibility, completion, thresholds, prediction scoring, challenge rules | External SDKs |
| Repositories | Database reads and writes | Message composition |
| Database | Persistent state, constraints, transaction boundaries | Telegram API calls |
| Shared infrastructure | Environment validation, structured logging, rate limits, error mapping | Feature-specific policy |

### Feature modules

- **Users and onboarding:** create/find a profile, handle /start, and manage the user's basic account state.
- **Experiments:** list available experiences, load an experiment, and enforce its publication window.
- **Participation:** create and complete a user's single participation for an experiment.
- **Answers:** store the selected option and prevent changes or duplicates after submission.
- **Predictions:** store the user's predicted crowd winner and calculate correctness after an experiment is finalized.
- **Challenges:** create one-to-one or group invitations, validate invite codes, join participants, and manage expiry.
- **Results:** calculate aggregate distributions, enforce sample thresholds, and expose provisional/final result states.
- **Progress:** calculate completed experiences, finalized correct predictions, active days, and achievements.
- **Settings and privacy:** update language/notification preferences and handle data deletion requests.

## 7. Target Repository Layout

The actual folder scaffold is documented in the [Project Directory Guide](../PROJECT_STRUCTURE.md). The initial source files now include src/index.ts, src/app.ts, src/config/env.ts, and src/shared/http/json-response.ts. Product modules and transport adapters are added only when implemented and tested.

~~~text
mirror-bot/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── PROJECT_MAP.md
│   ├── PRODUCT_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── SECURITY.md
│   └── adr/
│       └── 0001-runtime-and-database.md
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── config/
│   │   └── env.ts
│   ├── platform/
│   │   └── telegram/
│   │       ├── webhook.ts
│   │       ├── client.ts
│   │       ├── types.ts
│   │       ├── update-parser.ts
│   │       ├── command-router.ts
│   │       ├── callback-router.ts
│   │       ├── keyboards/
│   │       └── messages/
│   ├── modules/
│   │   ├── users/
│   │   ├── experiments/
│   │   ├── participation/
│   │   ├── predictions/
│   │   ├── challenges/
│   │   ├── results/
│   │   ├── progress/
│   │   └── settings/
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── logging/
│   │   └── rate-limit/
│   └── shared/
│       ├── errors/
│       ├── validation/
│       └── types/
├── supabase/
│   ├── migrations/
│   └── seed/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── fixtures/
│   └── helpers/
├── scripts/
├── .env.example
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

### File ownership

- **src/index.ts** is the Cloudflare Worker entry point.
- **src/app.ts** wires dependencies and registers routes.
- **src/platform/telegram/** is the only layer that knows Telegram's update and Bot API formats.
- **src/modules/** contains feature use cases and domain rules.
- **src/infrastructure/database/** implements repository contracts and database client setup.
- **supabase/migrations/** is the version-controlled source of truth for schema changes.
- **supabase/seed/** contains deterministic development content, never production secrets.
- **tests/** mirrors the architecture and tests behavior at the correct boundary.
- **wrangler.toml** contains non-secret Worker configuration; secret values are configured separately.

## 8. Core Business Invariants

These rules must be enforced by the database as well as the application wherever possible:

1. A Telegram user maps to one MIRROR user record.
2. A user has at most one participation per experiment.
3. A participation has at most one answer.
4. A participation has at most one prediction.
5. A participation becomes completed only after both answer and prediction exist.
6. Only completed and eligible participations contribute to public results.
7. An option must belong to the same experiment as the participation.
8. A challenge can only reference a published, eligible experiment.
9. A challenge invitation can be joined only while it is active and not expired.
10. A challenge has a unique membership row per user.
11. Individual answers are never returned by public result queries.
12. A prediction is scored only against a finalized experiment result; ties are handled consistently.
13. Replayed Telegram updates and repeated button presses must not create duplicate records.
14. Deleting a user's account-linked data must remove or irreversibly anonymize their personal records according to the deletion policy.

## 9. User Interaction Contract

### Main menu

The initial menu contains:

- Daily Mirror
- Challenges
- World Results
- My Progress
- My Profile
- Settings

Every screen must provide a reliable route back to the main menu. Prefer editing the current bot message when it keeps the conversation clear; send a new message when editing would be confusing or impossible.

### Commands

The planned command names are /start, /help, /menu, /daily, /challenges, /results, /profile, /settings, and /language. A command must not be advertised as available until its handler exists and is tested.

### Callback data

Callback data must be compact, versioned, and validated. It should contain an action and opaque identifiers only—not private user data, full answer content, or authorization claims. The application must re-check ownership, state, and eligibility from the database on every callback.

## 10. Reliability and Error Handling

Use typed application errors with stable categories:

- **VALIDATION_ERROR** — malformed or unsupported input.
- **NOT_FOUND** — experiment, challenge, or resource does not exist.
- **EXPIRED** — an experience or invitation is no longer active.
- **CONFLICT** — duplicate or invalid state transition.
- **NOT_ELIGIBLE** — participation rules are not satisfied.
- **RESULTS_UNAVAILABLE** — sample threshold has not been met.
- **RATE_LIMITED** — request frequency is too high.
- **DEPENDENCY_FAILURE** — Telegram or database is temporarily unavailable.
- **INTERNAL_ERROR** — unexpected failure.

User-facing messages should be short and helpful. Logs should contain a correlation ID and safe error metadata, never bot tokens, webhook secrets, full Telegram payloads, or private answer content.

## 11. Testing Strategy

| Test layer | What it verifies |
| --- | --- |
| Unit | Pure rules, parsers, thresholds, prediction scoring, achievement criteria |
| Repository/database integration | Constraints, foreign keys, migrations, and atomic transactions |
| Telegram adapter tests | Update parsing, keyboard payloads, Bot API request/response handling |
| Worker integration | Webhook validation, routing, duplicate update behavior, HTTP responses |
| End-to-end acceptance | /start through completion, results, challenge join, settings, and deletion |

Every business invariant in Section 8 must have at least one automated test. CI must run formatting checks, linting, type checking, unit tests, and a production build. Database integration tests should run against a disposable test database, never the production project.

## 12. Configuration Contract

The application will read configuration from validated Worker bindings. Exact names are:

| Variable / secret | Type | Purpose |
| --- | --- | --- |
| TELEGRAM_BOT_TOKEN | Secret | Authorizes Bot API requests |
| TELEGRAM_WEBHOOK_SECRET | Secret | Validates incoming webhook requests |
| SUPABASE_URL | Non-secret config | Supabase project URL |
| SUPABASE_SECRET_KEY | Secret | Server-only database API credential |
| APP_ENV | Non-secret config | development, test, or production |
| LOG_LEVEL | Non-secret config | Structured logging level |
| PUBLIC_BOT_USERNAME | Non-secret config | Builds bot links and deep links |

Missing required configuration must fail startup or health validation clearly. Secrets must never be stored in Git, committed .env files, screenshots, issue reports, or source code.

## 13. Definition of Done

A feature is complete only when all relevant items are true:

- Its behavior is described in the product specification.
- Its module has a clear responsibility and typed inputs/outputs.
- Its business rules are enforced server-side.
- Database constraints protect important invariants.
- User-facing messages and failure states are defined.
- Tests cover success, invalid input, duplicate submission, and dependency failure where relevant.
- Logs do not expose secrets or private user content.
- Documentation and the project status are updated.
- CI passes on the proposed change.

## 14. Implementation Order

1. **Repository foundation:** package scripts, strict TypeScript, Worker entry point, environment validation, lint/format/test tooling, CI.
2. **Telegram transport:** webhook endpoint, secret validation, update schema, idempotency, Bot API client, command/callback routing.
3. **Database foundation:** migrations, repositories, user identity, sessions, and transaction functions.
4. **First vertical slice:** /start → main menu → one experiment → answer → prediction → threshold-aware result.
5. **Community features:** global results, progress, achievements, and settings.
6. **Challenges:** one-to-one and group invite flows, expiry, membership, and aggregate challenge results.
7. **Release hardening:** privacy deletion, rate limits, operational checks, security review, staging, and production deployment.

Build one complete vertical slice before expanding every module. Do not create a large collection of empty files or partially wired features.
