# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |
| < 0.1.0 | No |

This project follows version-controlled maintenance from the main branch and tagged release versions.

## Reporting A Vulnerability

If you discover a security issue, please do not disclose it publicly first.

Please report by opening a private security issue or contacting the project owner with:

- Summary of vulnerability
- Affected routes or components
- Reproduction steps
- Potential impact
- Suggested remediation, if available

## Security Response Process

1. Acknowledge report.
2. Validate and triage severity.
3. Create a fix on a protected branch.
4. Add regression tests where applicable.
5. Release patch and update notes.

## Baseline Security Controls

- Server-verified session cookies for protected flows
- Same-origin checks for sensitive endpoints
- Input validation via Zod
- Request size caps
- Rate limiting and idempotency handling
- Security-focused response headers

## Dependency And Version Control Hygiene

- Keep dependencies updated regularly.
- Pin and review critical security dependencies.
- Run lint and tests before merge.
- Use pull requests for code review and audit trail.
