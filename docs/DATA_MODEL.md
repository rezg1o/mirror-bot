# MIRROR — Data Model

> **Status:** Proposed initial PostgreSQL model  
> **Database:** Supabase PostgreSQL  
> **Source of truth:** Versioned SQL migrations under supabase/migrations/

## 1. Design Principles

The database must protect product integrity even when:
- Telegram delivers the same update more than once.
- A user presses the same button repeatedly.
- Two requests for the same user arrive concurrently.
- A challenge link is opened on multiple devices.
- A Worker request fails between application steps.

Use PostgreSQL foreign keys, unique constraints, check constraints, and transactional functions for critical state changes.

All timestamps use PostgreSQL **timestamptz** and are stored in UTC. Active-day achievements use UTC calendar days in the MVP; do not collect a user's location just to calculate activity days.

## 2. Entity Relationship Overview

~~~mermaid
erDiagram
    PROFILES ||--o{ PARTICIPATIONS : completes
    PROFILES ||--|| USER_SETTINGS : configures
    PROFILES ||--o{ CHALLENGES : creates
    PROFILES ||--o{ CHALLENGE_MEMBERS : joins
    PROFILES ||--o{ USER_ACHIEVEMENTS : earns
    PROFILES ||--o| USER_SESSIONS : has
    EXPERIMENTS ||--o{ EXPERIMENT_OPTIONS : defines
    EXPERIMENTS ||--o{ PARTICIPATIONS : receives
    EXPERIMENTS ||--o{ CHALLENGES : used_by
    PARTICIPATIONS ||--o| ANSWERS : has
    PARTICIPATIONS ||--o| PREDICTIONS : has
    PARTICIPATIONS ||--o{ CHALLENGE_MEMBERS : referenced_by
    EXPERIMENTS ||--o| EXPERIMENT_RESULT_SNAPSHOTS : summarizes
    CHALLENGES ||--o{ CHALLENGE_MEMBERS : contains
    ACHIEVEMENT_DEFINITIONS ||--o{ USER_ACHIEVEMENTS : awarded_as
~~~

## 3. Tables

The definitions below describe the intended logical schema. Exact SQL types, indexes, constraints, and migration ordering must be implemented and reviewed in migrations.

### 3.1 profiles

One record per Telegram account that has started MIRROR.

| Column | Type | Rules |
| --- | --- | --- |
| id | uuid | Primary key |
| telegram_user_id | bigint | Required, unique; external Telegram identity |
| display_name | text | Optional, user-selected, bounded length |
| language | text | Required; en for MVP |
| created_at | timestamptz | Required, UTC |
| updated_at | timestamptz | Required, UTC |

Do not store Telegram username, phone number, email, profile photo, contact list, or precise location in the MVP. A user-selected display name is optional and private by default.

### 3.2 user_settings

One settings record per profile.

| Column | Type | Rules |
| --- | --- | --- |
| user_id | uuid | Primary key and FK to profiles |
| notifications_enabled | boolean | Required; default false |
| created_at | timestamptz | Required |
| updated_at | timestamptz | Required |

Language is stored on profiles so there is one authoritative value.

### 3.3 experiments

A curated question that users can answer and predict.

| Column | Type | Rules |
| --- | --- | --- |
| id | uuid | Primary key |
| slug | text | Required, unique, stable |
| title | text | Required |
| prompt | text | Required |
| category | text | Required, controlled category |
| status | text | draft, scheduled, active, closed, archived |
| min_public_sample_size | integer | Required; initial default 20; positive |
| published_at | timestamptz | Nullable until published |
| closes_at | timestamptz | Nullable for no scheduled close |
| created_at | timestamptz | Required |
| updated_at | timestamptz | Required |

An experiment is eligible for participation only while its status and publication/closing timestamps permit it.

### 3.4 experiment_options

The fixed answer choices for an experiment.

| Column | Type | Rules |
| --- | --- | --- |
| id | uuid | Primary key |
| experiment_id | uuid | Required FK to experiments |
| option_key | text | Required, unique within experiment |
| label | text | Required |
| sort_order | smallint | Required, non-negative |
| created_at | timestamptz | Required |

Constraints:
- Unique (experiment_id, option_key).
- Unique (id, experiment_id) to support composite foreign keys.
- An experiment must have 3–5 options before publication.
- Options cannot be edited after an experiment has received its first completed participation; corrections require a controlled archival/replacement process.

### 3.5 participations

The single attempt by one user to answer and predict one experiment.

| Column | Type | Rules |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | Required FK to profiles |
| experiment_id | uuid | Required FK to experiments |
| status | text | in_progress or completed |
| started_at | timestamptz | Required |
| completed_at | timestamptz | Null until completed |

Constraints:
- Unique (user_id, experiment_id).
- Unique (id, experiment_id) and (id, user_id, experiment_id) for composite references.
- A completed participation must have both an answer and a prediction.
- A participation cannot be completed twice or silently reopened.

This unique user/experiment rule means that joining another challenge for the same experiment reuses the existing participation instead of creating another vote.

### 3.6 answers

One answer per participation.

| Column | Type | Rules |
| --- | --- | --- |
| participation_id | uuid | Primary key and FK to participations |
| experiment_id | uuid | Required |
| option_id | uuid | Required |
| submitted_at | timestamptz | Required |

Use composite foreign keys so the selected option belongs to the same experiment as the participation. The primary key prevents a second answer for the same participation.

### 3.7 predictions

One crowd prediction per participation.

| Column | Type | Rules |
| --- | --- | --- |
| participation_id | uuid | Primary key and FK to participations |
| experiment_id | uuid | Required |
| predicted_option_id | uuid | Required |
| submitted_at | timestamptz | Required |

Use composite foreign keys to ensure the predicted option belongs to the same experiment. A prediction is not a vote and must never be counted in the answer distribution.

### 3.8 challenges

An invitation to participate in an existing experiment with other people.

| Column | Type | Rules |
| --- | --- | --- |
| id | uuid | Primary key |
| created_by_user_id | uuid | Required FK to profiles |
| experiment_id | uuid | Required FK to experiments |
| challenge_type | text | one_to_one or group |
| status | text | active, closed, expired |
| invite_token_hash | text | Required, unique |
| max_participants | integer | Required for one_to_one; optional/configured for group |
| created_at | timestamptz | Required |
| expires_at | timestamptz | Required |
| closed_at | timestamptz | Nullable |

Store only a cryptographic hash of the random invitation token. Do not store the raw token after the creation response has been built.

A challenge may point only to an eligible curated experiment. The initial expiry default is seven days and must be configurable.

### 3.9 challenge_members

Membership of a user in a challenge.

| Column | Type | Rules |
| --- | --- | --- |
| challenge_id | uuid | Required FK to challenges |
| experiment_id | uuid | Required; used for consistency constraints |
| user_id | uuid | Required FK to profiles |
| participation_id | uuid | Required FK to participations |
| joined_at | timestamptz | Required |

Constraints:
- Composite foreign keys ensure the challenge and participation use the same experiment.
- Composite foreign keys ensure the participation belongs to the member.
- Unique (challenge_id, user_id).
- Unique (challenge_id, participation_id).

The creator is inserted as the first member in the same transaction that creates the challenge.

### 3.10 experiment_result_snapshots

A reproducible aggregate result for an experiment.

| Column | Type | Rules |
| --- | --- | --- |
| experiment_id | uuid | Primary key and FK to experiments |
| sample_size | integer | Required, non-negative |
| option_counts | jsonb | Required; option identifiers and counts only |
| winning_option_ids | uuid[] | Required; one or more tied leaders |
| is_final | boolean | Required |
| calculated_at | timestamptz | Required |

The snapshot must not contain user IDs, Telegram IDs, individual answers, or predictions. A provisional snapshot may be recalculated. A final snapshot is immutable except through a documented integrity-correction process.

### 3.11 achievement_definitions

The catalogue of achievements.

| Column | Type | Rules |
| --- | --- | --- |
| code | text | Primary key, stable identifier |
| title | text | Required |
| description | text | Required |
| is_active | boolean | Required, default true |

### 3.12 user_achievements

The achievements earned by a profile.

| Column | Type | Rules |
| --- | --- | --- |
| user_id | uuid | Required FK to profiles |
| achievement_code | text | Required FK to achievement_definitions |
| earned_at | timestamptz | Required |

Primary key: (user_id, achievement_code). A user can earn each achievement once.

### 3.13 user_sessions

Short-lived conversational state for the bot.

| Column | Type | Rules |
| --- | --- | --- |
| user_id | uuid | Primary key and FK to profiles |
| state | text | Required, controlled state name |
| context | jsonb | Required, minimal opaque IDs only |
| expires_at | timestamptz | Required |
| updated_at | timestamptz | Required |

Do not place raw message content, personal information, secrets, or answer text in session context. Expired sessions can be safely restarted from the main menu.

### 3.14 processed_telegram_updates

Idempotency and retry metadata for webhook processing.

| Column | Type | Rules |
| --- | --- | --- |
| update_id | bigint | Primary key |
| status | text | received, processing, processed, failed |
| attempts | integer | Required, non-negative |
| lease_expires_at | timestamptz | Nullable |
| received_at | timestamptz | Required |
| processed_at | timestamptz | Nullable |
| last_error_code | text | Nullable; safe code only |

Do not store complete Telegram update payloads in this table. Apply a retention job to remove old processing metadata after the retry window has passed.

## 4. Relationship and Integrity Rules

### Participation integrity

- One profile has many participations.
- One experiment has many participations.
- A participation has zero or one answer and zero or one prediction.
- A participation is complete only when both exist.
- The selected and predicted option must belong to the participation's experiment.
- Only completed participations count toward any result.

### Challenge integrity

- A challenge belongs to one creator and one experiment.
- A challenge has one or more members.
- Each challenge member references a participation for the same experiment.
- A user can join a given challenge only once.
- A user cannot vote more than once for the same experiment, even across multiple challenges.
- A challenge invitation cannot be used after closure or expiry.

### Result integrity

- Aggregate answer counts are calculated from completed participations only.
- Predictions never contribute to answer counts.
- Public result queries return aggregate rows only.
- No answer distribution is exposed below the experiment threshold.
- Challenge result distribution is hidden until at least five eligible challenge members have completed the experiment.
- Finalized result snapshots are the only source used for final prediction scoring.

## 5. Required Transaction Boundaries

These operations should be implemented as PostgreSQL functions/RPC calls or equivalent single database transactions.

### A. Claim a Telegram update

1. Insert the update ID or lock its existing row.
2. If already processed, return duplicate.
3. If another live processing lease exists, do not run a second handler.
4. Otherwise set processing status, increment attempts, and issue a lease.
5. Mark processed only after the application action succeeds.
6. On transient failure, mark failed or allow the lease to expire according to retry policy.

### B. Start or resume participation

1. Verify the experiment is currently available.
2. Insert participation using the unique user/experiment key.
3. On conflict, return the existing participation.
4. Do not create a second attempt for the same user and experiment.

### C. Submit answer

1. Lock or safely address the participation.
2. Verify ownership and in-progress status.
3. Verify the option belongs to the experiment.
4. Insert the answer once.
5. Return the current participation state if it already exists.

### D. Submit prediction and complete

1. Verify ownership and in-progress status.
2. Verify that an answer exists.
3. Verify the predicted option belongs to the experiment.
4. Insert the prediction once.
5. Mark participation completed in the same transaction.
6. Return a stable completion result if the request is repeated.

### E. Create a challenge

1. Verify creator and experiment eligibility.
2. Generate a cryptographically random invite token in the application.
3. Store only the token hash.
4. Insert the challenge.
5. Insert the creator as a member, reusing or creating their participation.
6. Commit all changes together.
7. Return the raw token once to build the share link.

### F. Join a challenge

1. Hash the submitted token and find the challenge.
2. Lock the challenge row to avoid capacity races.
3. Verify active status, expiry, and capacity.
4. Create or resume the user's participation for the challenge's experiment.
5. Insert membership with unique constraints.
6. Return existing membership if already joined.
7. Commit together.

### G. Delete account-linked data

1. Confirm the user explicitly requested deletion.
2. Identify experiments whose aggregates are affected.
3. Delete or anonymize all account-linked records according to the approved retention policy.
4. Recompute or invalidate provisional/final snapshots that would otherwise retain the deleted contribution.
5. Remove the profile and its settings/session/achievement records.
6. Record only non-identifying operational completion metadata if required.

## 6. Indexes

Add indexes for actual query paths, including:

- profiles(telegram_user_id) — unique.
- experiments(status, published_at, closes_at) — active/featured discovery.
- participations(user_id, experiment_id) — unique.
- participations(experiment_id, status, completed_at) — result aggregation.
- answers(experiment_id, option_id) — aggregate counts.
- predictions(experiment_id, predicted_option_id) — scoring support.
- challenges(invite_token_hash) — unique token lookup.
- challenges(status, expires_at) — expiry and active challenge handling.
- challenge_members(challenge_id, user_id) — unique membership lookup.
- processed_telegram_updates(status, lease_expires_at) — retry/lease maintenance.

Do not add speculative indexes without query evidence. Review query plans as usage grows.

## 7. Data Access and Permissions

- The database is accessed by the Worker only in the MVP.
- Never ship a Supabase secret key to a browser, Telegram client, repository, or public example.
- Do not expose tables that contain individual answers or predictions to public clients.
- Use narrow repository operations and database functions for transactional writes.
- Apply grants and Row Level Security policies deliberately to any schema exposed by the Supabase Data API.
- Treat the server-side secret key as a highly privileged credential; application authorization checks and database constraints are still required.
- Never trust a user ID, option ID, challenge ID, or status supplied by callback data without checking it against the authenticated Telegram sender and database.

## 8. Deletion, Retention, and Privacy

The final published retention policy must be set before launch. The initial engineering requirements are:

- Keep only the Telegram numeric account ID needed to recognize the user.
- Do not store usernames, phone numbers, email addresses, profile photos, location, or contact information.
- Do not store raw Telegram update bodies or raw free-text messages.
- Expire short-lived conversation sessions automatically.
- Purge old webhook deduplication metadata after the retry window.
- Delete or irreversibly anonymize account-linked answers, predictions, participations, settings, achievements, and challenge memberships when requested.
- Recompute any derived aggregates affected by deletion.
- Retain an aggregate only when it can no longer be linked to a specific user.

The data deletion flow must be tested against a populated test database before production.

## 9. Migration Standards

- Every schema change is a new, ordered SQL migration.
- Never rewrite a migration that has already been applied to a shared environment.
- Prefer additive changes followed by a separate cleanup migration.
- Include constraints and indexes with the table or feature that requires them.
- Seed content must be deterministic and contain no credentials or personal data.
- Test migrations from an empty database and from the immediately previous schema version.
- Production schema changes must be applied through the documented release process.

## 10. Open Implementation Checks

Before the first production migration is merged, review:

- Exact SQL type and precision for Telegram user IDs.
- Composite foreign-key implementation for experiment/option/participation consistency.
- Transaction isolation and lock behavior for challenge capacity.
- Permission grants for application tables and RPC functions.
- Token hashing and random token generation implementation.
- Result snapshot recalculation after account deletion.
- A safe retention job for processed Telegram update metadata.
