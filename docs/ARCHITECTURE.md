# MIRROR — Architecture

> **Status:** Proposed MVP architecture  
> **Runtime:** Cloudflare Workers  
> **Language:** TypeScript  
> **Database:** Supabase PostgreSQL

## 1. Architectural Goals

The architecture must be understandable, testable, inexpensive to operate at small scale, and safe to extend.

Primary goals:

- One small server-side application with a clear entry point.
- A strict separation between Telegram transport, application workflows, domain rules, and persistence.
- PostgreSQL as the source of truth for all user and product state.
- Database-enforced uniqueness and transactional completion.
- Idempotent processing of Telegram update retries and repeated button presses.
- No secrets or privileged database credentials in client-visible code.
- Automated tests that do not require a live Telegram bot.

## 2. Runtime Topology

~~~mermaid
flowchart TB
    subgraph Telegram
      USER["Telegram user<br/>Private chat"]
      API["Telegram Bot API"]
      USER --> API
    end

    subgraph Edge["Cloudflare edge"]
      WEBHOOK["Worker webhook route"]
      GUARD["Secret validation<br/>payload validation"]
      IDEM["Update idempotency"]
      ROUTER["Command / callback router"]
      APP["Application use cases"]
      TGBOT["Telegram API client"]
      WEBHOOK --> GUARD --> IDEM --> ROUTER --> APP
      APP --> TGBOT
    end

    subgraph Data["Supabase project"]
      REST["Supabase Data API"]
      PG["PostgreSQL"]
      REST --> PG
    end

    API -->|"HTTPS POST update"| WEBHOOK
    TGBOT -->|"HTTPS Bot API request"| API
    APP --> REST
    PG --> APP
~~~

The Worker is stateless between requests. Durable state belongs in PostgreSQL, not module-level variables, memory caches, or callback payloads.

## 3. Layered Design

### 3.1 Transport layer — Telegram adapter

