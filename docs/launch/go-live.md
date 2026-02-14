# Go-Live Checklist

This checklist covers pre-launch validation, rollout, and post-launch monitoring.

## Pre-Launch Verification

- Release tag created and images available
- Environment values pinned to release tag
- Security scans green
- Smoke tests pass in staging
- Rollback plan confirmed

## Rollout Steps

1. Announce maintenance window (if needed).
2. Deploy to production with Helm.
3. Monitor dashboards for errors and latency.
4. Validate core user journeys.

## Post-Launch Monitoring

- Track error rates and latency for 24 hours
- Review alerts and logs for anomalies
- Collect early user feedback
