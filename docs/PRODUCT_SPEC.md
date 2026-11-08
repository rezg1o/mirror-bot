# MIRROR — Product Specification

> **Status:** MVP specification  
> **Language:** English at launch  
> **Audience:** Product, design, engineering, QA, and content contributors

## 1. Purpose

MIRROR is a Telegram-native social entertainment bot. It lets people answer curated multiple-choice questions, predict which option will be most popular, and compare their prediction with anonymous community results.

The product must feel lightweight: users should understand each screen immediately and complete a basic experience without leaving Telegram.

## 2. Target Users

### Participant
A Telegram user who wants to discover interesting questions, answer them, and compare their perspective with the community.

### Challenge creator
A participant who creates a one-to-one or group challenge and shares the invitation link with friends.

### Challenge participant
A user who joins a challenge through a Telegram deep link and completes the same curated experience.

There is no public user directory, open chat, public comment feed, or user-generated question system in the MVP.

## 3. Product Scope

### Included in MVP

- English-language bot experience.
- Private-chat onboarding and main menu.
- Curated single-question experiences with 3–5 predefined options.
- One answer and one crowd prediction per user and experiment.
- Aggregate global results with minimum sample-size protection.
- One-to-one and group challenges using shareable bot links.
- Private user progress and basic achievements.
- Notification and privacy settings.
- Account-linked data deletion.
- Automated validation, tests, and operational security.

### Explicitly out of scope

- Telegram Mini App, website, or native mobile application.
- Bot participation inside Telegram groups.
- User-created questions, public comments, free-text answers, photo, or video submissions.
- Payments, purchases, betting, wagering, cash prizes, or financial stakes.
- Physical dares, dangerous challenges, or tasks that could put participants at risk.
- Public leaderboards exposing individual users or answers.
- AI-generated psychological profiles or diagnostic interpretations.
- Multiple interface languages at launch.
- Advertising, tracking pixels, and third-party marketing analytics.

## 4. Navigation and Commands

### Main menu

| Menu item | Expected behavior |
| --- | --- |
| Daily Mirror | Open the currently featured available experience |
| Challenges | Create a challenge or join one using an invitation link |
| World Results | Browse eligible aggregate results |
| My Progress | View private activity, finalized prediction accuracy, and achievements |
| My Profile | View account summary and profile preferences |
| Settings | Manage notifications, privacy, and data deletion |

Every screen must offer a clear way to return to the main menu.

### Telegram commands

| Command | Behavior |
| --- | --- |
| /start | Create or load the user profile and show the welcome screen; process a valid challenge start payload when present |
| /help | Explain the bot and how an experience works |
| /menu | Show the main menu |
| /daily | Open the featured available experience |
| /challenges | Open challenge creation and join entry points |
| /results | Open the World Results section |
| /profile | Show the user's private profile summary |
| /settings | Open preferences and privacy controls |
| /language | Explain that English is currently the only supported language |

A command may be shown in BotFather only after its handler exists. Until then, it must be labelled as planned in documentation and must not be presented as a working feature.

## 5. Core Experience Flow

Each MVP experiment is one curated question with 3–5 fixed options.

### Step 1 — Discover

The bot displays:
- Experience title.
- Short context or instruction.
- Question.
- 3–5 answer buttons.
- A back-to-menu action.

### Step 2 — Answer

The user selects one answer.

Rules:
- The selected option must belong to the active experiment.
- The answer is saved once.
- The user cannot change a submitted answer in MVP.
- Repeated clicks must return the existing state, not create another answer.
- Do not ask for personal, sensitive, identifying, or free-text information.

### Step 3 — Predict

After answering, the bot asks the user to predict which option will receive the most community responses.

Rules:
- The prediction is selected from the same experiment options.
- A user can submit one prediction for the participation.
- The prediction is not treated as another vote.
- The prediction cannot be changed after submission in MVP.

### Step 4 — Complete

A participation is complete only after both an answer and a prediction have been saved successfully.

The answer and prediction writes must be protected by database constraints and transactional operations. A failed second step must not leave the user in a false completed state.

### Step 5 — Results

After completion:

- If the global sample threshold is met, show the aggregate distribution.
- If the threshold is not met, explain that results are still collecting responses.
- Never invent, estimate, or extrapolate missing results.
- Show the number of eligible completed responses and when the result was last updated.
- Clearly label results as provisional while the experiment is open.
- Once the experiment is closed and finalized, show final results.

