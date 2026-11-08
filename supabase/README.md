# Supabase Database Assets

Contains version-controlled database assets for the MIRROR Supabase project.

- migrations/: ordered SQL schema and permission changes.
- seed/: deterministic development and test content.

Database structure must be reproducible from migrations. Do not rely on undocumented manual changes in the Supabase dashboard.

Never commit secret keys, production exports, or real user data.
