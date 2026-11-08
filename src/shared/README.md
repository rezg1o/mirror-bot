# Shared Technical Primitives

Contains small technical utilities genuinely reused across multiple modules.

Current responsibilities:
- errors/: stable typed application errors (planned).
- http/: shared HTTP response and request-boundary helpers.
- validation/: reusable runtime validation helpers (planned).
- types/: stable cross-module types (planned).

Keep this area intentionally small. Feature-specific business rules belong in their feature module, not in shared/.

**Status:** Initial JSON HTTP response helper is implemented. Other primitives are added only when reused by real features.
