# 🪞 MIRROR

### See yourself. Discover others.

MIRROR is an open-source social entertainment Telegram bot built around curiosity, human perspectives, interactive questions, crowd predictions, and shared challenges.

**Every answer reveals a new perspective.**

<p align="center">
  <a href="https://t.me/MirrorDiscoverBot">Telegram Bot</a> ·
  <a href="https://github.com/rezg1o/mirror-bot">Source Code</a> ·
  <a href="LICENSE">MIT License</a>
</p>

---

> **Project status:** Engineering foundation in progress. The Worker HTTP foundation and development tooling are being established. Telegram update processing and product features are not implemented yet.

## Start Here

New contributors should begin with the [Project Directory Guide](PROJECT_STRUCTURE.md). It explains where each type of file belongs and how requests flow through the application.

Then read the engineering documents:

| Document | Purpose |
| --- | --- |
| [Project Map](docs/PROJECT_MAP.md) | System overview, responsibilities, workflows, and implementation order |
| [Product Specification](docs/PRODUCT_SPEC.md) | User journeys, commands, challenge rules, results, and MVP acceptance criteria |
| [Architecture](docs/ARCHITECTURE.md) | Runtime topology, webhook lifecycle, application boundaries, and deployment |
| [Data Model](docs/DATA_MODEL.md) | Database entities, constraints, relationships, and transactions |
| [Security & Privacy](docs/SECURITY.md) | Threat model, secret handling, privacy, and release checklist |
| [Technology Decision](docs/adr/0001-runtime-and-database.md) | Why the initial runtime and database were selected |
| [Contributing](CONTRIBUTING.md) | Local setup, code standards, and pull request workflow |

## About MIRROR

MIRROR is designed to make social discovery entertaining and accessible through Telegram.

Users will be able to answer curated questions, predict which option will be most popular, compare predictions with aggregate community results, and take part in one-to-one or group challenges.

MIRROR is an entertainment experience—not a psychological assessment, diagnostic tool, or measure of an individual's personality.

## Planned Features

The following features describe the product vision. They are not available until implemented and tested.

### 🪞 Daily Mirror
- Discover curated interactive experiences.
- Explore questions about human choices, social thinking, and everyday opinions.
- Answer one question at a time.
- Predict which response will be most popular.

### 🎯 Challenges
- Create one-to-one and group question challenges.
- Invite friends through shareable Telegram links.
- Participate through private bot chats.
- Compare predictions with aggregate results.

### 🌍 World Results
- Explore anonymous community response distributions.
- Discover popular answers and unexpected outcomes.
- Browse finalized and recent experiences.
- View sample sizes and result timestamps.

### 🏆 Progress & Achievements
- Track completed experiences.
- Follow prediction accuracy after results are finalized.
- Earn achievements for meaningful participation.
- View private activity and challenge history.

### ⚙️ Profile & Settings
- Manage notification preferences.
- Review privacy options.
- Request account-linked data deletion.
- Use an English-language interface at launch.

## How an Experience Works

1. **Discover** — open an available MIRROR experience.
2. **Answer** — choose one predefined response.
3. **Predict** — guess which response will be most popular.
4. **Discover** — view aggregate results when enough valid responses are available.
5. **Share** — invite friends to a one-to-one or group challenge.

Community statistics are based on valid, completed participations. Results include sample size and freshness context. MIRROR does not fabricate missing results or expose individual answers.

## Product Principles

| Principle | Commitment |
| --- | --- |
| Privacy | Collect only the data required to provide the service. |
| Transparency | Explain participation, result thresholds, and prediction scoring. |
| Data integrity | Exclude incomplete submissions and prevent duplicate participation. |
| User control | Provide privacy settings and a data deletion process. |
| Fairness | Keep individual answers private and publish aggregate results only. |
| Accessibility | Keep interactions simple and native to Telegram. |
| Openness | Develop in public and welcome thoughtful contributions. |

Experiences are curated for a broad audience, including teenagers. Challenges are question-based social experiences—not physical dares or risky activities. Predictions have no wagers, monetary stakes, or financial rewards.

## Technology

