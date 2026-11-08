# GitHub Workflows

GitHub Actions workflow files belong here.

## Current workflow

- **ci.yml** runs on pushes to main, pull requests, and manual dispatch.
- It installs the committed dependency lockfile with npm ci.
- It runs Biome formatting/lint checks, Wrangler type generation and consistency checks, strict TypeScript checks, Vitest, and a Wrangler dry-run build.
- It uses read-only repository permissions and cancels superseded runs.

## Rules

- Workflow permissions must remain least-privilege.
- Never hard-code tokens or credentials in workflow files.
- Use repository secrets only when a workflow genuinely needs them.
- Deployment automation requires a documented staging and production process.

**Status:** Active. The initial quality pipeline has passed.