The initial global minimum is **20 eligible completed participations**. This is a configurable launch default and must be reviewed before public release.

## 6. Result and Prediction Rules

### Eligible response

A response counts toward public results only when:
- The user has one valid participation for the experiment.
- A valid answer exists.
- A valid prediction exists.
- The participation is marked completed.
- The participation is not excluded by an abuse or integrity review.

Incomplete participations do not contribute to results.

### Distribution

For each answer option:

- Count eligible completed answers for that option.
- Divide by the total eligible completed answers.
- Display a percentage and the sample size.
- Ensure displayed percentages are calculated from the same result snapshot and sum to approximately 100% (rounding may produce a one-point difference).

### Provisional and final results

- **Provisional:** the experiment remains open; results can change as new eligible participations arrive.
- **Final:** the experiment is closed; a final result snapshot is stored and used for prediction scoring.

The UI must never present a provisional result as final.

### Prediction scoring

- Score a user's prediction only after the experiment has a final result.
- A prediction is correct if it matches any option tied for the highest final share.
- A prediction is incorrect if it matches none of the final top options.
- Do not count provisional predictions as final correct/incorrect progress.
- Do not change a finalized score unless an explicit integrity correction is recorded.

### Unexpected results

An “unexpected” result must be based on a defined statistic, such as the least-selected option in a finalized experiment that meets the minimum sample threshold. Do not use editorial claims such as “nobody expected this” unless the data actually supports them.

## 7. Challenge System

A challenge is an invitation to answer and predict the outcome of an existing curated experiment. A challenge never asks a participant to perform a physical task or risky dare.

### Challenge types

| Type | Participants | Purpose |
| --- | --- | --- |
| One-to-one | Creator and one invited participant | A direct shared experience |
| Group | Creator and multiple invited participants | A shared experience for a group of friends |

### Creation flow

1. The creator opens Challenges.
2. The creator selects an available experiment.
3. The creator selects One-to-one or Group.
4. MIRROR creates a challenge with a random invitation token and expiry.
5. MIRROR returns a shareable Telegram deep link.
6. The creator shares the link outside the bot.

### Join flow

1. A recipient opens the invitation link.
2. Telegram opens the MIRROR bot with a start payload.
3. MIRROR validates the token, challenge status, and expiry.
4. MIRROR creates a unique challenge membership.
5. The participant completes the linked experiment in their private bot chat.
6. MIRROR records completion for that challenge.

### Challenge rules

- Challenge links are opaque bearer invitations; store only a cryptographic hash of the invitation token.
- Never put a database ID, Telegram user ID, answer, or permission claim in the deep-link payload.
- A token must be random, unguessable, and revocable by closing the challenge.
- The creator is automatically a participant.
- A user may join a specific challenge only once.
- A user who has already completed the linked experiment may join using that existing participation; they must not vote a second time.
- Challenge participants interact with MIRROR privately, not in a shared Telegram group.
- Do not reveal another participant's individual answer.
- Challenge result distributions are shown only when at least 5 eligible challenge participants have completed the experience.
- One-to-one participants may see their own finalized prediction outcome. Do not expose the other participant's private answer.
- Challenges expire after a configurable period; the initial default is 7 days.
- The creator may close a challenge early.
- No monetary stakes, betting, or prizes are supported.

## 8. World Results

The World Results section is intended to contain:

- **Popular Answers:** options with the highest share in eligible finalized experiments.
- **Unexpected Results:** low-frequency options in finalized experiments with sufficient sample size.
- **Trending Experiences:** experiments with a meaningful increase in valid completions over a defined time window.
- **Recent Results:** recently finalized experiences.

For MVP, prioritize Popular Answers and Recent Results. Add trend calculations only after reliable event and result data exists.

Do not compare results across different experiment IDs or materially different question wording. Translations added in a future release must map to the same canonical experiment only when the meaning and answer options are equivalent.

## 9. Progress and Achievements

Progress is private to the account by default.

### Planned metrics

- Completed experiences.
- Finalized correct predictions.
- Prediction accuracy, calculated only from scored predictions.
- Challenges joined and completed.
- Distinct active days.
- Earned achievements.

Prediction accuracy must define its denominator: finalized predictions only. Pending and provisional predictions are excluded.

### Initial achievements

