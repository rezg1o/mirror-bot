# Contributing to MIRROR

Thank you for taking an interest in MIRROR. This project values clear design, privacy, data integrity, accessible writing, and maintainable code.

## Before you start

Read these documents first:

1. [Project Directory Guide](PROJECT_STRUCTURE.md)
2. [Project Map](docs/PROJECT_MAP.md)
3. [Product Specification](docs/PRODUCT_SPEC.md)
4. [Architecture](docs/ARCHITECTURE.md)
5. [Data Model](docs/DATA_MODEL.md)
6. [Security & Privacy](docs/SECURITY.md)

For substantial changes, open an issue before writing code so the scope and expected behavior can be agreed on.

## Development requirements

- Node.js 24.x
- npm
- Git
- A code editor with TypeScript support

You do not need a production Telegram token or production database to run the test suite.

## Local setup

1. Clone the repository.
2. Install the exact project dependencies:

   ~~~bash
   npm ci
   ~~~

3. Generate Cloudflare Worker runtime types:

   ~~~bash
   npm run types:generate
   ~~~

4. Run all local quality checks:

   ~~~bash
   npm run ci
   ~~~

The first npm install generates a package-lock.json. Commit that lockfile with dependency changes so future installs can use npm ci and reproduce the dependency tree.

To run the local Worker:

~~~bash
npm run dev
~~~

The liveness endpoint is available at http://localhost:8787/health/live. The Telegram webhook is intentionally not implemented in the foundation commit.

## Local secrets

When a feature needs provider credentials:

1. Copy .dev.vars.example to .dev.vars.
2. Use development-only credentials.
3. Never paste secrets into issues, pull requests, screenshots, or source files.
4. Never use production credentials in local tests.

The real .dev.vars file is ignored by Git.

## Change workflow

1. Create a focused branch from main.
2. Make one coherent change at a time.
3. Add or update tests for the behavior.
4. Update the relevant documentation.
5. Run npm run ci.
6. Open a pull request describing the change, test evidence, and any migration or security impact.

Suggested branch names:

- feature/short-description
- fix/short-description
- docs/short-description
- refactor/short-description
- test/short-description

## Code standards

- TypeScript strict mode is mandatory.
- Validate external input at runtime.
- Keep Telegram transport code separate from business rules.
- Keep database queries inside repository implementations.
- Use database constraints and transactions for critical state changes.
- Never log credentials, full Telegram updates, invitation tokens, or private answers.
- Do not add infrastructure without a specific requirement.
- Prefer small, explicit modules over generic frameworks or premature abstractions.

## Database changes

- Add a new ordered SQL migration for every schema change.
- Never modify a migration already applied to a shared environment.
- Include constraints and indexes required by the feature.
- Test migrations against a disposable database.
- Never commit production data or credentials.

## Pull request checklist

- [ ] Scope is focused and linked to an issue when appropriate.
- [ ] Tests cover normal, invalid, duplicate, and failure behavior where relevant.
- [ ] npm run ci passes.
- [ ] Documentation reflects the new behavior.
- [ ] No secrets or personal data are included.
- [ ] Database migrations and rollback implications are documented.
- [ ] User privacy and age-appropriate content requirements are respected.

## Project language

Source code, developer documentation, commit messages, and the initial bot interface use English. Keep wording clear and suitable for an international audience.
