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

> **Project status:** Foundation and architecture documentation are published. The application implementation has not started. Planned features are not presented as working functionality.

## Start Here

New to the repository? Read the [Project Directory Guide](PROJECT_STRUCTURE.md) first. It explains the folder layout and where each type of file belongs.

Then follow the engineering documentation:

| Document | Purpose |
| --- | --- |
| [Project Map](docs/PROJECT_MAP.md) | System overview, responsibilities, workflows, and implementation order |
| [Product Specification](docs/PRODUCT_SPEC.md) | User journeys, commands, challenge rules, results, and MVP acceptance criteria |
| [Architecture](docs/ARCHITECTURE.md) | Runtime topology, webhook lifecycle, application boundaries, and deployment |
| [Data Model](docs/DATA_MODEL.md) | Database entities, constraints, relationships, and transactions |
| [Security & Privacy](docs/SECURITY.md) | Threat model, secret handling, privacy, and release checklist |
| [Technology Decision](docs/adr/0001-runtime-and-database.md) | Why the initial runtime and database were selected |

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

The initial MVP architecture uses:

| Layer | Technology |
| --- | --- |
| Bot interface | Telegram Bot API |
| Application runtime | Cloudflare Workers |
| Language | TypeScript |
| Database | Supabase PostgreSQL |
| Validation | Zod (planned) |
| Tests | Vitest (planned) |
| Deployment | Wrangler |
| CI | GitHub Actions |

See the [Architecture](docs/ARCHITECTURE.md) and [Technology Decision](docs/adr/0001-runtime-and-database.md) for implementation boundaries and trade-offs.

## Project Status

**Current stage: Repository Foundation & Architecture**

| Area | Status |
| --- | --- |
| Product vision | Defined |
| Repository and license | Created |
| Engineering documentation | Initial baseline published |
| Directory guides | Published |
| Technical architecture | Documented; implementation pending |
| Database schema | Designed; migrations not started |
| Telegram bot foundation | Not started |
| Interactive experiences and challenges | Planned |
| Automated tests and CI | Not started |
| Public deployment | Not started |

## Roadmap

1. **Foundation:** TypeScript Worker setup, configuration validation, database migrations, test tooling, and CI.
2. **Bot Core:** secure webhook, update idempotency, commands, menus, and persistent user state.
3. **Social Experiences:** questions, answers, predictions, and threshold-aware results.
4. **Challenges:** secure invitations, membership, expiry, and aggregate challenge results.
5. **Release:** privacy deletion, security review, staging, acceptance tests, and production deployment.

## Planned Commands

| Command | Purpose |
| --- | --- |
| /start | Start using MIRROR |
| /help | Learn how MIRROR works |
| /menu | Open the main menu |
| /daily | Discover the featured experience |
| /challenges | Create or join challenges |
| /results | Explore community results |
| /profile | View private progress |
| /settings | Manage preferences and privacy |
| /language | View language availability |

Commands must not be presented as operational until their handlers are implemented and tested.

## Security & Privacy

- Never commit bot tokens, passwords, API keys, or private credentials.
- Store secrets in secure environment-specific configuration.
- Minimize personal data collection and retention.
- Validate incoming updates and user-submitted data.
- Prevent duplicate submissions at application and database layers.
- Keep individual responses private; publish aggregate results only.
- Provide a documented account data deletion process.

Read [Security & Privacy](docs/SECURITY.md) before changing authentication, secrets, database permissions, or user data handling.

## Contributing

Bug reports, thoughtful feature proposals, documentation improvements, and code contributions will be welcome.

Before making a substantial change, open a GitHub issue to discuss the proposal. Follow the folder boundaries in [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) and the engineering rules in [docs/PROJECT_MAP.md](docs/PROJECT_MAP.md).

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
