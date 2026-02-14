# Data Retention Policy

This document defines a baseline data retention policy for FreeFlow.
Adjust periods based on legal and regulatory requirements.

## PII Classification

- **High:** names, emails, phone numbers, addresses
- **Medium:** IP addresses, device identifiers
- **Low:** aggregated metrics, anonymized analytics

## Retention Schedule (Example)

- **High PII:** 180 days, then delete or anonymize
- **Medium PII:** 365 days
- **Low PII:** 2 years
- **Audit logs:** 1 year

## Deletion Workflow

1. Identify records by classification.
2. Run deletion or anonymization job.
3. Validate removal and update audit log.
4. Confirm backups expire within retention window.

## Notes

- Document legal holds and exceptions.
- Retention applies to backups and replicas too.
