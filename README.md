# 🪞 MIRROR

### See yourself. Discover others.

MIRROR is an open-source social entertainment Telegram bot that turns everyday questions into interactive experiences. Explore different perspectives, predict what the crowd thinks, challenge your friends, and discover how people around the world respond to the same questions.

**Every answer reveals a new perspective.**

<p align="center">
  <a href="https://t.me/MirrorDiscoverBot">Telegram Bot</a> ·
  <a href="https://github.com/rezg1o/mirror-bot">Source Code</a> ·
  <a href="LICENSE">MIT License</a>
</p>

---

> **Project status:** Foundation and architecture documentation are in place. The bot implementation has not started yet; planned features are not presented as available functionality.

## About the Project

MIRROR is designed to make social discovery entertaining and accessible through Telegram.

Users will be able to answer curated questions, predict which option will be most popular, compare their predictions with aggregate community results, and take part in one-to-one or group challenges.

MIRROR is an entertainment experience—not a psychological assessment, diagnostic tool, or measure of an individual's personality.

## Documentation

Start with the project map. It explains how the entire repository is organized and where each part belongs.

| Document | What it explains |
| --- | --- |
| [Project Map](docs/PROJECT_MAP.md) | The complete system map, module responsibilities, repository layout, workflows, and implementation order |
| [Product Specification](docs/PRODUCT_SPEC.md) | User journeys, commands, feature behavior, result rules, challenges, and MVP acceptance criteria |
| [Architecture](docs/ARCHITECTURE.md) | Runtime topology, webhook lifecycle, application boundaries, database access, and deployment flow |
| [Data Model](docs/DATA_MODEL.md) | Database entities, relationships, integrity constraints, and transaction boundaries |
| [Security & Privacy](docs/SECURITY.md) | Threat model, secrets, webhook security, privacy, abuse prevention, and release checklist |
| [Technology Decision](docs/adr/0001-runtime-and-database.md) | Rationale and trade-offs for the initial runtime and database |

## Planned Features

The following features describe the product vision. They are not available until implemented and tested.

### 🪞 Daily Mirror
- Discover curated interactive experiences.
- Explore questions about human choices, social thinking, and everyday opinions.
- Answer one question at a time through Telegram.
- Predict which answer will be most popular.

### 🎯 Challenges
- Create one-to-one and group question challenges.
- Invite friends through shareable Telegram links.
- Compare predictions with aggregate results.
- Join and participate through private bot chats.

### 🌍 World Results
- Explore anonymous aggregated community responses.
- Discover popular answers and unexpected outcomes.
- Browse finalized and recently completed experiences.
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
2. **Answer** — choose one of the predefined responses.
3. **Predict** — guess which response will be most popular.
4. **Discover** — view aggregate results when enough valid responses are available.
5. **Share** — invite friends to take part in a one-to-one or group challenge.

Community statistics are based on valid, completed participations. Results include a sample size and freshness context. MIRROR does not fabricate missing results or expose individual answers.

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

MIRROR is designed for broad, international use. Experiences are curated and must be suitable for a general audience, including teenagers. Challenges are question-based social experiences—not physical dares or risky activities. Predictions have no wagers, monetary stakes, or financial rewards.

## Technology

The initial MVP architecture is documented and uses:

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

See the [Architecture](docs/ARCHITECTURE.md) and [Technology Decision](docs/adr/0001-runtime-and-database.md) for responsibilities, constraints, and trade-offs.

## Project Status

**Current stage: Foundation & Architecture**

| Area | Status |
| --- | --- |
| Product vision | Defined |
| Repository and license | Created |
| Project documentation | Initial baseline published |
| Technical architecture | Documented; implementation pending |
| Database schema | Designed; migrations not started |
| Telegram bot foundation | Not started |
| Interactive experiences | Planned |
| Predictions and results | Planned |
| Challenge system | Planned |
| Privacy and data controls | Specified; implementation pending |
| Automated tests and CI | Not started |
| Public deployment | Not started |

## Roadmap

### Phase 1 — Foundation
- Establish repository structure and development standards.
- Implement the TypeScript Worker foundation.
- Add environment validation and secure configuration.
- Add database migrations and test tooling.
- Configure automated quality checks.

### Phase 2 — Bot Core
- Implement webhook validation and update idempotency.
- Implement the main entry point and navigation.
- Build Telegram menus and inline interactions.
- Add persistent user and session handling.

### Phase 3 — Social Experiences
- Implement question and answer flows.
- Add crowd predictions.
- Calculate and display threshold-aware aggregate results.

### Phase 4 — Challenges
- Support one-to-one and group challenges.
- Add secure, expiring invitation links.
- Track challenge participation and completion.

### Phase 5 — Quality & Release
- Complete automated test coverage.
- Review security, privacy, and data deletion flows.
- Deploy to staging and run acceptance tests.
- Publish the first production release.

Roadmap items may change as the project develops. The project map defines the intended implementation order.

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

These commands must not be advertised as operational until their handlers are implemented and tested.

## Security & Privacy

Security and privacy are core engineering requirements.

- Never commit bot tokens, passwords, API keys, or private credentials.
- Store secrets in secure environment-specific configuration.
- Minimize personal data collection and retention.
- Validate incoming updates and user-submitted data.
- Prevent duplicate submissions at the application and database layers.
- Keep individual responses private; publish aggregate results only.
- Provide a documented account data deletion process.

Read [Security & Privacy](docs/SECURITY.md) before contributing code that touches user data, Telegram updates, database permissions, or secrets.

## Contributing

MIRROR is intended to be developed openly. Bug reports, thoughtful feature proposals, documentation improvements, and code contributions will be welcome.

Before making a substantial change, open a GitHub issue to discuss the proposal. Development setup and contribution instructions will be added with the first code foundation.

Please keep contributions focused, tested, and consistent with the product, privacy, and data-integrity requirements.

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
