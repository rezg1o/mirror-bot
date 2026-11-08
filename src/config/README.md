# Runtime Configuration

Owns the Worker environment contract and runtime configuration validation.

Implemented:
- Type-safe environment binding interface.
- Runtime validation for application environment and public bot username.
- HTTPS validation for Supabase URLs, with localhost-only HTTP allowed for local development.
- Presence checks for required provider secrets without returning or logging their values.

Rules:
- Keep secret values in Cloudflare Worker secret storage or ignored local .dev.vars files.
- Never place real tokens, passwords, or database keys in source code.
- Add new bindings to wrangler.toml and update the validation schema and tests together.

**Implementation:** env.ts.
