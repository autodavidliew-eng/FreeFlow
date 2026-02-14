# Security Checks (GitHub Actions)

This repo uses a dedicated `security.yml` workflow for dependency scanning,
secret detection, and container image vulnerability scans.

## What Runs

- **Dependency review (PRs only):** Blocks PRs that introduce high-severity
  vulnerable dependencies.
- **`pnpm audit` (prod deps):** Audits production dependencies at high severity.
- **Gitleaks:** Scans for hard-coded secrets across the repo history.
- **Trivy image scan:** Builds images for each Dockerfile and scans them.

## Triggers

- Pull requests
- Pushes to `main`
- Weekly schedule (Monday, 03:00 UTC)
- Manual (`workflow_dispatch`)

## Secrets

- `GITHUB_TOKEN` is used by Gitleaks.
- If your org requires a Gitleaks license, set `GITLEAKS_LICENSE` in repo or org
  secrets.

## Notes

- Trivy scans only images that have Dockerfiles defined in the matrix.
- If you add or remove services, update the matrix in
  `.github/workflows/security.yml`.
- Consider lowering or raising the audit severity threshold based on your risk
  tolerance.
