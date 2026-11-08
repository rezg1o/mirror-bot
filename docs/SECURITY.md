# MIRROR — Security & Privacy

> **Status:** MVP security baseline  
> **Applies to:** Source code, CI, staging, production, database, and bot operations

## 1. Security Objectives

MIRROR must protect:

1. The Telegram bot token and webhook secret.
2. The Supabase server-side database credential.
3. User account identifiers and private settings.
4. Individual answers and predictions.
5. Challenge invitation tokens.
6. The integrity of participation counts and aggregate results.

Security is a release requirement. A feature is not complete merely because its happy path works.

## 2. Threat Model

| Threat | Example | Required control |
| --- | --- | --- |
| Webhook spoofing | A third party submits a fake update | Verify Telegram webhook secret before processing |
| Update replay | Telegram retries an update or a request is repeated | Unique update ID, processing state, and idempotent database operations |
| Callback tampering | A user edits callback data or replays an old button | Validate schema, sender, resource ownership, and current state server-side |
| Duplicate participation | A user repeatedly presses an answer button | Unique constraints and transactional writes |
| Invite guessing | Someone tries random challenge links | Cryptographically random tokens, token hashing, expiry, revocation, and rate limits |
| Secret leakage | A token is committed or pasted into a public issue | Secret scanning, rotation procedure, and no-secret logging |
| Database exposure | A privileged key is exposed in a client or repository | Server-only secret storage, restricted grants, no public access to private tables |
| Privacy leakage | An individual answer appears in a public result | Aggregate-only result queries and minimum sample thresholds |
| Spam or abuse | Repeated commands or challenge joins | Per-user cooldowns, bounded retries, and abuse monitoring |
| Unsafe content | A question encourages harmful behavior | Curated content review and explicit content exclusions |

## 3. Secrets Management

### Required secrets

- TELEGRAM_BOT_TOKEN
- TELEGRAM_WEBHOOK_SECRET
- SUPABASE_SECRET_KEY

These values must be configured as Cloudflare Worker secrets. They must not appear in:
- Source code or Git history.
- README files, documentation examples, or test fixtures.
- Public issues, pull requests, screenshots, or screen recordings.
- Client-visible configuration or Telegram callback data.
- Logs, error messages, or analytics events.

SUPABASE_SECRET_KEY must be a current Supabase server-side secret key (the sb_secret_ format), not a publishable key. It is highly privileged and must remain server-side.

### Non-secret configuration

Values such as SUPABASE_URL, APP_ENV, LOG_LEVEL, and PUBLIC_BOT_USERNAME may be stored as Worker configuration when they contain no credentials.

### Local development

- Use a local secrets file ignored by Git.
- Commit only placeholder names and safe examples.
- Never use the production bot token in local tests.
- Use a separate development bot and Supabase project where possible.
- Ensure CI uses mocks or dedicated test credentials with minimum required access.

### Rotation

If a token or secret may have been exposed:
1. Revoke or rotate it at its provider immediately.
2. Update the Worker secret.
3. Re-register the Telegram webhook if its secret changed.
4. verify the old credential no longer works.
5. Review recent logs and repository history for exposure.
6. Record the incident without copying the secret into the report.

A Telegram bot token that has ever been pasted into a chat or committed to a repository must be considered compromised and replaced before deployment.

## 4. Telegram Webhook Security

- Use HTTPS only.
- Configure Telegram setWebhook with a strong random secret token.
- Validate the X-Telegram-Bot-Api-Secret-Token header on every webhook request.
- Reject missing or incorrect secret headers.
- Validate JSON shape and supported update types.
- Accept only private-chat message interactions in the MVP.
- Do not trust message text, callback data, usernames, or start payloads.
- Use update_id for idempotency, backed by a database uniqueness constraint.
- Do not expose detailed internal error responses.
- Acknowledge unsupported valid updates safely rather than processing them as commands.

The webhook URL path is not a substitute for the secret header.

## 5. Callback and Authorization Security

A callback button is an untrusted request, not an authorization grant.

For every callback:
- Validate the action code and identifier format.
- Resolve the authenticated Telegram sender to a MIRROR profile.
- Load the referenced record from the database.
- Check that the user owns or is allowed to access the record.
- Check the current state and expiry.
- Apply the transition only once.
- Return a safe response for expired or already-completed actions.

Never put a Telegram user ID, private answer, raw invite token, or secret in callback data.

The database must enforce unique participation, answer, prediction, and challenge membership constraints even if application checks are bypassed.

## 6. Challenge Invitation Security

- Generate tokens using a cryptographically secure random generator.
- Use sufficient entropy to make guessing impractical.
- Store only a cryptographic hash of each token.
- Compare tokens only through the server-side challenge lookup flow.
- Bind a token to one challenge record.
- Enforce expiry and explicit closure.
- Allow the creator to close a challenge.
- Apply rate limits to failed or repeated token attempts.
- Do not reveal whether a guessed token is close to a valid one.
- Do not let a challenge token grant access to private profile data or individual answers.

