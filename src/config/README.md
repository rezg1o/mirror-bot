# Runtime Configuration

Owns the Worker environment type and runtime configuration validation.

Planned responsibilities:
- Validate required bindings before handling requests.
- Separate secrets from non-secret settings.
- Define safe defaults only for optional non-secret values.
- Fail clearly when required configuration is missing.

Never put real bot tokens, passwords, database keys, or local environment files in this folder. Secret values belong in Cloudflare Worker secret storage.

**Planned file:** env.ts.
