# Product Modules

Each module represents one MIRROR product capability. A module owns its use cases, business rules, and feature-specific types.

Planned modules:
- users: profiles and onboarding.
- experiments: curated questions and answer options.
- participation: start/resume/complete an experience.
- predictions: crowd prediction submission and scoring.
- challenges: one-to-one and group invitations.
- results: aggregate community statistics.
- progress: private activity and achievements.
- settings: notification, language, and privacy preferences.

Modules must not depend on Telegram Update objects or build Telegram HTTP responses. The Telegram adapter calls module use cases and formats their results.

Create feature files when implementing the feature; do not add empty handlers merely to populate the tree.