A share link is an invitation to join one curated experience, not a general account access token.

## 7. Database Security

- The Worker is the only trusted application client in the MVP.
- Keep the Supabase secret key exclusively in Worker secret storage.
- Do not expose tables containing answers, predictions, user sessions, or invitation hashes to public clients.
- Configure database grants deliberately.
- Apply Row Level Security to schemas/tables exposed through the Supabase Data API.
- Prefer narrow repository operations and transactional database functions.
- Limit function execution privileges and review any SECURITY DEFINER function carefully.
- Use foreign keys and check constraints to protect data consistency.
- Validate ownership in application operations even when using a privileged server credential.
- Never build SQL by concatenating untrusted strings.

A privileged database key does not remove the need for application authorization, integrity constraints, and least-privilege design.

## 8. Privacy by Design

The MVP should collect the minimum information required to provide the service.

### Allowed minimum data

- Telegram numeric user ID as the account key.
- Optional user-selected display name.
- Language preference.
- Notification preference.
- Experiment participation, answer, prediction, and challenge membership needed for the service.
- Short-lived conversational state.
- Minimal webhook idempotency metadata.

### Do not collect in MVP

- Phone number or email address.
- Contact lists.
- Precise location.
- Date of birth or sensitive demographic details.
- Profile photos.
- Publicly visible individual answers.
- Unnecessary raw message content.
- Third-party advertising identifiers.

The bot must not ask questions that solicit sensitive personal information. The interface must explain that community results are aggregated and individual answers are not publicly displayed.

### Aggregation

- Global answer distribution requires at least 20 eligible completed participations by default.
- Challenge distribution requires at least 5 eligible completed challenge participants by default.
- Do not disclose small-group individual responses.
- Include sample size and result freshness.
- Clearly distinguish provisional results from final results.
- Never fabricate unavailable statistics.

Thresholds are configurable and must be reviewed before launch. These values are privacy protections, not guarantees that a particular dataset is anonymous.

### Data deletion

Provide an explicit user-controlled deletion flow with confirmation.

Deletion must:
- Remove the profile and account-linked settings.
- Remove sessions, achievements, participations, answers, predictions, and challenge memberships.
- Recompute or invalidate result snapshots affected by deleted data.
- Remove or revoke challenge tokens created by the user where appropriate.
- Avoid retaining a link between the deleted account and historical aggregates.

A retention schedule for backups, operational metadata, and deletion jobs must be documented before public release.

## 9. Content and Abuse Safety

MIRROR uses curated content in the MVP. User-generated questions, comments, and free-text submissions are disabled.

Content must be appropriate for a broad audience, including teenagers. Do not publish:
- Dangerous dares or physical stunts.
- Self-harm or suicide-related prompts.
- Sexual content.
- Violence or instructions for harm.
- Drug or intoxicant-related challenges.
- Illegal activity.
- Harassment, discrimination, or targeted humiliation.
- Requests for sensitive personal information.
- Medical, psychological, legal, or financial diagnostic claims.

Challenges are limited to answering a curated question and making a non-monetary crowd prediction. There are no wagers, stakes, cash prizes, or financial rewards.

Notifications are off by default. Do not send unsolicited invitations to a user's contacts or repeatedly pressure users to return.

## 10. Logging and Monitoring

Logs may include:
- Request correlation ID.
- Handler name.
- Environment.
- Outcome and duration.
- Safe error code.
- Retry count.

Logs must not include:
- Bot token or webhook secret.
- Supabase secret key or connection string.
- Full Telegram update payload.
- Private answer or prediction content linked to a person.
- Raw challenge invitation token.
- Full message text.

Use bounded log retention and restrict access to production logs.

## 11. CI and Repository Controls

Recommended repository protections:
- Enable secret scanning and push protection where available.
- Require CI checks before merging changes to the default branch.
- Review dependency updates.
- Keep the lockfile committed.
- Do not commit generated credentials or local environment files.
- Review SQL migrations and permission changes.
- Require review for changes to authentication, data deletion, result aggregation, or secret handling.

Security vulnerabilities should not be disclosed with exploit details in public issues. Use GitHub private vulnerability reporting if enabled for the repository.

## 12. Security Release Checklist

Before production:
- [ ] Production bot token has never been exposed and is stored as a Worker secret.
- [ ] Webhook secret is strong, random, and validated on every request.
- [ ] Supabase secret key is server-only and not present in Git history.
- [ ] Database grants and Row Level Security have been reviewed.
- [ ] Update replay and duplicate-button tests pass.
- [ ] Challenge invitation tokens are random, hashed, expiring, and revocable.
- [ ] Public result queries return aggregate data only.
- [ ] Sample thresholds are enforced by backend logic.
- [ ] Account deletion removes linked records and refreshes affected aggregates.
- [ ] Logs are redacted and do not contain secrets or private answer content.
- [ ] Curated content has passed the content-safety review.
- [ ] A credential rotation and incident response procedure exists.
- [ ] Staging smoke tests pass before production deployment.
