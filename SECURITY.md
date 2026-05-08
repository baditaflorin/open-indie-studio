# Security Policy

## Supported Versions

The latest tagged release and the `main` branch receive security fixes.

## Reporting a Vulnerability

Please report vulnerabilities privately to security@example.com.

Do not open a public issue for active vulnerabilities.

## Baseline

- No secrets are committed to the repository.
- The frontend never stores API keys, tokens, or credentials.
- Optional local LLM calls use user-owned local endpoints only.
- `gitleaks protect --staged` is wired into the pre-commit hook when `gitleaks` is installed locally.
