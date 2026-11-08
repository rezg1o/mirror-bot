# Participation Module

Owns the single participation attempt a user has for an experiment.

Responsibilities:
- Start or resume participation.
- Enforce one participation per user per experiment.
- Validate allowed state transitions.
- Coordinate answer and prediction completion.
- Prevent duplicate or invalid submissions.

A participation is completed only after both a valid answer and a valid crowd prediction exist.

**Status:** Planned; not implemented.