Location: **src/platform/telegram/**

Responsibilities:

- Accept and validate Telegram Update objects.
- Verify the configured webhook secret header.
- Parse supported message and callback-query updates.
- Route commands and callback actions.
- Build inline keyboards and user-facing messages.
- Call Telegram Bot API methods.
- Translate Telegram API failures into application-level errors.

It must not calculate result distributions, decide challenge eligibility, or perform raw database writes.

### 3.2 Application layer — use cases

Location: **src/modules/**

A use case represents one user-visible operation, for example:

- Start or resume a user session.
- Load the featured experiment.
- Submit an answer.
- Submit a crowd prediction and complete participation.
- Create or join a challenge.
- Retrieve eligible results.
- Read private progress.
- Change notification settings.
- Delete account-linked data.

Use cases coordinate domain rules and repositories. They must not depend on Telegram SDK types or HTTP request objects.

### 3.3 Domain layer — business rules

Domain rules should be pure functions or small domain services wherever possible.

Examples:

- Is this experiment open for participation?
- Is this answer option part of this experiment?
- Is this participation complete?
- Is the public sample threshold met?
- Is a prediction correct against the final result?
- Is a challenge join allowed?
- Which achievement criteria are satisfied?

Pure domain rules are easy to test and should not make network calls.

### 3.4 Persistence layer — repositories

Location: **src/infrastructure/database/**

Repositories provide typed operations such as:

- Find or create a profile by Telegram user ID.
- Load an active experiment and its options.
- Create or resume participation.
- Submit answer and prediction.
- Claim a Telegram update.
- Create or join a challenge.
- Load public aggregate results.
- Load private progress.
- Delete account-linked data.

Feature code must not construct arbitrary database URLs or duplicate SQL in Telegram handlers.

## 4. Webhook Contract

### Endpoint

- Method: HTTPS POST
- Path: /telegram/webhook
- Provider: Telegram setWebhook
- Accepted update types in MVP: message and callback_query
- Other update types: safely ignore and acknowledge unless a later feature explicitly enables them.

### Verification

Telegram's webhook secret token must be configured when setWebhook is called. On every request, compare the incoming **X-Telegram-Bot-Api-Secret-Token** header with the configured secret. Reject requests with a missing or invalid secret before parsing business input.

Do not rely on an obscure URL path as the only authentication mechanism. Never log the supplied header.

### Validation

Validate at runtime:
- HTTP method and path.
- Request body size.
- JSON parsing.
- Presence and type of update_id.
- Supported update shape.
- Private-chat requirement for message interactions.
- Allowed command and callback action.
- Identifier format and length.

Treat all message text, callback data, and start payloads as untrusted input.

### Idempotency

Telegram includes a unique update_id that is useful for ignoring repeated updates. Store update processing state in a table with a unique update ID.

Recommended state model:

- **received** — update accepted and registered.
- **processing** — a worker invocation owns a short processing lease.
- **processed** — application action completed successfully.
- **failed** — processing failed and may be retried after the lease/retry policy permits.

The claim operation must be atomic. A duplicate update already marked processed must return an HTTP success without repeating the business action. A concurrent update that is still being processed must not run the same action in parallel.

Business writes remain independently idempotent: database uniqueness constraints are the final protection if a request is retried after a partial failure.

Do not store full raw Telegram payloads in the update-deduplication table.

### Response behavior

- Return a success response after a supported update has been processed or safely identified as a duplicate.
- Return a retryable non-success response for transient failures that prevented processing.
- Do not return internal stack traces or database details to Telegram.
- Unknown but valid update types should be acknowledged and ignored to avoid repeated delivery.

## 5. Telegram Interaction Adapter

### Supported interactions

- Text commands.
- Callback queries from inline keyboards.
- Bot deep-link start payloads for joining challenges.
- Message send/edit operations needed by the conversational UI.

No inline mode, Mini App, payments, media upload, or group-chat commands are required in the MVP.

### Callback data

Telegram limits InlineKeyboardButton callback_data to **1–64 bytes**. Keep callback values compact and versioned, for example an action code plus an opaque record identifier.

Callback data must not contain:
- Telegram user IDs.
- Raw answer text.
- Authorization claims.
- Secret invitation tokens.
- Private profile information.

Every callback must be checked against the authenticated sender, current database state, and permitted transition. A button is not proof that the action is valid.

Always answer callback queries so Telegram clients do not leave the loading indicator active. Use message editing where it improves conversational continuity.

### Telegram API client

A single client module should:
- Build Bot API requests using the server-side bot token.
- Parse Telegram's standard response envelope.
- Apply bounded retries only to safe operations.
- Map API errors to typed failures.
- Avoid logging request URLs containing the bot token.
- Handle blocked-bot and chat-unavailable responses without crashing the Worker.

The token appears in the Telegram API URL path, so request URLs must be redacted before logging.

## 6. Database Access and Transactions

The Worker communicates with Supabase through the server-side Data API/client. The Supabase secret key is privileged and must exist only as a Worker secret.

Use PostgreSQL constraints and transaction functions for operations that must be atomic. Do not implement critical workflows as several unprotected client-side steps.

Recommended transactional operations:

| Operation | Atomic responsibility |
| --- | --- |
| Claim Telegram update | Insert or lease a unique update ID |
| Start participation | Create or retrieve the user's unique participation |
| Submit answer | Verify experiment and option ownership; insert one answer |
| Complete participation | Verify answer and prediction exist; mark completed once |
| Create challenge | Verify experiment is available; create challenge and creator membership |
| Join challenge | Validate token/status/expiry; create membership once |
| Finalize experiment | Freeze result counts and mark experiment finalized |
| Delete user data | Remove dependent personal records and invalidate affected aggregates |

Use database migrations as the only normal way to change schema. Do not make undocumented manual production schema edits.

## 7. Result Computation

The database should expose a narrow, typed repository operation or SQL function for aggregate results.

Rules:

1. Count only completed, eligible participations.
2. Exclude duplicate, incomplete, invalid, or integrity-flagged rows.
3. Calculate each option's count and percentage from the same snapshot.
4. Return no option distribution below the configured minimum sample size.
5. Mark an open experiment's result as provisional.
6. Freeze a final snapshot when the experiment is closed.
7. Score predictions only against the final snapshot.
8. Treat all top options as correct when the final distribution is tied.

Never expose a query that returns individual answers to the public-results feature.

## 8. Challenge Link Handling

A challenge link opens the bot with a start payload.

The application must:
- Parse the payload using a strict format.
- Resolve it to a stored hash of a random invitation token.
- Reject unknown, revoked, closed, or expired tokens.
- Verify the challenge has remaining capacity.
- Prevent duplicate membership.
- Ensure the current experiment is still valid.
- Never accept a database ID or user-supplied permission flag as authorization.

Store the invitation token hash, not the raw token. The raw token is returned only at creation time so the creator can share the link.

## 9. Configuration and Environment

Validate all configuration once per Worker request boundary or during app initialization using a typed schema.

| Binding | Required | Exposure |
| --- | --- | --- |
| TELEGRAM_BOT_TOKEN | Yes | Worker secret only |
| TELEGRAM_WEBHOOK_SECRET | Yes | Worker secret only |
| SUPABASE_URL | Yes | Worker configuration |
| SUPABASE_SECRET_KEY | Yes | Worker secret only |
| APP_ENV | Yes | Worker configuration |
| LOG_LEVEL | No | Worker configuration |
| PUBLIC_BOT_USERNAME | Yes | Worker configuration |

Use Wrangler-generated runtime types for the Worker configuration. Keep generated type definitions separate from hand-written environment types.

Local development must use a local secrets file ignored by Git. The example environment file may contain placeholders only.

## 10. Error Model

Use a shared error type with:
- A stable error code.
- A safe user-facing message key.
- A retryable/non-retryable classification.
- Optional internal cause metadata.

Do not expose SQL errors, stack traces, secrets, or internal service names to users.

Transient Telegram or database failures should not cause a completed participation to be submitted twice. Persist domain state before sending a user confirmation where possible, then ensure the response can be safely retried or resumed.

## 11. Observability

Use structured logs with:
- Timestamp.
- Environment.
- Correlation ID.
- Handler/use-case name.
- Safe error code.
- Duration and outcome.

Never log:
- Bot token or webhook secret.
- Supabase secret key or connection strings.
- Full Telegram update bodies.
- Raw answers or predictions linked to a user.
- Challenge invitation tokens.
- User-selected private display names unless essential for an explicit diagnostic.

A health endpoint may return a minimal status and build version. It must not disclose environment values, secrets, internal database details, or user data.

## 12. Testing Boundaries

### Unit tests

Test pure business rules without network access:
- Participation completion.
- Sample-threshold logic.
- Result percentages and rounding.
- Tied winning options.
- Prediction scoring.
- Challenge capacity, status, and expiry.
- Achievement criteria.
- Command and callback parsers.

### Adapter tests

Mock Telegram API calls and test:
- Valid and malformed update parsing.
- Bot API success and failure envelopes.
- Callback query acknowledgement.
- Safe token redaction.
- Message and keyboard payload construction.

### Database integration tests

Use a disposable PostgreSQL/Supabase test environment and verify:
- Unique constraints.
- Foreign-key consistency.
- Atomic submission.
- Duplicate update claim behavior.
- Challenge membership uniqueness.
- Final result snapshots.
- Data deletion cascades and aggregate invalidation.

### Worker integration tests

Test:
- Correct webhook secret acceptance.
- Missing/invalid secret rejection.
- Unsupported HTTP method.
- Malformed JSON.
- Duplicate update.
- Transient dependency failure.
- Private-chat restrictions.

## 13. Deployment Flow

1. Create the Cloudflare Worker project and configure non-secret bindings.
2. Configure the Supabase project and apply versioned migrations.
3. Set Worker secrets through Wrangler/Cloudflare dashboard.
4. Deploy to a staging Worker.
5. Register the Telegram webhook using the staging URL and webhook secret.
6. Run smoke tests with a non-production test bot.
7. Verify logs, retries, duplicate handling, and database integrity.
8. Deploy the production Worker.
9. Register the production webhook and verify the bot's health.
10. Keep rollback instructions and a documented secret-rotation procedure.

Do not use the production bot token in local test fixtures, CI, or screenshots.

## 14. Official References

- [Telegram Bot API — Getting updates and webhooks](https://core.telegram.org/bots/api#making-requests-when-getting-updates)
- [Telegram Bot API — setWebhook](https://core.telegram.org/bots/api#setwebhook)
- [Telegram Bot API — InlineKeyboardButton](https://core.telegram.org/bots/api#inlinekeyboardbutton)
- [Cloudflare Workers — TypeScript](https://developers.cloudflare.com/workers/languages/typescript/)
- [Cloudflare Workers — Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Supabase — Database overview](https://supabase.com/docs/guides/database/overview)
- [Supabase — Data REST API](https://supabase.com/docs/guides/api)
