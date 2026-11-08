# Database Infrastructure

Owns the server-side Supabase/PostgreSQL client and repository implementations.

Responsibilities:
- Create the server-side database client.
- Implement repositories used by product modules.
- Call database functions for atomic operations.
- Translate provider failures into safe application errors.

Schema changes belong in supabase/migrations/, not here. Never place database credentials in source files.

**Status:** Planned; not implemented.
