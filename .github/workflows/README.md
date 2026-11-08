# GitHub Workflows

GitHub Actions workflow files belong here.

The initial CI workflow is defined in ci.yml. Its checks include:
- Install locked dependencies.
- Check formatting and lint rules.
- Run TypeScript type checking.
- Run unit and integration tests.
- Build the Cloudflare Worker.

Deployment workflows are added only after staging and production deployment are documented.

Never hard-code tokens or credentials in workflow files. Use least-privilege GitHub permissions and repository secrets only when required.

**Status:** CI workflow added; first successful run is pending.
