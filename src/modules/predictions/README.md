# Predictions Module

Owns the crowd-prediction action and scoring rules.

Responsibilities:
- Accept one predicted option per participation.
- Verify the option belongs to the experiment.
- Keep predictions separate from actual answers and votes.
- Score predictions only after final results are available.
- Handle tied top options consistently.

Predictions must never be included in answer distributions.

**Status:** Planned; not implemented.
