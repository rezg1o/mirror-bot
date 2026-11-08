# HTTP Utilities

Contains small HTTP primitives shared by the Worker request boundary.

Current responsibility:
- JSON response construction.
- Consistent content type and no-cache headers.
- Request correlation header propagation.

Do not put route-specific business logic, Telegram payload parsing, authentication rules, or database access here.

**Status:** Initial JSON response helper is implemented.
