# ADR 0001: Initial Runtime and Database

- **Status:** Accepted as the MVP baseline
- **Date:** 2026-11-08
- **Decision owners:** Project maintainers
- **Related documents:** [Project Map](../PROJECT_MAP.md), [Architecture](../ARCHITECTURE.md), [Data Model](../DATA_MODEL.md)

## Context

MIRROR needs a publicly reachable HTTPS endpoint for Telegram updates, a persistent relational database, secure storage for bot credentials, and a workflow that does not depend on the maintainer's laptop being online.

The first release is a Telegram private-chat bot. It does not need a browser frontend, user-facing API, media processing pipeline, or a large distributed service architecture.

The project is open source, so development, local testing, secret handling, and deployment must be documented and repeatable.

## Decision

Use the following baseline for the MVP:

| Concern | Decision |
| --- | --- |
| Application runtime | Cloudflare Workers |
| Implementation language | TypeScript with strict compiler settings |
| HTTP model | Cloudflare Module Worker using Fetch API |
| Telegram update delivery | HTTPS webhook |
| Database | Supabase PostgreSQL |
| Database client | Server-side Supabase JavaScript client / Data API |
| Database writes | PostgreSQL constraints and transactional RPC functions |
| Runtime validation | Zod or an equivalent schema validator |
| Package manager | npm with committed package-lock.json |
| Tests | Vitest |
| Worker tooling | Wrangler |
| Continuous integration | GitHub Actions |

Use the current Supabase server-side secret key format (sb_secret_...) as a Worker secret. Never put that credential in browser code, Telegram messages, examples with real values, or Git history.

## Why This Decision

### Cloudflare Workers

- Provides an HTTPS runtime suitable for Telegram webhooks.
- Supports TypeScript as a first-class language.
- Supports environment bindings and encrypted Worker secrets.
- Avoids maintaining a laptop, virtual machine, or traditional server for the initial bot runtime.
- Allows the application to remain a single small deployment unit while the project is young.

### Supabase PostgreSQL

- Provides a relational database with constraints, foreign keys, and transactions.
- Fits MIRROR's relationships between users, experiments, options, participations, answers, predictions, challenges, and achievements.
- Provides a Data API that can be called from the Worker.
- Supports SQL migrations and database-side functions for atomic operations.
- Makes it possible to test data integrity at the database layer instead of relying only on application checks.

### TypeScript

- Provides static types for application boundaries and Telegram update handling.
- Works directly with the Cloudflare Workers runtime.
- Supports a small modular architecture without introducing multiple services.

### Webhooks rather than polling

Telegram's webhook model delivers updates to a public HTTPS endpoint. That matches the selected hosted Worker and avoids a continuously running polling process.

## Alternatives Considered

| Alternative | Why it is not the MVP choice |
| --- | --- |
| Long-running VPS application | Adds server maintenance and availability work that the first release does not need |
| Laptop/self-hosting | The bot would depend on the laptop and home network remaining online |
| Telegram getUpdates polling | Requires a running poller and is unnecessary for the selected webhook runtime |
| Supabase Edge Functions as the only runtime | Viable, but using Cloudflare Workers keeps the HTTP runtime and deployment model aligned with the current project plan |
| Supabase Auth | Not required for the bot-only MVP because Telegram is the user identity provider; reconsider if a website or Mini App is added |
| Separate Redis/cache/queue services | Adds operational complexity before traffic or workload justifies them |
| Microservices | Adds network boundaries and deployment complexity without a current product need |

## Consequences

### Positive

- One main application runtime and one primary database.
- Clear separation between Telegram transport and product logic.
- Relational integrity protects one-user/one-experiment participation.
- Database transactions can make answer, prediction, completion, and challenge membership atomic.
- The project can be tested locally without a production bot token.

### Trade-offs and risks

- The Worker depends on external Telegram and Supabase APIs.
- The Supabase secret key is highly privileged; it must be restricted to the Worker and protected with careful authorization checks, grants, and database constraints.
- Webhook retries require explicit idempotency.
- Free-tier limits and provider capabilities can change; deployment cost and quotas must be checked before launch.
- A single Worker is intentionally simple, but scheduled processing, queues, or additional services may be needed if the product grows.

## Architectural Rules That Follow

1. The Worker is the only trusted application client in the MVP.
2. PostgreSQL is the source of truth; do not store durable user state in Worker memory.
3. Do not use Telegram polling and webhooks simultaneously for the same bot.
4. Use versioned SQL migrations for schema changes.
5. Use transactional database operations for critical workflows.
6. Validate all external input at runtime.
7. Keep secrets in provider secret stores and outside Git.
8. Test business rules independently from Telegram and Supabase network calls.
9. Keep the domain layer independent of Worker and Telegram SDK types.
10. Do not add infrastructure until a measurable requirement justifies it.

## Revisit This Decision When

Reconsider the runtime or data services if one or more of these conditions becomes true:

- The Worker regularly exceeds CPU, subrequest, or execution constraints.
- Background jobs need durable queue semantics or scheduled fan-out.
- Database throughput or connection behavior becomes a bottleneck.
- The project adds a website or Mini App with a distinct authentication model.
- Operational cost or service limits no longer fit the expected traffic.
- A provider changes a relevant product capability, security model, or pricing model.

Any change must be recorded in a new ADR rather than silently rewriting this decision.