| Achievement | Rule |
| --- | --- |
| First Reflection | Complete the first experience |
| Curious Mind | Complete 5 experiences |
| Social Explorer | Complete the first challenge |
| Crowd Reader | Earn 5 correct finalized predictions |
| Regular Visitor | Be active on 7 distinct calendar days |

Achievements must reward meaningful participation, not spam, rapid clicking, or inviting people who do not want to join.

## 10. Profile and Settings

### Profile

Show only the information needed for the service:
- Optional user-selected display name.
- Join date.
- Private activity summary.
- Achievements.

Do not require a real name, phone number, email address, profile photo, or precise location.

### Settings

- Language: English at launch.
- Notifications: off by default; user may opt in.
- Privacy: explain what data is stored and what aggregate results mean.
- Delete my data: start a clear confirmation flow, then remove account-linked data.
- Help: show usage and support information.

A user must be able to use the core experience without enabling notifications or sharing their profile.

## 11. Content Requirements

All MVP content is curated and reviewed before publication.

Content must:
- Be suitable for a broad, international audience, including teenagers.
- Avoid requests for sensitive personal data.
- Avoid harassment, discrimination, humiliation, or targeting protected groups.
- Avoid sexual content, dangerous dares, self-harm, violence, drugs, or illegal activity.
- Avoid medical, psychological, legal, or financial diagnosis and advice.
- Use clear, neutral wording that can be understood by non-native English speakers.
- Provide answer options that are distinct, balanced, and mutually understandable.
- Avoid leading wording that manipulates the answer distribution.

Do not introduce user-generated content until moderation, reporting, review, and abuse-handling systems are designed and implemented.

## 12. Notifications

- Notifications are disabled by default.
- The user must explicitly opt in.
- No unsolicited invitation messages are sent to contacts.
- No repeated reminders or engagement pressure.
- Every notification type must have a clear purpose and a settings control.
- Respect Telegram's block/unblock state and handle delivery failures safely.

## 13. Privacy and Data Deletion

- Use the Telegram numeric user ID as the external account identifier.
- Do not use a Telegram username as a stable identity key.
- Store only an optional user-selected display name, language, settings, and records needed for the feature.
- Do not retain raw message text or full webhook payloads.
- Keep individual answers private.
- Public results use aggregate data only and must respect sample thresholds.
- A deletion request must remove account-linked profile, participation, answer, prediction, challenge-membership, session, and achievement data.
- Recompute or invalidate derived result snapshots when deletion changes their source data.
- Retain only aggregate data that is demonstrably no longer linkable to a user, subject to the published retention policy.

The exact retention schedule and user-facing privacy notice must be approved before public launch.

## 14. Required User-Facing States

Every workflow must define its success, empty, and failure states.

| Situation | Required response |
| --- | --- |
| First start | Welcome message and main menu |
| Returning user | Main menu or valid deep-link destination |
| No active experience | Explain that no experience is available and return to menu |
| Answer saved | Confirm and show prediction step |
| Duplicate answer click | Show the current saved state without creating a second answer |
| Prediction saved | Confirm completion |
| Results below threshold | Explain that more responses are needed |
| Results available | Show sample size, distribution, and provisional/final label |
| Experiment closed | Explain that participation is no longer available |
| Invalid challenge link | Explain that the invitation is invalid or unavailable |
| Expired challenge | Explain expiry and return to Challenges |
| Already joined | Resume the existing challenge state |
| Duplicate challenge join | Return the existing membership |
| Notifications disabled | Confirm that no notifications will be sent |
| Deletion requested | Explain what will be deleted and ask for explicit confirmation |
| Temporary service failure | Give a retry-safe message without losing saved progress |

## 15. MVP Acceptance Criteria

The MVP is ready for release only when:

- A new user can start the bot and reach the main menu.
- All visible commands and buttons perform their documented actions.
- A user can complete one experiment with an answer and prediction.
- Duplicate updates and repeated button clicks cannot create duplicate participation, answer, prediction, or challenge membership.
- Incomplete participations are excluded from public results.
- Result thresholds are enforced and shown accurately.
- Provisional and final results are clearly distinguished.
- Final prediction scoring handles ties consistently.
- One-to-one and group challenge links can be created, joined, expired, and closed.
- Challenge results never expose individual answers.
- Profile, settings, notification opt-in, and data deletion flows work.
- The interface is English-only and all text is reviewed.
- Content meets the requirements in Section 11.
- Automated tests, CI, security review, and deployment checks pass.
