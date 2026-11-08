# Development and Maintenance Scripts

Contains repeatable commands for local setup, validation, migrations, and controlled maintenance tasks.

Every script must:
- Have a clear documented purpose.
- Validate required inputs.
- Fail safely with a meaningful exit code.
- Avoid destructive production behavior by default.
- Never print or store secrets.

Do not add a script for a one-off action unless it is expected to be repeated.