| Layer | Technology |
| --- | --- |
| Bot interface | Telegram Bot API |
| Application runtime | Cloudflare Workers |
| Language | TypeScript |
| Database | Supabase PostgreSQL |
| Runtime validation | Zod |
| Formatting and linting | Biome |
| Worker runtime tests | Vitest + Cloudflare Vitest plugin |
| Deployment | Wrangler |
| CI | GitHub Actions |

See the [Architecture](docs/ARCHITECTURE.md) and [Technology Decision](docs/adr/0001-runtime-and-database.md) for implementation boundaries and trade-offs.

## Current Foundation

Implemented in the initial engineering foundation:

- Cloudflare Worker entry point and application router.
- Liveness and readiness endpoints.
- Explicit placeholder response for the not-yet-implemented Telegram webhook.
- Runtime configuration validation without exposing secret values.
- Strict TypeScript configuration and generated Worker runtime types.
- Biome formatting and lint rules.
- Vitest tests running in the Workers runtime.
- GitHub Actions quality workflow.

The following are not implemented yet: Telegram update processing, the Supabase repository layer, database migrations, user onboarding, experiments, predictions, challenges, and public result calculations.

## Local Development

### Requirements

- Node.js 24.x
- npm

### Setup

~~~bash
git clone https://github.com/rezg1o/mirror-bot.git
cd mirror-bot
npm install
npm run types:generate
npm run ci
~~~

To start the local Worker:

~~~bash
npm run dev
~~~

Available foundation endpoints:

| Endpoint | Purpose |
| --- | --- |
| GET /health/live | Confirms that the Worker responds |
| GET /health/ready | Reports whether required runtime configuration is present |
| POST /telegram/webhook | Reserved route; returns 501 until Telegram handling is implemented |

### Local secrets

Copy .dev.vars.example to .dev.vars only when working on features that require provider credentials. Use development-only credentials. The .dev.vars file is ignored by Git and must never be committed.

The first npm install creates package-lock.json; commit the lockfile with dependency changes so subsequent installs can use npm ci.

## Project Status

**Current stage: Engineering Foundation**

| Area | Status |
| --- | --- |
| Product vision and requirements | Defined |
| Repository directory guide | Published |
| Architecture and data documentation | Published |
| TypeScript Worker foundation | Implemented; local verification pending |
| Runtime configuration validation | Implemented; local verification pending |
| Formatting and lint configuration | Added; local verification pending |
| Worker runtime tests | Added; local verification pending |
| GitHub Actions CI | Added; first run pending |
| Supabase schema and migrations | Designed; not implemented |
| Telegram webhook processing | Not implemented |
| User experience and product modules | Planned |
| Production deployment | Not started |

## Roadmap

1. **Engineering Foundation:** Worker, configuration, strict typing, tests, linting, and CI.
2. **Telegram Core:** webhook validation, update idempotency, commands, menus, and persistent user state.
3. **Social Experiences:** questions, answers, predictions, and threshold-aware results.
4. **Challenges:** secure invitations, membership, expiry, and aggregate challenge results.
5. **Release:** privacy deletion, security review, staging, acceptance tests, and production deployment.

## Security & Privacy

- Never commit bot tokens, passwords, API keys, or private credentials.
- Store secrets in secure environment-specific configuration.
- Minimize personal data collection and retention.
- Validate incoming updates and user-submitted data.
- Prevent duplicate submissions at application and database layers.
- Keep individual responses private; publish aggregate results only.
- Provide a documented account data deletion process.

Read [Security & Privacy](docs/SECURITY.md) before changing authentication, secrets, database permissions, or user data handling. For vulnerability reports, see [SECURITY.md](SECURITY.md).

## Contributing

Bug reports, thoughtful feature proposals, documentation improvements, and code contributions are welcome.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

MIRROR is released under the [MIT License](LICENSE).

## Links

- **Telegram:** [@MirrorDiscoverBot](https://t.me/MirrorDiscoverBot)
- **GitHub:** [rezg1o/mirror-bot](https://github.com/rezg1o/mirror-bot)
- **License:** [MIT](LICENSE)

---

<p align="center">
  <strong>MIRROR</strong><br>
  <em>Your perspective. Your world. Your MIRROR.</em>
</p>
