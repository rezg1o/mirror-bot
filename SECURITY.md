# Security Policy

Security is a core requirement for MIRROR.

## Supported development state

The project is currently in its foundation stage and is not yet a production bot. Do not send real user data or production credentials to this repository.

## Reporting a vulnerability

Please do not publish exploit details, credentials, invitation tokens, personal data, or reproducible attack instructions in a public issue.

Use GitHub's private vulnerability reporting feature for this repository when it is enabled. If private reporting is unavailable, contact the maintainers through a private channel before sharing sensitive technical details.

Include:
- A concise description of the affected component.
- The potential impact.
- A minimal safe reproduction outline.
- A suggested mitigation, if known.

Do not include real tokens, private user records, or screenshots containing secrets.

## Credential exposure

If a credential is exposed:
1. Revoke or rotate it at its provider immediately.
2. Replace the corresponding Worker secret.
3. Verify the previous credential is invalid.
4. Review logs and repository history for further exposure.
5. Document the incident without reproducing the secret.

See [docs/SECURITY.md](docs/SECURITY.md) for the full security and privacy baseline.
