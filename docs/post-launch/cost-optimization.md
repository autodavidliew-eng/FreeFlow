# Cost Optimization Plan

Target reduction: 15%

## Compute Sizing

- Review CPU/memory usage per service
- Right-size requests/limits based on p95 usage
- Reduce over-provisioned replicas where safe

## Storage Lifecycle

- Set lifecycle policies on logs and backups
- Reduce retention where compliant
- Archive cold data to cheaper tiers

## Unused Resources

- Identify unused services or environments
- Remove stale PVCs and orphaned volumes
- Prune unused images and artifacts

## Notes

- Do not trade off SLOs for cost savings.
- Track cost changes after each optimization.
